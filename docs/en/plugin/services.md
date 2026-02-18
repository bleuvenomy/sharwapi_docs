# Register Services (RegisterServices)

`RegisterServices` is the method in a plugin used to **register dependency injection services**.

Its primary role is to establish **dependencies**. In modern software development, we use a "Dependency Injection (DI)" container to manage objects. Through this method, you can:

1.  **Request Services (Consumer)**: Configure external tools your plugin needs (like HTTP clients, database connections).
2.  **Provide Services (Provider)**: Register your business logic classes so they can be used by other parts of your plugin or even other plugins.

Meanwhile, the dependency injection container automatically injects required services into consumers and manages their lifecycle.

## Hosting Model

SharwAPI uses the "Hosting Model" of [Dependency Injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) to manage objects. This means you don't need to manually write `new ServiceClass()` in your code; instead, the main program automatically manages objects and injects dependencies based on your configuration.

This approach offers two main advantages:
1. **Lifecycle Management**: The system automatically handles object disposal, preventing memory leaks.
2. **Instance Sharing**: Easily achieve data sharing across plugins or requests.

## Service Lifetimes

When registering services, you need to choose the appropriate [Dependency Injection Lifetime](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes) based on business needs, which determines how long an object exists in memory.

### 1. Transient
* **Behavior**: A new object is created every time the service is requested. Used and discarded.
* **Use Case**: Lightweight, stateless utility classes (like simple calculators, data formatters).
* **Example**: `services.AddTransient<MyService>();`

### 2. Scoped
* **Behavior**: Within the processing of a single HTTP request, multiple requests for the service return the same object. The object is disposed of when the request ends.
* **Use Case**: Database contexts (`DbContext`) or business services that need to maintain state within a request. This is the most common pattern in development.
* **Example**: `services.AddScoped<MyService>();`

### 3. Singleton
* **Behavior**: Only one object exists for the entire lifetime of the application. All requests and plugins share this single instance.
* **Use Case**: Caching services, global configuration reading, background scheduled tasks.
* **Example**: `services.AddSingleton<MyService>();`

## Common Operations

### Requesting External Resources (I am a Consumer)

When your plugin needs to access external networks, you should register the corresponding client (e.g., using `HttpClient`).

```csharp
// Register a client named "google" and preset the base address
services.AddHttpClient("google", client =>
{
    client.BaseAddress = new Uri("https://google.com");
    client.DefaultRequestHeaders.Add("User-Agent", "SharwAPI-Plugin");
});

```

### Providing Public Services (I am a Provider)

If you write a powerful class (e.g., a database operation service) and want it to be used by the **current plugin** or even **other plugins**, you need to register it in the container.

```csharp
// Register as a singleton service: The entire system shares the same MyDatabaseService instance
services.AddSingleton<IDatabaseService, MyDatabaseService>();

```

Once registered, any plugin (including your own) simply needs to declare an `IDatabaseService` parameter in its constructor or route handler method, and the main program will automatically inject the instance you registered.

### Reading Configuration

The second parameter of the method, `IConfiguration`, is used to access configuration data. It contains the configuration file with the same name under the plugin directory (`config/your-plugin-name.json`).

```csharp
// Method 1: Read a specific field directly
var apiKey = configuration["ApiKey"];

// Method 2: Bind a configuration section to an object (Recommended)
services.Configure<MyOptions>(configuration);
```

For more details, see [Configuration Handling](/en/plugin/configuration)


::: danger Do Not Build Manually
Please **NEVER** call `services.BuildServiceProvider()` inside this method.

```csharp
// Incorrect Example
var provider = services.BuildServiceProvider(); 

```

This operation forces the creation of a **container copy** independent of the main program, leading to serious consequences:

1. **Singleton Failure**: The main program and your plugin will hold separate singleton objects, making data communication impossible.
2. **Dependency Loss**: Your plugin will not be able to obtain other services registered afterward.
3. **Memory Risk**: This container copy might not be disposed of correctly, leading to memory leaks.
:::