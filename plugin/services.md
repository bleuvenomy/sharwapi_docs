# RegisterServices 详解

`RegisterServices` 是插件接入 ASP.NET Core 依赖注入（DI）系统的入口方法。它在应用构建（`builder.Build()`）之前执行。

它的主要职责是注册插件所需的**服务（Services）**、**配置（Options）**和其他依赖项。

## 方法签名

```csharp
void RegisterServices(IServiceCollection services, IConfiguration configuration);
```

## 参数详解

### 1. IServiceCollection services

DI 容器的构建器。用于定义服务的生命周期。

这是 ASP.NET Core 的服务集合。你可以通过它向容器中添加服务描述符（ServiceDescriptor）。

- **AddTransient**: **瞬时**。每次请求都创建新实例。适用于轻量、无状态服务。
- **AddScoped**: **作用域**。在一次 HTTP 请求内共享同一个实例。适用于大部分业务服务（如数据库操作）。
- **AddSingleton**: **单例**。全应用生命周期共享同一个实例。适用于缓存、配置等全局服务。


### 2. IConfiguration configuration

这是应用程序的配置根节点。它包含了来自 `appsettings.json`、环境变量、命令行参数等所有配置源的数据。

通常配合 `services.Configure<T>` 使用，将配置绑定到强类型对象上，而不是在代码中到处使用 `configuration["Key"]`。

## 常见使用场景

### 注册配置 (Options Pattern)

插件通常需要读取外部配置来控制其行为（例如：是否启用某个功能、重试次数、外部 API 的地址等）。在 ASP.NET Core 中，这些配置通常存储在 `appsettings.json` 文件中。

为了在代码中安全、方便地使用这些配置，推荐使用 **选项模式 (Options Pattern)**。这种模式可以将配置文件中的 JSON 片段绑定到一个强类型的 C# 类上。

首先，我们需要在 `appsettings.json` 中定义插件所需的配置项。为了避免与其他插件冲突，建议使用插件名称作为配置节的根节点。

**`appsettings.json`**：
```json
{
  "MyPlugin": {
    "EnableFeature": true,
    "MaxRetries": 3
  }
}
```

接下来，我们需要在代码中定义一个与上述 JSON 结构对应的类，并在 `RegisterServices` 方法中进行绑定。

**代码示例：**

```csharp
// 1. 定义配置类 (属性名需与 JSON 对应)
public class MyPluginOptions
{
    public bool EnableFeature { get; set; }
    public int MaxRetries { get; set; }
}

// 2. 注册绑定
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 将 "MyPlugin" 节绑定到 MyPluginOptions
    // 后续可通过注入 IOptions<MyPluginOptions> 使用
    services.Configure<MyPluginOptions>(configuration.GetSection("MyPlugin"));
}
```

### 注册业务服务

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
    // 注册为 Scoped (推荐用于 Web 请求)
    // 框架会在每次请求时自动创建 MyPluginService
    services.AddScoped<IMyPluginService, MyPluginService>();
}
```

### 注册 HttpClient

如果插件需要调用外部 API，推荐使用 `IHttpClientFactory`，而不是直接实例化 `HttpClient`。这可以有效管理连接池，避免端口耗尽问题。

**代码示例：**

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 注册一个命名的 HttpClient
    services.AddHttpClient("MyPluginClient", client =>
    {
        client.BaseAddress = new Uri("https://api.example.com/");
        client.Timeout = TimeSpan.FromSeconds(30);
    });
}
```

### 注册后台任务

如果插件需要在后台运行定时任务或长期运行的任务（如消息队列监听、定时清理缓存），可以注册 `IHostedService`。

**代码示例：**

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // MyBackgroundWorker 需要实现 IHostedService 接口或继承 BackgroundService
    services.AddHostedService<MyBackgroundWorker>();
}
```

### 注意事项
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
