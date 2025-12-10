# RegisterServices 详解

`RegisterServices` 是插件生命周期中最早被调用的方法。在 API 框架的启动流程中，它会在 `WebApplication` 构建之前（即 `builder.Build()` 之前）被执行。

它的主要职责是将插件所需的**服务（Services）**、**配置（Options）**和其他依赖项注册到 ASP.NET Core 的全局依赖注入（DI）容器中。

通过此方法，插件可以利用框架提供的强大 DI 能力，实现松耦合、可测试和可维护的代码结构。

## 方法签名

```csharp
void RegisterServices(IServiceCollection services, IConfiguration configuration);
```

## 参数详解

### 1. IServiceCollection services

这是 ASP.NET Core 的服务集合。你可以通过它向容器中添加服务描述符（ServiceDescriptor）。

- **作用**：注册接口与其实现类的映射关系、注册单例对象、注册配置类等。
- **常用方法**：
  - `AddTransient<TService, TImplementation>()`: **瞬时生命周期**。每次从容器请求服务时，都会创建一个新的实例。适用于轻量级、无状态的服务。
  - `AddScoped<TService, TImplementation>()`: **作用域生命周期**。在同一个 HTTP 请求范围内，多次请求该服务会返回同一个实例；不同请求之间互不影响。这是 Web 开发中最常用的生命周期（如数据库上下文）。
  - `AddSingleton<TService, TImplementation>()`: **单例生命周期**。在整个应用程序生命周期内，只会在第一次请求时创建一个实例，后续所有请求都共享该实例。适用于缓存服务、配置服务等。

### 2. IConfiguration configuration

这是应用程序的配置根节点。它包含了来自 `appsettings.json`、环境变量、命令行参数等所有配置源的数据。

- **作用**：读取插件需要的配置信息。
- **建议**：通常配合 `services.Configure<T>` 使用，将配置绑定到强类型对象上，而不是在代码中到处使用 `configuration["Key"]`。

## 常见使用场景

### 1. 注册配置 (Options Pattern)

插件通常需要读取 `appsettings.json` 中的配置。推荐使用 **选项模式 (Options Pattern)** 将配置绑定到强类型类。

假设 `appsettings.json` 中有如下配置：

```json
{
  "MyPlugin": {
    "EnableFeature": true,
    "MaxRetries": 3
  }
}
```

**代码示例：**

```csharp
// 1. 定义配置类
public class MyPluginOptions
{
    public bool EnableFeature { get; set; }
    public int MaxRetries { get; set; }
}

// 2. 在 RegisterServices 中注册
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 将 "MyPlugin" 节点绑定到 MyPluginOptions 类
    // 之后可以在其他服务中通过构造函数注入 IOptions<MyPluginOptions> 来使用
    services.Configure<MyPluginOptions>(configuration.GetSection("MyPlugin"));
}
```

### 2. 注册业务服务

如果你的插件逻辑比较复杂，建议将业务逻辑封装在单独的服务类中，而不是全部写在 Controller 或 Plugin 类中。

**代码示例：**

```csharp
// 定义接口
public interface IMyPluginService
{
    string ProcessData(string input);
}

// 实现接口
public class MyPluginService : IMyPluginService
{
    public string ProcessData(string input) => $"Processed: {input}";
}

public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 注册为 Scoped 服务（推荐用于 Web 请求处理）
    services.AddScoped<IMyPluginService, MyPluginService>();
}
```

### 3. 注册 HttpClient

如果插件需要调用外部 API，推荐使用 `IHttpClientFactory`，而不是直接实例化 `HttpClient`。这可以有效管理连接池，避免端口耗尽问题。

**代码示例：**

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 注册一个命名的 HttpClient
    services.AddHttpClient("MyPluginClient", client =>
    {
        client.BaseAddress = new Uri("https://api.example.com/");
        client.DefaultRequestHeaders.Add("User-Agent", "Sharwapi-Plugin");
        client.Timeout = TimeSpan.FromSeconds(30);
    });
}
```

### 4. 注册后台任务 (Hosted Services)

如果插件需要在后台运行定时任务或长期运行的任务（如消息队列监听、定时清理缓存），可以注册 `IHostedService`。

**代码示例：**

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // MyBackgroundWorker 需要实现 IHostedService 接口或继承 BackgroundService
    services.AddHostedService<MyBackgroundWorker>();
}
```

## 最佳实践与注意事项

::: warning 命名冲突
由于所有插件共享同一个 DI 容器（`builder.Services`），且框架会依次遍历所有插件进行注册，因此建议在注册服务名称或配置节点时加上插件名称作为前缀，以避免与其他插件发生冲突。
例如：配置节点使用 `"MyPlugin:Setting"` 而不是 `"Setting"`；命名 HttpClient 使用 `"MyPluginClient"` 而不是 `"Client"`。
:::

::: danger 禁止构建容器
**绝对不要** 在此方法中调用 `services.BuildServiceProvider()`。

这样做会创建一个新的容器副本，导致：
1. **单例失效**：单例服务在不同容器中存在多个实例。
2. **依赖丢失**：无法获取后续注册的服务。
3. **内存泄漏**：创建的容器副本可能无法被正确释放。

请直接使用参数中的 `configuration` 或 `services` 进行操作。
:::

## 完整示例

下面是一个综合了配置注册、服务注册和 HttpClient 注册的完整示例：

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using sharwapi.Contracts.Core;

namespace sharwapi.Plugin.ComplexDemo;

public class ComplexPlugin : IApiPlugin
{
    public string Name => "complex-demo";
    public string DisplayName => "Complex Demo Plugin";
    public string Version => "1.0.0";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        // 1. 注册配置
        // 假设配置文件中有 "ComplexDemo" 节点
        var configSection = configuration.GetSection("ComplexDemo");
        services.Configure<ComplexPluginOptions>(configSection);

        // 2. 注册业务服务
        // 注册一个处理订单的服务，生命周期为 Scoped
        services.AddScoped<IOrderProcessor, OrderProcessor>();

        // 3. 注册 HttpClient
        // 为插件专门配置一个 HttpClient
        services.AddHttpClient("ComplexDemoApi", client =>
        {
            client.BaseAddress = new Uri("https://api.thirdparty.com/");
        });
        
        // 4. 注册后台清理任务
        services.AddHostedService<CacheCleanupService>();
    }
    
    public void Configure(WebApplication app) { }
    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration) { }
}
```
