# Configure 详解

`Configure` 是插件介入 ASP.NET Core 请求处理管道（Middleware Pipeline）的入口方法，利用它你可以向 HTTP 请求管道中添加**中间件（Middleware）**。它在应用构建完成（`builder.Build()`）之后，但在应用启动（`app.Run()`）之前执行。

## 方法签名

```csharp
void Configure(WebApplication app);
```

## 参数详解

### WebApplication app

这是构建完成的应用实例，它实现了 `IApplicationBuilder` 接口。

利用这个接口，你可以通过 `Use...` 系列方法注册中间件。

中间件的执行顺序取决于它们的注册顺序：先注册的中间件会先接收到请求，并且最后接收到响应。

## 常见使用场景

### 简单中间件 (Inline Middleware)

若要执行简单的逻辑，如记录日志、修改请求头，可以直接使用 `app.Use` 编写 lambda 表达式。

```csharp
public void Configure(WebApplication app)
{
    app.Use(async (context, next) =>
    {
        // 请求处理前逻辑
        Console.WriteLine($"[{Name}] 收到请求: {context.Request.Path}");
        
        // 调用下一个中间件
        await next();
        
        // 响应处理后逻辑
        Console.WriteLine($"[{Name}] 请求处理完成");
    });
}
```

### 独立中间件类

如果你在编写逻辑复杂，需要依赖注入服务的中间件，你可以通过定义标准的中间件类，并通过 `app.UseMiddleware<T>()` 注册来实现

**中间件类定义**：
```csharp
public class RequestAuditMiddleware
{
    private readonly RequestDelegate _next;

    public RequestAuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 可以在这里记录审计日志
        // ...
        
        await _next(context);
    }
}
```

**注册代码**：
```csharp
public void Configure(WebApplication app)
{
    app.UseMiddleware<RequestAuditMiddleware>();
}
```

### 使用内置中间件

你可以调用 ASP.NET Core 提供的 `Use...` 扩展方法，复用其提供的功能。

```csharp
public void Configure(WebApplication app)
{
    // 启用静态文件服务（如果插件需要提供前端资源）
    // 注意：通常需要指定 FileProvider 指向插件目录
    app.UseStaticFiles();
}
```

## 注意事项

::: tip 避免阻塞管道
除非你明确知道自己在做什么（例如拦截非法请求），否则务必在中间件中调用 `await next()`，将请求传递给下一个中间件。如果不调用 `next()`，请求处理链将在此中断（短路），后续的中间件和路由处理程序都不会执行。
:::

::: warning 执行顺序至关重要
中间件是按照注册顺序依次执行的。
在 API 框架中，插件的 `Configure` 方法是在全局异常处理（`UseExceptionHandler`）和 Swagger 中间件之后被调用的。这意味着：
1. 你的中间件抛出的异常会被全局异常处理器捕获。
2. 你的中间件位于 Swagger UI 之后，不会影响 Swagger 文档的访问。
3. 由于所有插件的 `Configure` 方法是依次调用的，你的中间件可能会受到其他插件中间件的影响（取决于插件加载顺序）。
:::

::: warning 作用域范围
在此处注册的中间件是**全局**的，它会影响到应用中的**所有**请求，包括其他插件的路由。
如果你只想针对自己插件的路由生效，建议在 `RegisterRoutes` 中使用 `MapGroup(...).AddEndpointFilter(...)` 或特定于路由的中间件。
:::
