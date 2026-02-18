# 依赖管理

插件系统提供了强大的依赖管理机制，确保插件在正确的环境中加载。依赖检查分为两个阶段：**声明式强依赖检查**和**自定义验证逻辑**。

## 声明式强依赖

每个插件都可以通过 `Dependencies` 属性声明其依赖的其他插件及其版本范围。这是最基本的检查机制。

```csharp
public class MyPlugin : IApiPlugin
{
    public string Name => "MyPlugin";
    public string Version => "1.0.0";

    // 声明依赖 CorePlugin，版本必须 >= 1.0.0
    public IDictionary<string, string> Dependencies => new Dictionary<string, string>
    {
        { "CorePlugin", ">=1.0.0" }
    };
    
    // ...
}
```

主程序在加载插件时，会首先检查所有声明的依赖插件是否存在于**候选插件列表**中，且版本符合要求。如果检查失败，插件将不会被加载。

## 自定义验证逻辑

在声明式检查通过后，主程序会调用 `ValidateDependency` 方法。这允许插件执行更复杂的验证逻辑，例如检查可选依赖、互斥关系或进行更高级的版本兼容性判断。

### 方法签名

```csharp
bool ValidateDependency(IDictionary<string, string> allCandidatePlugins);
```

*   **allCandidatePlugins**: 包含当前环境发现的所有候选插件及其版本的字典。

### 使用示例

以下示例展示了如何检查一个**可选依赖**。如果 `OptionalFeaturePlugin` 存在，则必须满足特定版本要求；如果不存在，本插件依然可以正常加载。

```csharp
public bool ValidateDependency(IDictionary<string, string> allCandidatePlugins)
{
    // 检查可选依赖
    if (allCandidatePlugins.TryGetValue("OptionalFeaturePlugin", out var version))
    {
        // 如果存在可选插件，检查其版本是否兼容
        // 假设我们需要排除掉不兼容的 2.0.0-beta 版本
        if (version == "2.0.0-beta")
        {
            // 返回 false 将阻止本插件加载，并在日志中记录警告
            return false; 
        }
    }

    // 验证通过
    return true; 
}
```

### 验证流程

1.  **收集候选插件**：主程序扫描并加载所有插件程序集，形成“候选插件列表”。
2.  **第一阶段（声明式）**：遍历每个插件的 `Dependencies` 属性，验证强依赖是否满足。
3.  **第二阶段（自定义）**：对满足强依赖的插件，调用 `ValidateDependency`。
    *   如果返回 `true`：插件进入“有效插件列表”。
    *   如果返回 `false`：插件被拒绝加载，且不会影响其他插件（除非其他插件依赖于它）。
