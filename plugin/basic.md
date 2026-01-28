# 编写基础插件

在上一节中，我们通过脚手架模板创建了一个插件项目。现在，请打开项目中的 `.cs` 主文件（例如 `SharwApiMgrPlugin.cs`），我们将深入了解它的代码结构。

## 代码结构解析

一个标准的 SharwAPI 插件就是一个实现了 `IApiPlugin` 接口的类。你可以把它看作是一份 **“功能清单”**，告诉主程序这个插件能做什么。

以下是模板生成的默认代码（以 `Sharw.ApiMgr` 为例），我们来逐一解读：

```csharp
using SharwAPI.Contracts.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace Sharw.Plugin.ApiMgr;

public class SharwApiMgrPlugin : IApiPlugin
{
    // 1. 身份信息
    public string Name => "sharw.apimgr"; // 唯一ID
    public string DisplayName => "API Manager"; // 显示名称
    public string Version => "1.0.0"; // 版本号

    // 2. 注册工具 (RegisterServices)
    public void RegisterServices(IServiceCollection services, IConfiguration configuration) 
    {
        // 在这里注册你的业务服务
    }

    // 3. 配置管道 (Configure)
    public void Configure(WebApplication app) 
    {
        // 在这里添加请求拦截器
    }

    // 4. 定义接口 (RegisterRoutes)
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
  * **重要**: 请务必修改为 **`作者名.插件名`** 的格式（全小写）。
  * *示例*: `"sharw.apimgr"`


* **DisplayName**: 插件的显示名称，可以使用中文。
* **Version**: 插件版本号，遵循语义化版本规范。

---

### 注册工具 (RegisterServices)

在 SharwAPI 中，我们采用 **“托管模式”** 来管理工具（如数据库连接器、HTTP 客户端）。你不需要自己在代码里 `new` 这些对象，而是提前告诉主程序：“我需要用什么，请帮我准备好。”

**代码示例**：

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 场景：我的插件需要访问百度，需要一个浏览器工具 (HttpClient)
    // 动作：告诉主程序注册这个工具
    // 注：为了防止冲突，在这里建议为注册的HttpClient指定名称 (即下面的sharw.apimgr.client)
    services.AddHttpClient("sharw.apimgr.client", client =>
    {
        client.BaseAddress = new Uri("https://baidu.com");
        client.Timeout = TimeSpan.FromSeconds(10);
    });
    
    // 场景：我写了一个名为 MyDatabase 的类来操作数据库
    // 动作：注册它，这样整个插件都能共用这一个实例
    services.AddSingleton<MyDatabase>();
}

```

::: tip 进阶：插件之间的通讯（功能调用）
`RegisterServices` 也是插件之间进行 **功能调用** 的主要途径。

* **提供功能**：如果你希望你的功能（例如“写入数据库”）能被其他插件使用，请在这里将其注册为服务。
* **使用功能**：其他插件只需在它们的构造函数或路由中声明需要 `MyDatabase`，主程序就会自动将你的实例注入给它们。
:::

---

### 配置管道 (Configure)

想象一下，当一个用户访问 API 时，请求并不是瞬间到达终点的，而是像水流一样流过一根管子。`Configure` 方法允许你在管子里安装 **“关卡”**。所有的请求，在到达具体的 API 之前，都必须先经过这些关卡。

**代码示例**：

```csharp
public void Configure(WebApplication app)
{
    // 安装一个简单的拦截器
    app.Use(async (context, next) =>
    {
        // 前置处理
        Console.WriteLine($"[{Name}] 有人访问了: {context.Request.Path}");

        // 调用 next() 放行
        // 如果你不调用 next()，请求就会在这里被拦截，永远到不了 API
        await next();
    });
}

```

::: tip 进阶：插件之间的通讯（信息传递）
`Configure` 是插件之间传递 **请求上下文信息** 的途径。

* **传递信息**：例如 Auth 插件可以在这里解析用户 Token，并将用户信息存入 `HttpContext`。
* **获取信息**：后续的 Log 插件或业务插件可以从 `HttpContext` 中读取这些信息，从而知道“当前用户是谁”。
:::

---

### 定义接口 (RegisterRoutes)

这是插件最核心的部分，用于建立 URL 与代码的映射关系。

**代码示例**：

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 1. 创建带有统一前缀的路由组 (强烈建议使用插件 Name)
    var group = app.MapGroup($"/api/{Name}");

    // 2. 定义具体的 API 地址
    // 当用户访问 /api/sharw.apimgr/hello 时，执行后面的代码
    // 注意：MyDatabase 会被自动注入，无需手动创建
    group.MapGet("/hello", (MyDatabase db) => 
    {
        return db.GetData();
    });
}

```

## 编译与发布

当你写完代码后，需要将其编译成主程序可以加载的 `.dll` 文件。

### 编译项目

在插件项目的根目录下，打开终端并运行以下命令：

```bash
dotnet publish -c Release

```

这条命令会以 Release（发布）模式编译你的代码，并将其打包。

### 获取插件文件

编译完成后，请前往输出目录：
`bin/Release/net9.0/publish/`

在该目录下，你会找到一个与你项目同名的 `.dll` 文件（例如 `Sharw.Plugin.apimgr.dll`）。

### 安装运行

1. 将生成的 `.dll` 文件复制到 **主程序** 的 `Plugins` 文件夹中。
2. 运行（或重启）主程序。
3. 观察启动日志，如果看到 `Loaded Plugin: sharw.apimgr v1.0.0`，说明插件已成功加载。