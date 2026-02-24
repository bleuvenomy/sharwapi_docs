# 高级依赖配置

本文档详细介绍如何在插件中实现复杂的依赖验证逻辑。如果您想了解主程序是如何解析这些依赖的，请参阅架构文档中的 [依赖解析机制](/architecture/dependency-resolution)。

## 依赖声明 (基础回顾)

我们在 [插件结构](/plugin/basic.md) 中已经介绍了 `Dependencies` 属性。它用于声明您的插件**必须**依赖哪些其他插件才能运行。

```csharp
public IReadOnlyDictionary<string, string> Dependencies => new Dictionary<string, string>
{
    { "Sharw.Core", ">=1.0.0" }
};
```

## 自定义验证逻辑 (ValidateDependency)

当您的依赖需求超出了简单的“名称+版本范围”时（例如可选依赖、互斥检查），您需要重写 `ValidateDependency` 方法。

### 场景一：可选依赖 (Optional Dependency)

有些插件可以独立运行，但如果检测到环境中存在另一个插件，它会开启额外功能。此时，您可能需要检查那个“可选伙伴”的版本是否足够新。

```csharp
public bool ValidateDependency(IReadOnlyDictionary<string, string> validPlugins)
{
    // "OptionalFeaturePlugin" 不是必须的，所以不在 Dependencies 中声明。
    // 但如果它存在，我们希望确保它至少是 2.0 版本，否则为了兼容性，我们可以选择不加载自己，或者仅仅是在日志中记录警告（但在本方法中只能决定是否加载自己）。
    // 注意：传入的 validPlugins 只包含已通过第一阶段（强依赖检查）的有效插件，不是所有候选插件。
    
    if (validPlugins.TryGetValue("OptionalFeaturePlugin", out var versionStr))
    {
        var version = Version.Parse(versionStr);
        if (version.Major < 2)
        {
            // 如果可选依赖版本过低，您可以选择拒绝加载，防止运行时向其发送不兼容的调用
            Console.WriteLine($"[警告] 检测到 OptionalFeaturePlugin 但版本 {version} 过低，本插件无法兼容，停止加载。");
            return false; 
        }
    }

    return true; // 验证通过
}
```

### 场景二：冲突检测 (Conflict Detection)

如果您的插件与另一个插件功能完全冲突，不能同时存在。

```csharp
public bool ValidateDependency(IReadOnlyDictionary<string, string> validPlugins)
{
    // 注意：validPlugins 只包含已通过第一阶段强依赖检查的插件
    if (validPlugins.ContainsKey("My.Rival.Plugin"))
    {
        // 发现死对头插件，拒绝加载
        return false;
    }
    return true;
}
```

### 验证流程

1.  **收集候选插件**：主程序扫描并加载所有插件程序集，形成“候选插件列表”。
2.  **第一阶段（声明式）**：遍历每个插件的 `Dependencies` 属性，验证强依赖是否满足。
3.  **第二阶段（自定义）**：对满足强依赖的插件，调用 `ValidateDependency`。
    *   如果返回 `true`：插件进入“有效插件列表”。
    *   如果返回 `false`：插件被拒绝加载，且不会影响其他插件（除非其他插件依赖于它）。


### 注意事项

::: tip 保持轻量
`ValidateDependency` 在插件生命周期的早期执行，此时依赖注入容器尚未构建。请不要尝试在此处访问数据库或配置文件，仅进行基于插件元数据的逻辑判断。
:::

::: tip 日志记录
此方法目前没有直接传入 `ILogger`（因为容器还没准备好）。如果验证失败，建议通过 `Console` 或抛出带有详细信息的异常来告知用户原因，主程序捕获异常时会记录它。
:::