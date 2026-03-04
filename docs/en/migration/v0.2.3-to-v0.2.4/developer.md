# Upgrading from v0.2.3 to v0.2.4 — Developer Guide

This page is for developers who **build SharwAPI plugins**, covering new capabilities available when upgrading to v0.2.4.

v0.2.4 (Contracts v0.2.6) introduces **no breaking changes to plugin code**. All existing plugins compile and load without any modifications.

## Summary of Changes

| Type | Description |
|---|---|
| New interface method | `IApiPlugin.OnRoutePrefixResolved(string, bool)` with a default empty implementation |

## Required Actions

Upgrade the `sharwapi.Contracts.Core` package to **v0.2.6**. No other changes to existing plugin code are needed.

## New Capabilities (Optional)

### Detecting route prefix overrides

Host operators can change your plugin's route prefix to any alphanumeric string via the `RouteOverride` section in `appsettings.json`. Previously, plugins had no way to detect this. If your plugin needs to know its final effective route prefix at startup (e.g. for logging, self-describing endpoints, or internal path construction), override `OnRoutePrefixResolved`:

```csharp
public class MyPlugin : IApiPlugin
{
    private string _routePrefix = string.Empty;

    public string Name => "myplugin";
    public bool UseAutoRoutePrefix => true;

    public void OnRoutePrefixResolved(string resolvedPrefix, bool isOverridden)
    {
        _routePrefix = resolvedPrefix;
        if (isOverridden)
        {
            // The prefix was changed by the operator via RouteOverride
        }
    }

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // _routePrefix already holds the final effective prefix at this point
        app.MapGet("/info", () => new { prefix = _routePrefix });
    }
}
```

::: tip Call order
`OnRoutePrefixResolved` is called before `RegisterRoutes`, so it is safe to use the value captured in the callback inside `RegisterRoutes`.
:::

For full details, see [Route Registration → Detecting Route Prefix Changes](/en/plugin/routes#detecting-route-prefix-changes-onrouteprefixresolved).
