# 路由注册 (RegisterRoutes)

`RegisterRoutes` 是插件定义对外 API 接口的核心方法。它在主程序启动前被调用，用于建立 **URL 路径** 与 **处理逻辑** 之间的映射关系。

## 路由前缀管理

为了规范 API 结构并避免插件冲突，SharwAPI 提供了两种路由管理模式。

### 自动前缀模式 (推荐)

这是新版插件的首选模式。主程序会自动为你的插件创建一个标准化的路由组（`/{插件名}`），并将该组传递给 `RegisterRoutes` 方法。

**开启方式**：
在插件类中重写 `UseAutoRoutePrefix` 属性为 `true`。

```csharp
public class MyPlugin : IApiPlugin
{
    public string Name => "sharw.demo";
    
    // 开启自动前缀：主程序会自动帮你创建 /sharw.demo 路由组
    public bool UseAutoRoutePrefix => true; 

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // 这里的 app 已经是 /sharw.demo 下的路由组了
        // 你只需要定义相对路径
        
        // 最终地址: GET /sharw.demo/hello
        app.MapGet("/hello", () => "Hello World");
    }
}

```

### 手动模式 (兼容)

这是默认模式（`UseAutoRoutePrefix` 默认为 `false`）。此时主程序传递的是 **根路由构建器**，你需要手动管理前缀。但仅用于老旧插件或需要完全自定义路由结构的特殊场景。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 你必须手动创建路由组，否则会污染根路径
    var group = app.MapGroup($"/{Name}");

    group.MapGet("/hello", () => "Hello World");
}

```

## 常用操作指南

以下示例均基于 **自动前缀模式** (`UseAutoRoutePrefix => true`)。

### 基础接口定义

利用 Minimal API 语法，你可以快速定义各种 HTTP 方法的接口。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // GET /api/{name}/status
    app.MapGet("/status", () => "Running");

    // POST /api/{name}/data
    app.MapPost("/data", (MyData data) => 
    {
        return Results.Ok($"Received: {data.Content}");
    });
}

```

### 使用工具 (服务注入)

在 `RegisterServices` 中注册的工具（服务），可以在这里直接使用。你只需要在处理函数的参数列表中声明需要的类型，主程序会自动将实例注入进来。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 场景：需要使用 HttpClient 访问外部网络
    // 动作：在参数中声明 IHttpClientFactory
    app.MapGet("/proxy", async (IHttpClientFactory clientFactory) => 
    {
        var client = clientFactory.CreateClient("baidu");
        return await client.GetStringAsync("/");
    });
}

```

::: tip 为什么需要 IHttpClientFactory？
你可能会好奇：**为什么不能直接注入 HttpClient？**

直接使用单例的 `HttpClient` 可能会导致 **DNS 更新不生效**（当目标 IP 变更时无法感知）。同时频繁创建新的 `HttpClient` 则会导致 **Socket 端口耗尽**。

`IHttpClientFactory` 是 ASP.NET Core 专门设计的解决方案：
1.  **智能管理**：它在后台维护连接池，既能复用连接（避免端口耗尽），又能定期刷新（感知 DNS 变更）。
2.  **按需生产**：你注册的 "baidu" 或 "google" 只是配置模板。通过工厂，你可以随时生产出配置好的、独立的客户端实例，互不干扰。
:::

### 处理请求参数

Minimal API 支持自动绑定 URL 参数、查询字符串和请求体 (Body)。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 1. 路径参数: GET /api/{name}/users/101
    app.MapGet("/users/{id}", (int id) => $"查找 ID 为 {id} 的用户");

    // 2. 查询参数: GET /api/{name}/search?keyword=sharw
    app.MapGet("/search", (string keyword) => $"搜索关键字: {keyword}");

    // 3. 请求体 (JSON): POST /api/{name}/users
    // 主程序会自动将 JSON 数据反序列化为 UserDto 对象
    app.MapPost("/users", (UserDto user) => 
    {
        return $"收到用户: {user.Name}";
    });
}

```

### 权限控制与局部拦截

如果你需要保护某个接口，或者仅针对特定接口执行逻辑（而非全局拦截），可以使用以下方法。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 权限控制：仅允许通过身份验证的请求访问
    app.MapGet("/secret", () => "机密数据")
       .RequireAuthorization();

    // 局部拦截 (过滤器)：仅针对该路由执行的前置/后置逻辑
    app.MapGet("/filtered", () => "数据")
       .AddEndpointFilter(async (context, next) =>
       {
           // 接口执行前
           Console.WriteLine("即将执行接口...");
           
           var result = await next(context);
           
           // 接口执行后
           Console.WriteLine("接口执行完毕");
           
           return result;
       });
}

```

## 注意事项

::: warning 异步处理
如果你的业务逻辑涉及 I/O 操作（如读写数据库、文件操作、HTTP 请求），请务必使用 `async/await` 模式。

* **错误**: `app.MapGet("/", (Db db) => db.Data.ToList());` (这会阻塞主线程)
* **正确**: `app.MapGet("/", async (Db db) => await db.Data.ToListAsync());`
:::

::: tip 避免使用 Controller
尽管主程序在技术上兼容传统的 Controller 写法，但在插件开发中，并不推荐使用它。因为 Controller 会引入复杂的程序集扫描问题和额外的资源开销，而 Minimal API 是专为这种轻量级集成设计的首选方案。
:::

::: tip 注册顺序
插件的路由注册是在中间件配置之后进行的。这意味着所有在 `Configure` 中注册的中间件都会对这些路由生效。
:::
