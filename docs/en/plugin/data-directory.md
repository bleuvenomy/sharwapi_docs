# Plugin Data Directory

Since v0.2.2, the `IApiPlugin` interface provides the `DataDirectory` property and `GetDataPath` method for storing persistent files in a plugin's dedicated directory.

## DataDirectory

`DataDirectory` returns the full path to the plugin's dedicated data directory. The default value is `{BaseDir}/data/{PluginName}/`.

```csharp
// Interface default implementation
string DataDirectory => Path.Combine(AppContext.BaseDirectory, "data", Name);
```

The host **automatically creates** this directory when loading the plugin. Plugins do not need to call `Directory.CreateDirectory` manually.

### Example Directory Structure

```
{BaseDir}/
├── config/
│   └── my.plugin.json        ← plugin configuration file
├── plugins/
│   └── my.plugin.dll
└── data/
    └── my.plugin/            ← DataDirectory, created automatically by the host
        ├── plugin.db
        └── keys/
            └── private.pem
```

::: tip
`DataDirectory` is intended to be used as a read-only property and should not be overridden. For a standardized and predictable plugin ecosystem, all persistent files produced by a plugin should always reside within the plugin's dedicated data directory.
:::

## GetDataPath

`GetDataPath(string relativePath)` is a path-combining shorthand for `DataDirectory`, resolving a relative path to a full absolute path:

```csharp
string GetDataPath(string relativePath) => Path.Combine(DataDirectory, relativePath);
```

### Example

```csharp
// Equivalent expressions
var path1 = Path.Combine(DataDirectory, "keys", "private.pem");
var path2 = GetDataPath("keys/private.pem");  // ✅ Recommended — more concise
```

Multi-level subdirectories are supported. `Path.Combine` handles cross-platform path separators automatically:

```csharp
GetDataPath("keys/2026/private.pem")
// Windows: {DataDirectory}\keys\2026\private.pem
// Linux:   {DataDirectory}/keys/2026/private.pem
```

## Using in RegisterServices

### Basic usage: storing a single file

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var dbPath = GetDataPath("plugin.db");
    services.AddDbContext<MyDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));
}
```

### Working with configuration: path driven by config

The recommended pattern is to set path fields to **relative path strings** in `DefaultConfig`, then resolve them to absolute paths via `GetDataPath` in `RegisterServices`. This lets users see where files are stored without touching any code:

```csharp
// 1. Define the settings model
public class MySettings
{
    public string DatabasePath   { get; set; } = "";
    public string PrivateKeyPath { get; set; } = "";
}

// 2. Pre-fill relative paths in DefaultConfig
public object? DefaultConfig => new MySettings
{
    DatabasePath   = "plugin.db",
    PrivateKeyPath = "keys/private.pem"
};

// 3. Resolve paths in RegisterServices
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var settings = configuration.Get<MySettings>()!;

    // GetDataPath resolves the relative paths from config to absolute paths
    var dbPath  = GetDataPath(settings.DatabasePath);
    var keyPath = GetDataPath(settings.PrivateKeyPath);

    // Generate key pair if it doesn't exist yet
    if (!File.Exists(keyPath))
        GenerateKeyPair(keyPath);

    services.AddDbContext<MyDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));

    services.Configure<MySettings>(configuration);
}
```

After the first run, the generated `config/my.plugin.json` will look like:

```json
{
  "DatabasePath": "plugin.db",
  "PrivateKeyPath": "keys/private.pem"
}
```

Users reading the config can clearly see the relative locations and understand the files live inside `data/my.plugin/`.

### Generating files on demand in routes

The data directory can also be used inside route handlers:

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    app.MapGet("/export", () =>
    {
        var outputPath = GetDataPath($"exports/export-{DateTime.Now:yyyyMMddHHmmss}.csv");

        // Ensure the subdirectory exists
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        File.WriteAllText(outputPath, "id,name\n1,example");

        return Results.Ok(new { file = outputPath });
    });
}
```
