# RegisterRoutes 详解

`RegisterRoutes` 是插件定义 API 端点（Endpoint）的核心方法。它在应用启动前被调用，用于将 URL 路径映射到具体的处理逻辑，定义插件对外提供的 API 接口。

## 方法签名

```csharp
void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration);
```

## 参数详解

### 1. IEndpointRouteBuilder app

这是路由构建器接口，`WebApplication` 实现了该接口。其提供 `MapGet`, `MapPost`, `MapGroup` 等方法来定义路由。在这里推荐使用 ASP.NET Core 的 Minimal API 风格，它比传统的 Controller 更轻量、更高效。

### 2. IConfiguration configuration

这是配置根节点。它允许你在注册路由时读取配置（例如，根据配置决定是否启用某些路由）。

## 常见使用场景

::: tip 统一前缀
**强烈建议** 使用 `app.MapGroup($"/{Name}")` 为你的插件所有路由设置统一前缀。
这不仅能避免与其他插件的路由冲突，还能让 API 结构更加清晰。
:::

### 基础路由注册

下面是定义简单的 GET/POST 接口的示例

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 创建路由组（强烈建议使用插件名作为前缀）
    var group = app.MapGroup($"/{Name}");

    // 定义端点
    group.MapGet("/hello", () => "Hello World");
    group.MapPost("/echo", (string message) => $"Echo: {message}");
}
```

### 依赖注入

若要在路由处理逻辑中使用服务，可直接在处理委托（Delegate）的参数中声明所需的服务类型，框架会自动注入。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    var group = app.MapGroup($"/{Name}");

    // 自动注入 ILogger 和自定义服务 IMyService
    group.MapGet("/data", (ILogger<MyPlugin> logger, IMyService service) => 
    {
        logger.LogInformation("Fetching data...");
        return service.GetData();
    });
}
```

### 参数绑定

当要获取 URL 参数、查询字符串或请求体。可以利用 Minimal API 强大的自动绑定能力。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    var group = app.MapGroup($"/{Name}");

    // 路由参数: /users/123
    group.MapGet("/users/{id}", (int id) => $"User ID: {id}");

    // 查询参数: /search?q=keyword
    group.MapGet("/search", (string q) => $"Searching for: {q}");

    // 请求体 (JSON): POST /users
    // 自动将 JSON Body 反序列化为 UserDto 对象
    group.MapPost("/users", (UserDto user) => $"Created user: {user.Name}");
}
```

### 权限控制与过滤器

在你需要保护路由，仅允许授权用户访问，或在执行前后添加逻辑时，可以 `RequireAuthorization` 和 `AddEndpointFilter`。

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    var group = app.MapGroup($"/{Name}");

    // 仅允许持有有效 ApiKey 的请求访问
    // "ApiKeyAuth" 是框架默认提供的策略名称
    group.MapGet("/secure", () => "Secret Data")
         .RequireAuthorization("ApiKeyAuth");

    // 添加过滤器（类似中间件，但仅针对该路由）
    group.MapGet("/filtered", () => "Filtered Data")
         .AddEndpointFilter(async (context, next) =>
         {
             Console.WriteLine("Before endpoint");
             var result = await next(context);
             Console.WriteLine("After endpoint");
             return result;
         });
}
```

## 注意事项

::: warning 异步处理
如果你的业务逻辑涉及 I/O 操作（如读写数据库、调用外部 API），请务必使用 `async/await`。
例如：`group.MapGet("/", async (DbContext db) => await db.Users.ToListAsync());`
:::

::: tip 避免使用 Controller
虽然框架技术上支持 Controller，但在插件系统中，**Minimal API** 是首选方案。它启动更快、资源占用更少，且更容易与插件的单文件结构集成。
:::

::: tip 注册顺序
插件的路由注册是在中间件配置之后进行的。这意味着所有在 `Configure` 中注册的中间件都会对这些路由生效。
:::
