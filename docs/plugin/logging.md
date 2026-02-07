# 日志记录 (Logging)

在 SharwAPI 插件开发中，日志记录是一个重要的环节。

## 使用原则

由于主程序已经通过 `builder.Host.UseSerilog()` 接管了整个系统的日志，**插件不需要做任何特殊配置，也不需要引用 Serilog 包**。

插件只需要遵循标准的托管模式，使用 `ILogger<T>` 接口即可。日志会自动流向您配置的控制台和文件。

## 示例代码

假设您要在 `TokenAuthMiddleware` 中记录日志：

```csharp
using Microsoft.Extensions.Logging; // 必须引用这个命名空间，它是 .NET Core 日志抽象的核心

public class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    
    // 1. 定义 Logger 字段
    // ILogger<T> 中的 T (这里是 TokenAuthMiddleware) 用于标记日志的来源类别 (Category)。
    // 这样在查看日志时，我们可以清楚地知道这条日志是由哪个类产生的。
    private readonly ILogger<TokenAuthMiddleware> _logger; 

    // 2. 在构造函数中请求 ILogger<T>
    // 主程序会自动将配置好的 Logger 实例传入此处。
    public TokenAuthMiddleware(RequestDelegate next, ILogger<TokenAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 3. 记录日志（支持结构化参数）
        // 注意：这里使用了占位符 {Path} 而不是字符串拼接。
        // Serilog 会捕获 "Path" 这个属性名和 context.Request.Path 这个属性值，保存为结构化数据。
        // 这比 _logger.LogInformation("Checking token for path: " + context.Request.Path) 性能更好且更易检索。
        _logger.LogInformation("Checking token for path: {Path}", context.Request.Path);

        if (!IsTokenValid(context))
        {
            // LogWarning 用于记录非预期的、但不会导致程序崩溃的问题。
            // 同样使用结构化日志记录 IP 地址，方便后续分析攻击源。
            _logger.LogWarning("Invalid token from IP: {IpAddress}", context.Connection.RemoteIpAddress);
            // ...
        }

        await _next(context);
    }
}
```

## 为什么这样做？

*   **解耦**：插件只依赖标准接口 (`Microsoft.Extensions.Logging`)，不依赖具体的日志库（Serilog）。
*   **统一管理**：日志格式、文件路径、滚动策略全部由宿主程序统一在 `appsettings.json` 中控制，插件无需关心。
*   **结构化**：虽然代码写的是 `{Path}`，但 Serilog 会将其保存为结构化数据，方便后续查询。
