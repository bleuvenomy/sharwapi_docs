# 编写基础插件

本节将会介绍构成一个插件的必须代码，这些代码将会构成一个最基础的插件。你可以根据本节内容编写出一个能被API本体所识别的插件

## 插件一览

在你设置好你插件的解决方案后，打开你的 `{Name}Plugin.cs` 输入以下内容(可直接复制)

```csharp
using sharwapi.Contracts.Core;
using ... // 该处是你要引入的引用

namespace sharwapi.Plugin.{Name};

public class {Name}Plugin : IApiPlugin
{
    // 插件名称
    public string Name => "{Name}";
    // 插件显示名称
    public string DisplayName => "{DisplayName}";
    // 插件版本
    public string Version => "{Version}";

    // 插件注册服务方法 (此处不进行配置，所以使用默认函数)
    public void RegisterServices(IServiceCollection services, IConfiguration configuration) { }
    // 插件中间件配置方法 (此处不进行配置，所以使用默认函数)
    public void Configure(WebApplication app) { }
    // 插件路由注册方法 (此处不进行配置，所以使用默认函数)
    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration) { }
}
```

由于 `Name` `DisplayName` `Version` 这些接口成员在 [插件](./overview/#各接口成员介绍) 中已经进行了介绍，遂后续内容不再赘述。我们将着重讲解 `RegisterServices` `Configure` `RegisterRoutes` 这三个接口成员

## 详细介绍

### 接口实现

所有插件都必须实现一个名为 `IApiPlugin` 的接口，这个接口提供了  `Name` `DisplayName` `Version` `RegisterServices` `Configure` `RegisterRoutes` 这些接口成员，也就是需要在 `class` 处写入如下内容

```csharp
public class {Name}Plugin : IApiPlugin
```

### 服务注册

服务可用于 **插件间的沟通** 、 **配置项的注册** 、 **注册插件的自定义服务** 等。其主要是利用全局依赖注入容器 (DI Container) 进行配置的。

**但请注意：切勿在此方法中使用 `services.BuildServiceProvider()` 来解析服务。这将创建第二个独立的 DI 容器，导致 Singleon 服务被创建两次，以及状态不一致、资源泄露等严重问题。应直接使用 IConfiguration 进行配置绑定，或利用 IServiceCollection 进行服务注册**

若你不需要进行配置，你可以直接写成下列形式(默认函数)：

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration) { }
```

若是你需要进行配置，下面用注册配置项来进行举例(Route Guard插件)

```csharp
public class guardSettings
{
    public List<ProtectedRoute> ProtectedRoutes { get; set; } = new();
}

public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    services.Configure<guardSettings>(configuration.GetSection("AuthSettings"));
}
```

### 中间件配置
