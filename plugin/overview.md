# 插件

插件是整个项目中最重要的角色，因为API本体并不具备任何实际的业务代码，功能全部由插件负责。在本章中，将会讲解插件系统的内容，并引导你开发一个你自己的插件

::: tip 术语统一
在接下来的内容中，为了预防理解困难，再次介绍各术语和其对应的项目
- **CoreAPI** 、 **API本体** 、 **sharwapi.Core** ：均指代 **API框架本体** ，仅包含负责插件加载、路由注册等底层任务代码
- **Contracts** 、**接口层** 、**Contracts.Core** : 均指代 **定义插件与核心框架之间通信的接口** ，插件需要实现 `IApiPlugin` 接口，核心框架通过此接口与插件进行交互
:::

## 你需要知道的

插件本质是一个个独立的 `.dll` 文件，之所以被认为是API框架的插件，是因为实现了 `Contracts.Core` 中 `IApiPlugin` 这个接口

在 `Contracts.Core` 中规定了插件必须实现的接口成员，即：

- `Name`(string) : 插件名称
- `DisplayName`(string) : 插件显示名称
- `Version`(string) : 插件版本
- `RegisterServices(IServiceCollection services, IConfiguration configuration)`(funtion) : 插件注册的服务
- `Configure(WebApplication app)`(funtion) : 插件中间件的配置
- `RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)`(funtion) : 插件路由的注册

### 各接口成员介绍

1. **Name**
    - 这是插件的内部全局唯一标识符，在API本体加载时将会用此名称进行日志输出，插件列表展示等
    - **规范** : 由全小写字母、数字组成的字符串，不含空格或特殊字符
    - **示例** : "apimgr","guard"
2. **DisplayName**
    - 这是插件的显示名称，用于在插件市场和管理界面中展示，具有人类友好等特征
    - **示例** : "API Manager","Route Guard"
3. **Version** 
    - 这是插件的版本号
    - **规范** : **必须** 遵守 [语义化版本号 2.0.0](https://semver.org/lang/zh-CN/)
    - **示例** : "0.1.0","1.0.0-alpha","1.0.0+20130313144700"
4. **RegisterServices** : 
    - 该方法是插件向全局依赖注入容器 (DI Container) 注册其所需服务的入口
    - 可用于注册插件的自定义服务（如 `HttpClient` 客户端、数据库上下文 `DbContext`、配置对象 `PluginSettings` 等），也可用于通过 `IConfiguration` 直接获取配置（如 `"PluginSettings"`）
    - **请注意：切勿在此方法中使用 `services.BuildServiceProvider()` 来解析服务。这将创建第二个独立的 DI 容器，导致 Singleon 服务被创建两次，以及状态不一致、资源泄露等严重问题。应直接使用 IConfiguration 进行配置绑定，或利用 IServiceCollection 进行服务注册**
5. **Configure**
    - 该方法允许插件向应用程序的请求处理管道 (Middleware Pipeline) 中注入自定义的中间件
    - 可用于在请求到达路由之前执行的逻辑，例如身份验证、授权检查、请求日志记录
6. **RegisterRoutes**
    - 该方法是插件注册其 API 端点（路由）的地方
    - **规范操作** : 使用 `app.MapGroup("/prefix")` 来为插件的所有路由设置一个统一的 URL 前缀，后再使用ASP.NET Core Minimal API 提供的 `MapGet`, `MapPost`, `MapPut`, `MapDelete` 等方法来注册具体的 API 端点（路由）

## 开发环境设置

如果你想要开发插件，那么配置开发环境是必不可少的，你需要按照下列列表中配置开发环境

- [Git](https://git-scm.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet/9.0)
- [Visual Studio](https://visualstudio.microsoft.com/zh-hans/vs/) 或 [Visual Studio Code](https://code.visualstudio.com/Download)

并按照 [手动构建](/guide/build) 一节中拉取 **API本体** 和 **接口层**

随后在解决方案目录下执行如下命令新建你的插件，添加到解决方案中并添加对 **接口层** 的引用

::: tip 规范开发
为了插件的规范开发和方便索引，你的插件项目名需要为 `sharwapi.Plugin.{Name}`，其中的 `{Name}` 为你插件的 **唯一标识符**，比如 `sharwapi.Plugin.apimgr`
:::

```bash
$ dotnet new classlib -n sharwapi.Plugin.{Name}

$ dotnet sln add sharwapi.Plugin.{Name}/sharwapi.Plugin.{Name}.csproj

$ dotnet add sharwapi.Plugin.{Name}/sharwapi.Plugin.{Name}.csproj reference sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj
```

随后你便可以开始你的插件开发，但你可以参考如下内容

::: tip 插件开发规范
新建插件项目后，将 `Class1.cs` 删除，并新建 `{Name}Plugin.cs` ，在里面写入你插件的 `Name`,`DisplayName` 等信息

若需要获取配置，可以新建 `{Name}Settings.cs` 用于绑定配置项
:::