# RegisterManagementEndpoints 详解

`RegisterManagementEndpoints` 是用于注册**管理功能**端点的方法。用于提供插件的后台管理接口（如配置热更新、状态监控）。

::: warning 原型验证阶段 (PoC)
该功能目前处于 **原型验证阶段 (Proof of Concept)**。
虽然接口定义已就绪，但**安全机制**（鉴权/授权）和**交互规范**（数据格式）尚未标准化。
目前仅供官方插件 `apimgr` 演示架构设计，**不建议**在生产环境中依赖此功能开发业务逻辑。
:::

## 方法签名

```csharp
void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup);
```

## 参数详解

### IEndpointRouteBuilder managementGroup

这是一个已经预先配置好路由前缀的路由构建器。调用此方法时，传入的 `managementGroup` 通常已经包含了类似 `/admin/plugin/{Name}` 的前缀。你不需要再手动调用 `MapGroup` 来隔离命名空间，直接在此 `managementGroup` 上注册端点即可。

## 默认实现

在 `IApiPlugin` 接口中，该方法提供了一个默认实现：

```csharp
void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    managementGroup.MapGet("/", () =>
        Results.Ok(new
        {
            status = "Not Applicable",
            message = "This plugin does not have configurable management endpoints."
        })
    );
}
```

这意味着如果你的插件不需要管理功能，你可以直接忽略这个方法，无需在插件类中重写它。

## 常见使用场景

::: tip 路由前缀
**不要** 在此方法中再次添加插件名前缀。
在目前的版本下，作为调用方的 `apimgr` 已经为你准备好了专属的路由组（例如 `/admin/plugin/{Name}`）。你只需要关心相对于这个组的路径即可（如 `/status` 或 `/`）。
:::

::: warning 实验性功能
由于该功能目前处于 **原型验证阶段 (Proof of Concept)**。目前的实现**未包含**默认的身份验证机制。并且该功能没有一个完善的规范，其也存在着 **巨大的安全性风险**，通过此方法注册的端点可能会被 **任何网络可达的用户** 访问。

与此同时，管理端点的请求/响应格式尚未制定标准（Schema）。目前开发的管理接口可能无法与未来的官方管理客户端（GUI/CLI）兼容
:::

### 暴露插件状态

当需要查看插件当前的运行状态（如缓存大小、连接数）时，可以注册一个返回状态信息的 GET 端点。

```csharp
public void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    // 最终路由为: GET /admin/plugin/{Name}/status
    managementGroup.MapGet("/status", (IMyPluginService service) => 
    {
        return new 
        { 
            IsRunning = true, 
            CacheCount = service.GetCacheCount(),
            Uptime = service.GetUptime()
        };
    });
}
```

### 动态配置更新

若需要允许在不重启服务的情况下修改插件配置，你可以注册一个接收新配置的 POST 端点。

```csharp
public void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    // 最终路由可能为: POST /admin/plugin/{Name}/config
    managementGroup.MapPost("/config", (MyPluginOptions newConfig, IOptionsMonitor<MyPluginOptions> monitor) => 
    {
        // 更新配置逻辑...
        return Results.Ok("Configuration updated.");
    });
}
```