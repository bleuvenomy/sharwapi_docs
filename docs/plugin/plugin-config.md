# 读取插件配置

从 v0.2.0 版本开始，**主程序**实现了**配置隔离**与**默认配置生成**机制。插件拥有独立的配置文件（物理隔离），不再与主程序共享配置。

## 默认配置生成

在**插件协议库**定义的 `IApiPlugin` 接口中，包含了一个 `DefaultConfig` 属性。你可以通过重写此属性来提供插件的默认配置对象。

当主程序加载插件时，会检查 `config` 目录下是否存在对应的配置文件（例如 `config/sharwapi.guard.json`）。如果文件不存在，主程序会将 `DefaultConfig` 返回的对象序列化为 JSON，并自动写入该文件。

### 示例代码

假设我们需要为插件定义一个包含受保护路径的配置：

1. 首先定义配置模型类：

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

2. 在插件主类中重写 `DefaultConfig`：

```csharp
public class GuardPlugin : IApiPlugin
{
    public string Name => "sharwapi.guard";
    // ... 其他属性实现

    // 定义插件提供的默认配置对象
    public object? DefaultConfig => new GuardSettings
    {
        // 初始化 ProtectedRoutes 列表，包含一个示例受保护路径
        ProtectedRoutes = new List<ProtectedRoute>
        {
            new ProtectedRoute { Path = "/api/secure", Token = "change-me" }
        }
    };

    // ...
}
```

这样，当用户第一次运行安装了该插件的主程序时，`config` 目录下会自动生成包含上述内容的 JSON 文件(`config/sharwapi.guard.json`)。

## 读取配置

在 `RegisterServices` 方法中，主程序会传递一个 `IConfiguration` 对象。

由于实现了配置隔离，这个 `configuration` 对象**只包含该插件的配置内容**。这意味着它已经是该插件配置文件的根视图，你不需要再使用 `.GetSection("MyPluginSettings")` 去查找节点。

你可以直接将其绑定到你的配置类上：

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 直接将隔离后的配置绑定到 GuardSettings
    // 因为 configuration 对应的就是 config/guard.json 的根内容
    services.Configure<GuardSettings>(configuration);
}
```

### 使用配置

绑定完成后，你可以在你的服务（Services）或控制器中，通过**托管模式**直接获取配置数据，而无需手动读取文件或解析 JSON。主程序会自动管理这些对象的创建和注入。

* 使用 `IOptions<GuardSettings>`：适合仅在启动后读取一次配置。
* 使用 `IOptionsMonitor<GuardSettings>`：适合需要响应配置热更新的场景。

### 热重载说明

主程序在加载插件配置文件时启用了 `reloadOnChange: true`。这意味着当 `config/{插件名}.json` 被修改时，底层配置系统会触发变更通知。

但插件要“真正热生效”，还需要你在代码中使用 `IOptionsMonitor<T>`（或自行订阅配置变更）并实现对应的更新逻辑。仅使用 `IOptions<T>` 时，通常不会自动获得最新值。
