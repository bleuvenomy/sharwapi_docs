# Management Endpoints (RegisterManagementEndpoints)

`RegisterManagementEndpoints` is a dedicated channel for plugins to expose **backend management features**. Unlike `RegisterRoutes` which is for normal users, endpoints here are typically used for operational purposes, such as viewing plugin runtime status, hot-reloading configurations, etc.

::: warning ⚠️ Experimental Feature (PoC)
This feature is currently in the **Proof of Concept (PoC)** stage.
This means:
1.  **No Default Protection**: By default, endpoints registered via this method have **no authentication**. Anyone who can access the server can call them, posing severe security risks.
2.  **Standard Not Set**: The data interaction format (Schema) for management endpoints has not been standardized, and future versions may introduce breaking changes.

**It is recommended to use this feature only in development, debugging, or trusted intranet environments, and strictly avoid relying on it in production.**
:::

## Managed Route Group

Unlike `RegisterRoutes`, the `IEndpointRouteBuilder` received by `RegisterManagementEndpoints` is a **"Managed Route Group"**.

The caller (usually the `apimgr` management plugin or the main program) has already preset a fixed route prefix for you (usually `/admin/plugin/{your-plugin-name}`).

**This means**:
* You **do not need** and should not manually create `MapGroup`.
* You **cannot** modify this prefix; you can only define sub-paths based on it.

## Default Implementation (Optional)

In the **Plugin Protocol Library**, this method provides a default empty implementation.

If your plugin does not need backend management features, you can completely ignore this method without overriding it in your code.

## Common Operations Guide

### Exposing Runtime Status

This is the most common scenario. You can register a GET endpoint to return current internal metrics of the plugin (such as cache count, connection status).

```csharp
public void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    // Note: No need to write plugin name prefix here
    // Final access URL might be: GET /admin/plugin/sharw.demo/status
    
    managementGroup.MapGet("/status", (IMyService service) => 
    {
        return new 
        { 
            IsRunning = true, 
            CacheItems = service.GetCount(),
            Uptime = DateTime.Now - service.StartTime
        };
    });
}

```

### Dynamic Configuration Update

You can register a POST endpoint to allow administrators to dynamically modify plugin configuration without restarting the main program.

```csharp
public void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    // Final access URL might be: POST /admin/plugin/sharw.demo/config
    
    managementGroup.MapPost("/config", (MyConfig newConfig, IOptionsMonitor<MyConfig> monitor) => 
    {
        // Execute configuration hot-reload logic
        // ...
        
        return Results.Ok("Configuration updated, takes effect immediately.");
    });
}

```

## Notes

::: warning Do Not Duplicate Prefix
Remember that `managementGroup` already contains the plugin name. If you call `managementGroup.MapGroup($"/{Name}")` again, the final URL will become `/admin/plugin/{Name}/{Name}/...`, resulting in duplicate paths that are hard to access.
:::

::: warning Security Risk Alert
Currently, this feature **does not** automatically integrate the authentication system. If you expose sensitive operations here (such as "Clear Database"), be sure to implement simple token checks or IP whitelist restrictions yourself in the code; otherwise, anyone can trigger the operation.
:::