# Configuration Handling (Configuration)

Starting from version v0.2.0, the **Main Program** implements a **Configuration Isolation** and **Default Configuration Generation** mechanism. Plugins have independent configuration files (physically isolated) and no longer share configuration with the main program.

## Default Configuration Generation

The `IApiPlugin` interface defined in the **Plugin Protocol Library** includes a `DefaultConfig` property. You can override this property to provide a default configuration object for your plugin.

When the main program loads a plugin, it checks if the corresponding configuration file exists in the `config` directory (e.g., `config/sharwapi.guard.json`). If the file does not exist, the main program serializes the object returned by `DefaultConfig` into JSON and automatically writes it to that file.

### Example Code

Suppose we need to define a configuration containing protected paths for a plugin:

1. First, define the configuration model class:

```csharp
public class GuardSettings
{
    public List<ProtectedRoute> ProtectedRoutes { get; set; } = new();
}

public class ProtectedRoute 
{
    public string Path { get; set; }
    public string Token { get; set; }
}
```

2. Override `DefaultConfig` in the plugin main class:

```csharp
public class GuardPlugin : IApiPlugin
{
    public string Name => "sharwapi.guard";
    // ... Implement other properties

    // Define the default configuration object provided by the plugin
    public object? DefaultConfig => new GuardSettings
    {
        // Initialize ProtectedRoutes list with an example protected path
        ProtectedRoutes = new List<ProtectedRoute>
        {
            new ProtectedRoute { Path = "/api/secure", Token = "change-me" }
        }
    };

    // ...
}
```

This way, when a user runs the main program with this plugin installed for the first time, a JSON file containing the above content (`config/sharwapi.guard.json`) will be automatically generated in the `config` directory.

## Reading Configuration

In the `RegisterServices` method, the main program passes an `IConfiguration` object.

Due to configuration isolation, this `configuration` object **only contains the configuration content for this specific plugin**. This means it is already the root view of that plugin's configuration file, and you do not need to use `.GetSection("MyPluginSettings")` to find nodes.

You can bind it directly to your configuration class:

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // Bind the isolated configuration directly to GuardSettings
    // Because configuration corresponds to the root content of config/guard.json
    services.Configure<GuardSettings>(configuration);
}
```

### Using Configuration

After binding is complete, you can directly access configuration data in your services or controllers via the **Hosting Model** (e.g., using `IOptions<GuardSettings>`), without manually reading files or parsing JSON. The main program automatically manages the creation and injection of these objects.
