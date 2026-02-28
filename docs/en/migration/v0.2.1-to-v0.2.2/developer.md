# Upgrading from v0.2.1 to v0.2.2 — Developer Guide

This page is for **SharwAPI plugin developers**, covering the new interface capabilities introduced in v0.2.2.

v0.2.2 contains **no breaking changes for plugin code**. All existing plugin code compiles without modification.

::: warning Note for plugin authors who also deploy
v0.2.2 includes a user-side breaking change: the plugin directory has been renamed from `Plugins/` to `plugins/`. If you deploy on Linux or macOS, see the [User-side Migration Guide](./user) for the required steps.
:::

## Summary of Changes

| Type | Member | Description |
|---|---|---|
| New property | `DataDirectory` | Full path to the plugin's dedicated data directory |
| New method | `GetDataPath(string)` | Shorthand for combining a path relative to the data directory |
| Host behavior | Auto directory creation | Host automatically creates the `DataDirectory` on startup |

## Required Actions

### Update the `sharwapi.Contracts.Core` package reference

If your plugin uses `Version="0.2.*"`, NuGet restore will automatically pick up v0.2.5 — **no manual action required**.

If you have a pinned version, update it to `0.2.5`:

```xml
<!-- Before -->
<PackageReference Include="sharwapi.Contracts.Core" Version="0.2.4" />

<!-- After -->
<PackageReference Include="sharwapi.Contracts.Core" Version="0.2.5" />
```

After rebuilding, both new members are available. **No existing code needs to change.**

## Using the New Capabilities (Optional)

### Storing files with `DataDirectory`

Access the dedicated directory path directly in your plugin:

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var dbPath = Path.Combine(DataDirectory, "plugin.db");
    services.AddDbContext<MyDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));
}
```

### Simplifying path concatenation with `GetDataPath`

`GetDataPath` is equivalent to `Path.Combine(DataDirectory, relativePath)`, but more concise:

```csharp
// Equivalent
var keyPath1 = Path.Combine(DataDirectory, "keys", "private.pem");
var keyPath2 = GetDataPath("keys/private.pem");  // recommended
```

### Working with configuration: supporting user-defined paths

The recommended pattern is to set path fields to **relative path strings** in `DefaultConfig`. The host writes them to the config file on first run. In `RegisterServices`, use `GetDataPath` to resolve them to absolute paths at runtime.

```csharp
public object? DefaultConfig => new MySettings
{
    // ✅ Recommended: store relative paths in DefaultConfig
    PrivateKeyPath = "keys/private.pem"
};

public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var settings = configuration.Get<MySettings>()!;

    // GetDataPath resolves the relative path to an absolute path:
    // "private.pem"          → {DataDirectory}/private.pem
    // "keys/private.pem"     → {DataDirectory}/keys/private.pem
    var resolvedPath = GetDataPath(settings.PrivateKeyPath);

    if (!File.Exists(resolvedPath))
        GenerateKeyPair(resolvedPath);

    services.Configure<MySettings>(configuration);
}
```

### Customizing the data directory location

For a standardized and predictable plugin ecosystem, **storing files outside the plugin's dedicated data directory is not recommended**. All persistent files produced by a plugin should reside under `DataDirectory` (`{BaseDir}/data/{Name}/`).

Keeping files within the dedicated directory ensures a clean structure, makes backups straightforward, and keeps all plugin data co-located under a single `data/` root for easy migration and deployment.

## User-side Changes

There are **no manual actions required** for deployment/operations users in this release.

After updating the host to v0.2.2, it will automatically create a `data/{plugin-name}/` directory for each loaded plugin on startup. If the directory already exists, it is left untouched.
