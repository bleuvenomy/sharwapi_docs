# 配置中间件 (Configure)

`Configure` 是插件用于介入 HTTP 请求处理流程的方法。

它的主要作用是**配置中间件管道**。在主程序启动后，所有的 HTTP 请求都会流经这个管道。通过在此处注册中间件，你可以拦截、读取甚至修改流经系统的每一个请求和响应。

## 中间件管道

ASP.NET Core 的请求处理模型是一个"管道"结构。
1.  **请求进入**：当用户访问 API 时，请求会依次经过注册的中间件。
2.  **处理逻辑**：每个中间件可以选择处理请求，或者将请求传递给下一个中间件。
3.  **响应返回**：当最终的业务逻辑执行完毕后，响应会原路返回，再次经过这些中间件（执行后置逻辑）。

::: warning 管道没有顺序
中间件是按照主程序注册遍历顺序依次执行的，插件本身并不能控制加载顺序，这意味着：

你的中间件可能会受到其他插件中间件的影响（取决于插件加载顺序）。编写代码时，请尽量避免依赖特定的中间件执行顺序。
:::

::: details 架构顺序
在 API 框架中，插件的 `Configure` 方法是在全局异常处理（`UseExceptionHandler`）和 Swagger 中间件之后被调用的。这意味着：
1. 你的中间件抛出的异常会被全局异常处理器捕获。
2. 你的中间件位于 Swagger UI 之后，不会影响 Swagger 文档的访问。
:::

## 常用操作

### 简单的中间件 (内联)

如果你只需要执行简单的逻辑（如记录日志、附加响应头），可以直接使用 Lambda 表达式编写中间件。

```csharp
public void Configure(WebApplication app)
{
    app.Use(async (context, next) =>//[!code highlight]
    {
        // 前置逻辑：请求到达时执行
        Console.WriteLine($"[{Name}] 收到请求: {context.Request.Path}");

        // 传递请求：必须调用 next()，否则请求会在这里终止
        await next();//[!code highlight]

        // 后置逻辑：响应返回时执行
        Console.WriteLine($"[{Name}] 处理完成");
    });
}

```
::: details 避免阻塞管道
如果忘记调用 `next()`，请求处理链路将在此**短路**。请求永远无法到达后续的路由，用户将收到空白响应或 404 错误。

除非你明确想要拦截并终止请求（例如检测到恶意攻击），否则务必在代码中调用 `await next()`。
:::

### 插件间通讯：传递上下文信息 {#插件间通讯}

与 `RegisterServices` 主要用于注册提供服务不同，`Configure` 主要用于在**请求链路**中传递信息。

你可以利用 `HttpContext.Items` 在不同的插件或中间件之间共享数据。

```csharp
public void Configure(WebApplication app)
{
    app.Use(async (context, next) =>
    {
        // 场景：解析用户身份，并传递给后续的插件
        if (context.Request.Headers.ContainsKey("X-User-ID"))
        {
            // 将数据存入当前请求的上下文
            context.Items["CurrentUserId"] = context.Request.Headers["X-User-ID"];
        }

        await next();
    });
}

```

**后续使用**：
在其他插件的路由或逻辑中，可以通过 `HttpContext.Items["CurrentUserId"]` 读取到这个数据。

::: warning 作用域范围
在 `Configure` 中注册的中间件是 **全局生效** 的。
这意味着：你写的逻辑不仅会影响你自己的插件，还会影响主程序和其他所有插件的 API 请求。

* **推荐做法**：仅在此处注册通用的、必须全局生效的逻辑（如全局鉴权、全局日志）。
* **替代方案**：如果你只想拦截自己插件的请求，请在 `RegisterRoutes` 中使用 `.AddEndpointFilter(...)`，或利用路由组（MapGroup）进行局部拦截。
:::

::: details 安全相关
当你的Api被暴露在公共网络上时，请不要使用请求头传递固定或短的关键信息。访问者可能会模仿请求头来达到某些目的，这已经[**有了先例**](https://www.cve.org/CVERecord?id=CVE-2025-55182)。**永远不要信任客户端提供的身份信息**。

如果一定要用请求头，可以进行验证，或者使用内部随机生成的密钥进行签名，只需要用更安全的方式传递密钥即可。
:::

### 使用标准中间件

你也可以注册 ASP.NET Core 内置的功能或第三方库提供的中间件。

```csharp
public void Configure(WebApplication app)
{
    // 启用静态文件服务（使插件目录下的 wwwroot 文件夹可被访问）
    app.UseStaticFiles();
    
    // 启用认证中间件
    app.UseAuthentication();
}

```
