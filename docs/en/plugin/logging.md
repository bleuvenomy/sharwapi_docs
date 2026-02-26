# Logging

In SharwAPI plugin development, logging is an important aspect.

## Usage Principles

Since the main program has already taken over the entire system's logging via `builder.Host.UseSerilog()`, **plugins do not need any special configuration, nor do they need to reference the Serilog package**.

Plugins only need to follow the standard hosting pattern and use the `ILogger<T>` interface. Logs will automatically flow to your configured console and files.

## Example Code

Suppose you want to log in `TokenAuthMiddleware`:

```csharp
using Microsoft.Extensions.Logging; // Must reference this namespace, it is the core of .NET Core logging abstraction

public class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    
    // 1. Define Logger Field
    // T in ILogger<T> (here TokenAuthMiddleware) is used to mark the Category of the log source.
    // This way, when viewing logs, we can clearly know which class generated this log.
    private readonly ILogger<TokenAuthMiddleware> _logger; 

    // 2. Request ILogger<T> in Constructor
    // The main program will automatically pass the configured Logger instance here.
    public TokenAuthMiddleware(RequestDelegate next, ILogger<TokenAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 3. Log (Supports Structured Logging Arguments)
        // Note: The placeholder {Path} is used here instead of string concatenation.
        // Serilog will capture the property name "Path" and property value context.Request.Path, saving it as structured data.
        // This performs better and is easier to search than _logger.LogInformation("Checking token for path: " + context.Request.Path).
        _logger.LogInformation("Checking token for path: {Path}", context.Request.Path);

        if (!IsTokenValid(context))
        {
            // LogWarning is used to log unexpected issues that do not crash the program.
            // Also uses structured logging to record the IP address for subsequent analysis of attack sources.
            _logger.LogWarning("Invalid token from IP: {IpAddress}", context.Connection.RemoteIpAddress);
            // ...
        }

        await _next(context);
    }
}
```

## Why This Approach?

*   **Decoupling**: The plugin only depends on standard interfaces (`Microsoft.Extensions.Logging`) and does not depend on a specific logging library (Serilog).
*   **Unified Management**: Log format, file path, and rolling policy are all controlled uniformly by the host program in `appsettings.json`, and the plugin does not need to care about them.
*   **Structured**: Although the code writes `{Path}`, Serilog will save it as structured data, facilitating subsequent queries.
