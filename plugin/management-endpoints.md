# 管理接口 (RegisterManagementEndpoints)

`RegisterManagementEndpoints` 是插件用于暴露 **后台管理功能** 的专用通道。与面向普通用户的 `RegisterRoutes` 不同，此处的接口通常用于运维目的，如查看插件运行状态、热更新配置等。

::: warning ⚠️ 实验性功能 (PoC)
该功能目前仍处于 **原型验证阶段 (Proof of Concept)**。
这意味着：
1.  **无默认防护**：默认情况下，通过此方法注册的接口**没有身份验证**。任何能访问服务器的人都可以调用，存在极大的安全风险。
2.  **标准未定**：管理接口的数据交互格式（Schema）尚未标准化，未来版本可能会发生破坏性变更。

**建议仅在开发调试或受信任的内网环境中使用，严禁在生产环境中依赖此功能。**
:::

## 受管路由组

与 `RegisterRoutes` 不同，`RegisterManagementEndpoints` 接收的 `IEndpointRouteBuilder` 是一个 **“受管路由组”**。

调用方（通常是 `apimgr` 管理插件或主程序）已经为你预设了固定的路由前缀（通常是 `/admin/plugin/{你的插件名}`）。

**这意味着**：
* 你 **不需要** 也不应该手动创建 `MapGroup`。
* 你 **不能** 修改这个前缀，只能在它的基础上定义子路径。

## 默认实现 (可选)

在 **插件协议库** 中，该方法提供了一个默认的空实现。

如果你的插件不需要后台管理功能，可以完全忽略此方法，无需在代码中重写。

## 常用操作指南

### 暴露运行状态

这是最常见的场景。你可以注册一个 GET 接口，返回插件当前的内部指标（如缓存数量、连接状态）。

```csharp
public void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    // 注意：这里不需要写插件名前缀
    // 最终访问地址可能是: GET /admin/plugin/sharw.demo/status
    
    managementGroup.MapGet("/status", (IMyService service) => 
    {
        return new 
        { 
            IsRunning = true, 
            CacheItems = service.GetCount(),
            Uptime = DateTime.Now - service.StartTime
        };
    });
}

```

### 动态更新配置

你可以注册一个 POST 接口，允许管理员在不重启主程序的情况下，动态修改插件的配置。

```csharp
public void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup)
{
    // 最终访问地址可能是: POST /admin/plugin/sharw.demo/config
    
    managementGroup.MapPost("/config", (MyConfig newConfig, IOptionsMonitor<MyConfig> monitor) => 
    {
        // 执行配置热更新逻辑
        // ...
        
        return Results.Ok("配置已更新，立即生效。");
    });
}

```

## 注意事项

::: warning 不要重复添加前缀
请记住 `managementGroup` 已经包含了插件名。如果你再次调用 `managementGroup.MapGroup($"/{Name}")`，最终的 URL 会变成 `/admin/plugin/{Name}/{Name}/...`，导致路径重复且难以访问。
:::

::: warning 安全风险提示
目前该功能**不会**自动集成鉴权系统。如果你在这里暴露了敏感操作（如“清空数据库”），请务必在代码中自行实现简易的令牌检查或 IP 白名单限制，否则任何人都可以触发该操作。
:::