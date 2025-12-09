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

若是你需要进行配置，下面用注册一个简单的问候服务来进行举例：

```csharp
// 定义一个简单的服务
public class GreetingService
{
    public string GetMessage() => "Hello from Service!";
}

public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 注册为单例服务
    services.AddSingleton<GreetingService>();
}
```

::: tip 关于单例服务的疑问
你可能会担心：**API框架本身已经注册了一些单例服务，我在插件里再注册一个单例服务，会不会导致冲突？**

答案是 **不会**。

依赖注入容器中的 `Singleton`（单例）是指 **针对某种特定类型** 在容器中只存在一个实例，而不是说整个容器只能有一个单例服务。
- **类型隔离**：只要你注册的服务类型（例如 `GreetingService`）与API框架或其他插件注册的服务类型不同，它们就可以在同一个容器中和平共处，互不干扰。
- **命名空间**：即使类名相同，只要命名空间不同（例如 `sharwapi.Plugin.MyPlugin.Service` 和 `sharwapi.Core.Service`），它们在运行时也是完全不同的类型。
:::

### 中间件配置

中间件可用于 **在请求到达路由之前执行逻辑** ，例如 **身份验证** 、 **授权检查** 、 **请求日志记录** 等。其主要是利用 `WebApplication` (即 `IApplicationBuilder`) 进行配置的。

若你不需要进行配置，你可以直接写成下列形式(默认函数)：

```csharp
public void Configure(WebApplication app) { }
```

若是你需要进行配置，下面用添加一个简单的请求日志中间件来进行举例：

```csharp
public void Configure(WebApplication app)
{
    app.Use(async (context, next) =>
    {
        Console.WriteLine($"[{Name}] 收到请求: {context.Request.Path}");
        await next();
    });
}
```

### 路由注册

路由注册是插件与外部交互的主要方式，用于定义 API 端点。其主要是利用 `IEndpointRouteBuilder` 进行配置的。

**规范操作**：为了防止不同插件之间的路由冲突，**强烈建议** 使用 `MapGroup` 为你的插件路由设置一个统一的前缀。

若你不需要进行配置，你可以直接写成下列形式(默认函数)：

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration) { }
```

若是你需要进行配置，下面用注册一个简单的 GET 接口并使用我们刚刚注册的服务来进行举例：

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 创建带有统一前缀的路由组
    var group = app.MapGroup($"/api/{Name}");

    // 定义具体的 API 端点，并注入 GreetingService
    group.MapGet("/hello", (GreetingService service) => service.GetMessage());
}
```

## 编译与部署

当你完成了插件代码的编写，接下来的步骤是将代码编译成可被 API 本体加载的程序集文件 (`.dll`)。

### 发布项目

在你的插件项目根目录下，打开终端并运行以下命令来发布项目：

```bash
dotnet publish -c Release
```

### 获取构建产物

编译完成后，前往输出目录（通常是 `bin/Release/net9.0/publish/`），找到以你项目名称命名的 `.dll` 文件（例如 `sharwapi.Plugin.{Name}.dll`）。

::: warning 注意
请确保只复制插件本身的 `.dll` 文件以及它特有的依赖库。不要复制 `sharwapi.Contracts.Core.dll` 或其他 ASP.NET Core 框架的 dll，因为 API 本体运行时环境中已经包含了这些。
:::

### 安装插件

将编译出来的 `sharwapi.Plugin.{Name}.dll` (以及必要的依赖) 放入 API 本体的 `Plugins` 文件夹内(若文件夹不存在可以运行一次API本体以自动创建或手动创建)。

### 验证运行

再运行 **API本体** ，若看到类似下文的提示，你的第一个插件就已经完成了

```bash
Loading plugin: {Name} {Version}
```