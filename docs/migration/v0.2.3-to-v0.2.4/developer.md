# 从 v0.2.3 升级到 v0.2.4 — 开发者侧

本页面面向**开发 SharwAPI 插件**的开发者，介绍从 v0.2.3 升级到 v0.2.4 时可以利用的新能力。

v0.2.4（Contracts v0.2.6）**对插件代码没有任何破坏性变更**，所有现有插件代码可直接编译通过，无需修改。

## 变更概览

| 类型 | 说明 |
|---|---|
| 新增接口方法 | `IApiPlugin.OnRoutePrefixResolved(string, bool)`，含默认空实现 |

## 必要操作

将 `sharwapi.Contracts.Core` 包升级到 **v0.2.6**，现有插件代码无需任何其他修改。

## 使用新能力（可选）

### 感知路由前缀更改

运维人员可通过 `appsettings.json` 中的 `RouteOverride` 节将你的插件前缀改为任意字母数字组合。此前插件无法感知这一变更。如果你的插件需要在启动时知道自己最终生效的路由前缀（例如用于日志、自描述接口或内部路径拼接），可以重写 `OnRoutePrefixResolved`：

```csharp
public class MyPlugin : IApiPlugin
{
    private string _routePrefix = string.Empty;

    public string Name => "myplugin";
    public bool UseAutoRoutePrefix => true;

    public void OnRoutePrefixResolved(string resolvedPrefix, bool isOverridden)
    {
        _routePrefix = resolvedPrefix;
        if (isOverridden)
        {
            // 前缀已被运维人员通过 RouteOverride 配置覆盖
        }
    }

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // 此时 _routePrefix 已持有最终生效的前缀
        app.MapGet("/info", () => new { prefix = _routePrefix });
    }
}
```

::: tip 调用时机
`OnRoutePrefixResolved` 在 `RegisterRoutes` 之前被调用，因此可以安全地在 `RegisterRoutes` 中使用该回调中保存的值。
:::

详细说明请参阅 [路由注册 → 感知路由前缀更改](/plugin/routes#感知路由前缀更改-onrouteprefixresolved)。
