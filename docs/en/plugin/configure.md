# Configure Pipeline (Configure)

`Configure` is the method used by plugins to intervene in the HTTP request processing flow.

Its primary role is to **configure the middleware pipeline**. After the main program starts, all HTTP requests flow through this pipeline. By registering middleware here, you can intercept, read, or even modify every request and response passing through the system.

## Middleware Pipeline

The request processing model in ASP.NET Core is a "pipeline" structure.
1.  **Request Entry**: When a user accesses an API, the request passes through registered middleware sequentially.
2.  **Processing Logic**: Each middleware can choose to handle the request or pass it to the next middleware.
3.  **Response Return**: After the final business logic is executed, the response returns through the same path, passing through these middleware again (executing post-processing logic).

::: warning No Guaranteed Order
Middleware is executed in the order of registration traversal by the main program. Plugins themselves cannot control the loading order, which means:

Your middleware might be affected by middleware from other plugins (depending on plugin loading order). When writing code, try to avoid relying on a specific execution order of middleware.
:::

::: details Architecture Order
In the API framework, the plugin's `Configure` method is called after the global exception handler (`UseExceptionHandler`) and Swagger middleware. This means:
1. Exceptions thrown by your middleware will be caught by the global exception handler.
2. Your middleware is located after the Swagger UI and will not affect access to Swagger documentation.
:::

## Common Operations

### Simple Middleware (Inline)

If you only need to execute simple logic (like logging, appending response headers), you can write middleware directly using Lambda expressions.

```csharp
public void Configure(WebApplication app)
{
    app.Use(async (context, next) =>//[!code highlight]
    {
        // Pre-logic: Executed when request arrives
        Console.WriteLine($"[{Name}] Request received: {context.Request.Path}");

        // Pass request: Must call next(), otherwise request terminates here
        await next();//[!code highlight]

        // Post-logic: Executed when response returns
        Console.WriteLine($"[{Name}] Processing complete");
    });
}

```
::: details Avoid Blocking the Pipeline
If you forget to call `next()`, the request processing chain will **short-circuit** here. The request will never reach subsequent routes, and the user will receive a blank response or a 404 error.

Unless you explicitly want to intercept and terminate the request (e.g., detecting a malicious attack), always call `await next()` in your code.
:::

### Inter-Plugin Communication: Passing Context Info {#communication-between-plugins}

Unlike `RegisterServices`, which is mainly for registering provider services, `Configure` is mainly for passing information within the **request chain**.

You can use `HttpContext.Items` to share data between different plugins or middleware.

```csharp
public void Configure(WebApplication app)
{
    app.Use(async (context, next) =>
    {
        // Scenario: Parse user identity and pass to subsequent plugins
        if (context.Request.Headers.ContainsKey("X-User-ID"))
        {
            // Store data into current request context
            context.Items["CurrentUserId"] = context.Request.Headers["X-User-ID"];
        }

        await next();
    });
}

```

**Subsequent Usage**:
In the routes or logic of other plugins, this data can be read via `HttpContext.Items["CurrentUserId"]`.

::: warning Scope
Middleware registered in `Configure` is **globally effective**.
This means: The logic you write affects not only your own plugin but also the main program and API requests of all other plugins.

* **Recommended Practice**: Only register generic logic that must be globally effective here (like global authentication, global logging).
* **Alternative**: If you only want to intercept requests for your own plugin, use `.AddEndpointFilter(...)` in `RegisterRoutes`, or use Route Groups (MapGroup) for local interception.
:::

::: details Security Considerations
When your API is exposed to the public network, do not use request headers to pass fixed or short critical information. Visitors might spoof request headers to achieve certain purposes, as [**precedence shows**](https://www.cve.org/CVERecord?id=CVE-2025-55182). **Never trust identity information provided by the client**.

If you must use request headers, verify them or use internally generated random keys for signing—just ensure keys are passed securely.
:::

### Using Standard Middleware

You can also register built-in ASP.NET Core features or middleware provided by third-party libraries.

```csharp
public void Configure(WebApplication app)
{
    // Enable static file serving (make wwwroot folder in plugin directory accessible)
    app.UseStaticFiles();
    
    // Enable authentication middleware
    app.UseAuthentication();
}

```