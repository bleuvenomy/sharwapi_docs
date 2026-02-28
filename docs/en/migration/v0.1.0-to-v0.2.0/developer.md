# Migrating from v0.1.0 to v0.2.0 — Developers

This page is for **SharwAPI plugin developers**, covering interface changes and migration steps when upgrading from v0.1.0 to v0.2.0.

If you only deploy and operate the host, please read the [User Migration Guide](./user).

## Interface: No Breaking Changes, But Recompilation Required

All **existing method signatures** in `IApiPlugin` are unchanged in v0.2.0:

- [`RegisterServices(IServiceCollection, IConfiguration)`](/en/plugin/services)
- [`Configure(WebApplication)`](/en/plugin/middleware)
- [`RegisterRoutes(IEndpointRouteBuilder, IConfiguration)`](/en/plugin/routes)
- [`RegisterManagementEndpoints(IEndpointRouteBuilder)`](/en/plugin/management-endpoints)

All **new members** have default implementations. However, there are two required migrations in this upgrade, both of which require **recompiling** the plugin:

> ✅ All original `IApiPlugin` members are **fully compatible** — no logic changes required.
>
> ⚠️ You must update your plugin's **target framework from `net9.0` to `net10.0`** and recompile.
>
> ⚠️ You must switch the `sharwapi.Contracts.Core` reference **from `ProjectReference` to a NuGet `PackageReference`**.

## Required Migrations

There are two required migrations for plugin developers in this upgrade. Both require **recompiling your plugin**.

### Step 1: Upgrade Target Framework to .NET 10

`sharwapi.Contracts.Core` now targets `net10.0`. Update the target framework in your plugin's `.csproj`:

```xml
<!-- Before (v0.1.0) -->
<TargetFramework>net9.0</TargetFramework>

<!-- After (v0.2.x) -->
<TargetFramework>net10.0</TargetFramework>
```

### Step 2: Switch to NuGet Package Reference

In v0.1.0, `sharwapi.Contracts.Core` was referenced by cloning the source repository and using a `ProjectReference`. Starting with v0.2.x, it is distributed as a NuGet package from a private feed.

**Step 2a**: Create (or update) `nuget.config` in your plugin project directory to add the SharwAPI private feed:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="SharwAPI" value="https://nuget.hope-now.top/v3/index.json" />
  </packageSources>
</configuration>
```

**Step 2b**: Replace the `ProjectReference` for `sharwapi.Contracts.Core` in your `.csproj` with a `PackageReference`:

```xml
<!-- Before (v0.1.0) -->
<ProjectReference Include="..\sharwapi.Contracts.Core\sharwapi.Contracts.Core.csproj" />

<!-- After (v0.2.x) -->
<PackageReference Include="sharwapi.Contracts.Core" Version="0.2.*" />
```

::: tip About the version specifier
`Version="0.2.*"` automatically resolves to the latest stable release in the 0.2.x series. To pin a specific version, replace it with a full version number (e.g. `Version="0.2.0"`).
:::

**Step 2c**: The `sharwapi.Contracts.Core` source directory is no longer needed and can be removed from your workspace.



## Interface Comparison

### v0.1.0

```csharp
public interface IApiPlugin
{
    string Name { get; }
    string Version { get; }
    string DisplayName { get; }

    void RegisterServices(IServiceCollection services, IConfiguration configuration);
    void Configure(WebApplication app);
    void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration);
    void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup) { ... }
}
```

### v0.2.x (new members marked with `+`)

```csharp
public interface IApiPlugin
{
    string Name { get; }
    string Version { get; }
    string DisplayName { get; }

  + IReadOnlyDictionary<string, string> Dependencies => new Dictionary<string, string>();
  + bool ValidateDependency(IReadOnlyDictionary<string, string> loadedPluginVersions) => true;
  + bool UseAutoRoutePrefix { get => false; }
  + object? DefaultConfig => null;

    void RegisterServices(IServiceCollection services, IConfiguration configuration);
    void Configure(WebApplication app);
    void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration);
    void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup) { ... }
}
```

## Important Change: `configuration` Parameter Semantics

This is the **most impactful change** for plugin logic in this upgrade.

In v0.2.x, the `configuration` parameter in both `RegisterServices()` and `RegisterRoutes()` now provides the **plugin-specific configuration** (from `config/{PluginName}.json`) instead of the global `appsettings.json`:

| Method | v0.1.0 `configuration` source | v0.2.x `configuration` source |
|---|---|---|
| `RegisterServices()` | Global `appsettings.json` | Plugin-specific `config/{PluginName}.json` |
| `RegisterRoutes()` | Global `appsettings.json` | Plugin-specific `config/{PluginName}.json` |

This means plugin configuration files are fully owned by the plugin — no more worrying about key name conflicts with other plugins.

### How to Migrate

**Old (v0.1.0):** Plugin reads its custom section from the global config

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // Read from the MyPlugin section in appsettings.json
    var settings = configuration.GetSection("MyPlugin").Get<MyPluginSettings>();
    services.AddSingleton(settings);
}
```

**New (v0.2.x):** Plugin reads from its dedicated config file — no section name needed

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // configuration IS config/MyPlugin.json — bind from the root
    var settings = configuration.Get<MyPluginSettings>();
    services.AddSingleton(settings ?? new MyPluginSettings());
}
```

Also move any plugin-specific configuration from `appsettings.json` to `config/{PluginName}.json`, and provide defaults via `DefaultConfig` (see below).

## New Features Guide

### 1. Declare Plugin Dependencies (`Dependencies`)

If your plugin depends on other plugins, declare them here and the host will check them at startup:

```csharp
public IReadOnlyDictionary<string, string> Dependencies => new Dictionary<string, string>
{
    // Format: { "PluginName", "version range" }
    { "sharwapi.Plugin.guard", "[1.0,2.0)" },  // guard plugin 1.0.x, excluding 2.0
    { "sharwapi.Plugin.db", "*" }               // any version of db plugin
};
```

Version range format follows NuGet conventions, in two categories:

**Interval Notation**

| Format | Rule | Description |
|---|---|---|
| `1.0` | x ≥ 1.0 | Minimum version (inclusive) — **recommended for declaring minimum dependencies** |
| `[1.0]` | x == 1.0 | Exact version match |
| `(1.0,)` | x > 1.0 | Minimum version (exclusive) |
| `(,1.0]` | x ≤ 1.0 | Maximum version (inclusive) |
| `(,1.0)` | x < 1.0 | Maximum version (exclusive) |
| `[1.0,2.0]` | 1.0 ≤ x ≤ 2.0 | Exact range (both inclusive) |
| `(1.0,2.0)` | 1.0 < x < 2.0 | Exact range (both exclusive) |
| `[1.0,2.0)` | 1.0 ≤ x < 2.0 | Mixed range (common: inclusive low, exclusive high) |

**Floating Version**

| Format | Description |
|---|---|
| `*` | Any version; resolves to the highest stable version |
| `1.1.*` | Highest stable version in the 1.1.x series |

If a dependency is not satisfied, the plugin is skipped and a warning is logged. The host continues loading other plugins.

### 2. Custom Dependency Validation (`ValidateDependency()`)

For complex scenarios that cannot be expressed with declarative syntax:

```csharp
public bool ValidateDependency(IReadOnlyDictionary<string, string> loadedPluginVersions)
{
    // loadedPluginVersions contains all plugins that passed stage-one dependency checks
    // Return false to prevent this plugin from loading
    if (!loadedPluginVersions.TryGetValue("sharwapi.Plugin.auth", out var authVersion))
        return false;

    // Example: only compatible with auth plugin 2.x
    return authVersion.StartsWith("2.");
}
```

The default implementation returns `true` (no additional validation). Override only when needed.

### 3. Enable Automatic Route Prefix (`UseAutoRoutePrefix`)

When enabled, routes registered in `RegisterRoutes()` automatically receive a `/{PluginName}/` prefix — no need to write it manually in every route:

```csharp
public bool UseAutoRoutePrefix => true;

public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // Actual path: /my.plugin/hello (not just /hello)
    app.MapGet("/hello", () => "Hello from plugin!");
}
```

::: tip
The route prefix can be overridden by the host operator via the `RouteOverride` section in `appsettings.json`, but only alphanumeric characters are allowed. See the [User Migration Guide](./user#step-3-use-route-prefix-overrides-optional).
:::

### 4. Provide Default Configuration (`DefaultConfig`)

When `config/{PluginName}.json` does not exist, the host serializes the object returned by `DefaultConfig` to JSON and creates the file automatically:

```csharp
public object? DefaultConfig => new MyPluginSettings
{
    Host = "localhost",
    Port = 3306,
    Enabled = true
};
```

It is recommended to define a settings class with default values:

```csharp
public class MyPluginSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 3306;
    public bool Enabled { get; set; } = true;
}
```

## Complete Migration Example

The following shows a before/after comparison of migrating a v0.1.0 plugin to v0.2.x:

### v0.1.0 Plugin

```csharp
public class MyPlugin : IApiPlugin
{
    public string Name => "my.plugin";
    public string Version => "1.0.0";
    public string DisplayName => "My Plugin";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        // Read from global config
        var settings = configuration.GetSection("MyPlugin").Get<MyPluginSettings>()
                       ?? new MyPluginSettings();
        services.AddSingleton(settings);
    }

    public void Configure(WebApplication app) { }

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // Full path written manually
        app.MapGet("/my.plugin/hello", () => "Hello!");
    }
}
```

### v0.2.x Plugin (Recommended)

```csharp
public class MyPlugin : IApiPlugin
{
    public string Name => "my.plugin";
    public string Version => "1.0.0";
    public string DisplayName => "My Plugin";

    // New: automatic route prefix
    public bool UseAutoRoutePrefix => true;

    // New: default config (auto-generated on first startup)
    public object? DefaultConfig => new MyPluginSettings();

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        // configuration is now config/my.plugin.json — bind from the root
        var settings = configuration.Get<MyPluginSettings>() ?? new MyPluginSettings();
        services.AddSingleton(settings);
    }

    public void Configure(WebApplication app) { }

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // No need to write the prefix manually — UseAutoRoutePrefix handles it
        app.MapGet("/hello", () => "Hello!");
    }
}
```

## FAQ

**Q: My plugin doesn't need any configuration. Do I need to implement `DefaultConfig`?**

No. The default returns `null` and the host will not create a config file.

**Q: If I don't update my plugin code and just deploy to v0.2.x, what happens?**

First, because the host and `sharwapi.Contracts.Core` have been upgraded to .NET 10, plugins must be recompiled (updating the target framework to `net10.0`) to load correctly. If you only update the target framework without changing other code, functionality is mostly compatible, but with two differences:
1. The configuration source in `RegisterServices()` and `RegisterRoutes()` has changed — configuration previously read from `appsettings.json` sections will not be found (since the plugin-specific config file will be empty), potentially causing the plugin to use default values instead of your intended configuration.
2. Routes will not be automatically prefixed (since `UseAutoRoutePrefix` defaults to `false`), matching v0.1.0 behavior.
