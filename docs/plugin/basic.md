# 编写基础插件

在上一节中，我们通过脚手架模板创建了一个插件项目。现在，请打开项目中的 `Plugin.cs` 文件，我们将深入了解它的代码结构。

## 代码结构

以下是模板生成的默认代码，以 `sharwapi.apimgr` 为例：

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

using sharwapi.Contracts.Core;

namespace sharwapi.Plugin.apiMgr;
//实现IApiPlugin接口
public class SharwApiMgrPlugin : IApiPlugin
{
    // 1. 身份信息
    public string Name => "sharw.apimgr"; // 唯一ID
    public string DisplayName => "API Manager"; // 显示名称
    public string Version => "1.0.0"; // 版本号

    // 声明依赖 (可选)
    // 键: 依赖的插件名 (Name)
    // 值: 依赖的版本范围 (支持标准 NuGet 范围写法)
    public Dictionary<string, string> Dependencies => new()
    {
        { "sharw.core", "[1.0, 2.0)" }, // 依赖 sharw.core，版本需 >=1.0 且 <2.0
        { "another.plugin", "1.*" }     // 依赖 another.plugin，主版本为 1
    };
    // 提示: 如果您需要更复杂的验证逻辑(如可选依赖)，请参阅 [高级依赖配置](/plugin/dependencies)

    // 启用自动路由前缀
    public bool UseAutoRoutePrefix => true;

    // 定义默认配置 (可选)
    public object? DefaultConfig => new { MySetting = "DefaultValue" };

    // 2. 注册服务
    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        // 在这里注册你的业务服务
    }

    // 3. 配置管道
    public void Configure(WebApplication app)
    {
        // 在这里添加请求处理中间件
    }

    // 4. 定义接口
    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // 在这里定义 API 地址
    }
}

```

---

### 元信息

这部分定义了插件的信息。

* **Name**: 插件的全局唯一 ID。
  * **规范**: 为 **`作者名.插件名`** 的格式（全小写）。使用模板创建时会自动替换。
  * **示例**: `"sharw.apimgr"`


* **DisplayName**: 插件的显示名称，可以使用中文。
* **Version**: 插件版本号，遵循语义化版本规范。
* **Dependencies**: 声明插件的依赖关系。
    * **Key**: 依赖的插件 `Name`。
    * **Value**: 依赖的版本范围。
    * **支持格式**: 
        * 标准范围: `[1.0, 2.0)` (>=1.0 且 <2.0), `1.0` (>=1.0)
        * 浮动范围: `1.*` (主版本为 1 的任意版本)
* **UseAutoRoutePrefix**: **推荐开启**。当为 `true` 时，主程序会自动为你的接口添加 `/{插件名}` 前缀(例如 `/sharw.apimgr`)。

### 默认配置 (DefaultConfig)

* **DefaultConfig**: 设置默认配置文件。
  * 当插件首次加载且配置文件不存在时，主程序会将此对象自动生成为 `config/插件名.json` 文件(例如 `/sharw.apimgr.json`)。
  * 详细用法请参考 [配置处理](/plugin/configuration)。

* *`Name`,`DisplayName`等其他请回看[介绍 #身份信息](introduction#身份信息)*

---

### 注册服务 (RegisterServices)

[详细说明](services)

在 SharwAPI 中，我们采用标准的 **[依赖注入 (Dependency Injection)](https://learn.microsoft.com/zh-cn/dotnet/core/extensions/dependency-injection/overview)** 模式。

不需要在代码中手动创建（`new`）复杂的对象（如数据库连接服务、HTTP 客户端服务）。只需要在 `RegisterServices` 中**注册**它们。

此后，无论你在哪里需要使用这些工具，系统都会自动把准备好的实例**注入**进来，你直接使用即可。

**简单依赖注入示例**：

> 假如我的插件需要访问百度，需要一个浏览器工具 (HttpClient)。
> 那么我就可以在`RegisterServices`中调用`AddHttpClient`添加一个单例。
> 在之后插件的运行过程中，我就可以通过依赖注入，让这个HttpClient自己被注入到我需要的地方。

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 场景：我的插件需要访问百度，需要一个浏览器工具 (HttpClient)
    // 动作：主程序注册这个服务
    // 注：为了防止冲突，在这里建议为注册的HttpClient指定名称 (即下面的sharw.apimgr.client)
    services.AddHttpClient("sharw.apimgr.client", client =>//[!code highlight]
    {
        client.BaseAddress = new Uri("https://baidu.com");
        client.Timeout = TimeSpan.FromSeconds(10);
    });
    
    // 场景：我写了一个名为 MyDatabase 的类来操作数据库，这个类还同时需要使用HttpHlient这个服务
    // 动作：注册它，这样整个插件都能共用这一个实例
    // 同时，如果这个服务声明需要某个其他服务，DI会自动把这些依赖注入到构造中。
    // (不必须输入接口，也可以直接输入MyDataBase类)
    services.AddSingleton<IMyDataBaseService>();// [!code highlight]
}
//我的MyDataBase类
public class MyDataBaseService : IMyDataBaseService
{
    private readonly HttpClient _baiduHttpClient;
    // 在构造函数里表明需要HttpClient
    // 在上文AddSingleton<IMyDataBaseService>()之后
    // 依赖注入会自动把httpClient注入进来。
    public MyDataBaseService(HttpClient baiduHttpClient) // [!code highlight]
    {
        _baiduHttpClient = baiduHttpClient;
    }
    // 其他实现...
}
interface IMyDataBaseService
{
    // 其他东西...
}

```

::: details 进阶：插件之间的功能调用
`RegisterServices` 也是插件之间进行 **功能调用** 的主要途径。

* **提供功能**：如果你编写了一个服务类（例 `MyDatabase` 这个类），并希望它能被其他插件使用，请将其注册到容器中（`services.AddSingleton<MyDatabase>()`）。
* **使用功能**：和`MyDatabase`声明需要`HttpClient`一样，其他插件只需在它们的构造函数或路由中声明需要 `MyDatabase`，主程序就会自动注入给它们。
:::

---

### 配置管道 (Configure)

[详细说明](configure)

当一个用户访问 API 时，请求并不是瞬间到达终点的，而是像水流一样流过一根管子。`Configure` 方法允许你在管子里安装 **“关卡”**。所有的请求，在到达具体的 API 之前，都必须先经过这些关卡。

**代码示例**：

```csharp
public void Configure(WebApplication app)
{
    // 安装一个简单的中间件（阀门）
    app.Use(async (context, next) =>
    {
        // 前置处理
        Console.WriteLine($"[{Name}] 有人访问了: {context.Request.Path}");

        // 调用 next() 放行
        // 如果你不调用 next()，请求就会在这里被拦截，请求一辈子都到不了API了
        await next();// [!code highlight]
    });
}

```

::: details 进阶：插件之间的信息传递
`Configure` 也可以是插件之间传递 **请求上下文信息** 的途径。

* **传递信息**：例如 Auth 插件可以在这里解析用户 Token，并将用户信息存入 `HttpContext`。
* **获取信息**：后续的 Log 插件或业务插件可以从 `HttpContext` 中读取这些信息，从而知道“当前用户是谁”。

具体说明请见：[配置中间件#插件间通讯](configure#插件间通讯)
:::

---

### 定义接口 (RegisterRoutes)

[详细说明](routes)

这是插件最核心的部分，用于建立**Api访问**与**代码处理**的映射关系。

**代码示例**：

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{    
    // 注册一个名为 MyDatabase 的类来操作数据库
    services.AddSingleton<MyDatabase>();
}

public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 注意：如果你开启了 UseAutoRoutePrefix => true
    // 这里的 app 已经是包含 /{插件ID} 前缀的路由组了

    // 定义具体的 API 地址
    // MyDatabase 会被自动注入，无需手动创建
    // （前提是MyDatabase已经在 RegisterServices 中被注册）
    // 最终地址: /sharw.apimgr/hello
    app.MapGet("/hello", (MyDatabase db) =>
    {
        return db.GetData();
    });
}

```