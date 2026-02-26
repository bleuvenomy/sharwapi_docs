# Route Registration (RegisterRoutes)

`RegisterRoutes` is the core method for a plugin to define its public API endpoints. It is called before the main program starts, serving as the central part of the plugin to establish the mapping between **API requests** and **code processing**.

## Route Prefix Management

To standardize the API structure and avoid plugin conflicts, SharwAPI provides two route management modes.

### Automatic Prefix Mode (Recommended)

This is the preferred mode for new plugins (version > v0.2.0). The main program automatically creates a standardized route group for your plugin (`/{plugin-name}`, e.g., `/myplugin`) and passes this group to the `RegisterRoutes` method.

**How to Enable**: Override the `UseAutoRoutePrefix` property in your plugin class and set it to `true`.

```csharp{3-5}
public class MyPlugin : IApiPlugin
{
    public string Name => "sharw.demo";
    // Enable auto-prefix: The main program will automatically create a /sharw.demo route group for you
    public bool UseAutoRoutePrefix => true;

    // Implementation of other IApiPlugin members...

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // Final URL: GET /sharw.demo/hello //[!code highlight]
        app.MapGet("/hello", () => "Hello World");
    }
}

```

### Manual Mode (Legacy)

This is the default mode (`UseAutoRoutePrefix` defaults to `false`). In this mode, the main program passes **`WebApplication` (the root route builder)**, and you must manage prefixes manually. It is only used for legacy plugins or special scenarios requiring a completely custom route structure.

This also means you are operating on the global routing context: if you do not manually isolate routes with `MapGroup`, endpoints will be mounted directly at the root path and can easily conflict with other plugins or host endpoints.

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // You must manually create route groups, otherwise you will pollute the root path
    // MapGroup() can be used to append paths
    var group = app.MapGroup("/brrr").MapGroup("/hallo"); //[!code highlight]
    // Final URL: GET /brrr/hallo/bonjour
    group.MapGet("/bonjour", () => "Hello World");
}

```

## Common Operations

*The following examples are based on the **Automatic Prefix Mode** (`UseAutoRoutePrefix => true`) and assume the plugin name is `myplugin`.*

### Basic Endpoint Definition

Using [Minimal API](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis) syntax, you can quickly define endpoints for various HTTP methods.

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // GET /api/myplugin/status
    app.MapGet("/status", () => "Running");

    // POST /api/myplugin/data
    app.MapPost("/data", (MyData data) => 
    {
        return Results.Ok($"Received: {data.Content}");
    });
}

```

### Using Tools (Service Injection)

The main program injects tools (services) registered in `RegisterServices`, which can be used directly here. You just need to declare the required types in the handler's parameter list.

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // Scenario: Need to use HttpClient to access external networks
    // Action: Declare IHttpClientFactory in parameters
    // Dependency Injection will automatically inject the dependency
    app.MapGet("/proxy", async (IHttpClientFactory clientFactory) => //[!code highlight]
    {
        var client = clientFactory.CreateClient("google");
        return await client.GetStringAsync("/");
    });
}

```

::: tip Why IHttpClientFactory?
You might wonder: **Why not inject HttpClient directly?**

Using a singleton `HttpClient` directly can lead to **stale DNS issues** (failing to detect when the target IP changes). Meanwhile, frequently creating new `HttpClient` instances can lead to **Socket exhaustion**.

`IHttpClientFactory` is a solution specially designed by ASP.NET Core:
1.  **Smart Management**: It maintains a connection pool in the background, reusing connections (avoiding port exhaustion) while refreshing periodically (detecting DNS changes).
2.  **On-Demand Production**: The "baidu" or "google" you registered is just a configuration template. Through the factory, you can produce configured, independent client instances at any time without interference.
:::

### Handling Request Parameters

Minimal API supports automatic binding of URL parameters, query strings, and request bodies.

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 1. Path Parameter: GET /api/myplugin/users/101
    app.MapGet("/users/{id}", (int id) => $"Find user with ID {id}");

    // 2. Query Parameter: GET /api/myplugin/search?keyword=sharw
    app.MapGet("/search", (string keyword) => $"Search keyword: {keyword}");

    // 3. Request Body (JSON): POST /api/myplugin/users
    // The main program automatically deserializes JSON data into a UserDto object
    app.MapPost("/users", (UserDto user) => 
    {
        return $"Received user: {user.Name}";
    });
}

```

### Authorization & Local Interception

If you need to protect a specific endpoint or execute logic only for specific endpoints (rather than global interception), use the following methods.

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // Authorization: Allow access only to authenticated requests
    app.MapGet("/secret", () => "Secret Data")
       .RequireAuthorization();

    // Local Interception (Filter): Pre/Post logic executed only for this route
    app.MapGet("/filtered", () => "Data")
       .AddEndpointFilter(async (context, next) =>
       {
           // Before execution
           Console.WriteLine("Endpoint execution starting...");
           
           var result = await next(context);
           
           // After execution
           Console.WriteLine("Endpoint execution finished");
           
           return result;
       });
}

```

## Notes

::: warning Asynchronous Processing
If your business logic involves I/O operations (like reading/writing databases, file operations, HTTP requests), be sure to use the `async/await` pattern.

* :x:**Incorrect**: `app.MapGet("/", (Db db) => db.Data.ToList());` (This blocks the main thread)
* :heavy_check_mark:**Correct**: `app.MapGet("/", async (Db db) => await db.Data.ToListAsync());`
:::

::: tip Avoid Using Controllers
Although the main program is technically compatible with traditional Controller syntax, it is not recommended for plugin development. Controllers introduce complex assembly scanning issues and extra resource overhead, while Minimal API is the preferred choice designed for such lightweight integration.
:::

::: tip Registration Order
Plugin route registration occurs after middleware configuration. This means all middleware registered in `Configure` will apply to these routes.
:::
