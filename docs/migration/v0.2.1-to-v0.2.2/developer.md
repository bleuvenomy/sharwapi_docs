# 从 v0.2.1 升级到 v0.2.2 — 开发者侧

本页面面向**开发 SharwAPI 插件**的开发者，介绍从 v0.2.1 升级到 v0.2.2 时可以利用的新接口能力。

v0.2.2 **对插件代码没有任何破坏性变更**，所有现有插件代码可直接编译通过，无需修改。

::: warning 同时负责部署的开发者请注意
v0.2.2 包含一项用户侧破坏性变更：插件目录已由 `Plugins/` 重命名为 `plugins/`。如果你在 Linux 或 macOS 上部署，请参阅 [用户侧迁移指南](./user) 了解必要操作。
:::

## 变更概览

| 类型 | 成员 | 说明 |
|---|---|---|
| 新增属性 | `DataDirectory` | 插件专属数据目录的完整路径 |
| 新增方法 | `GetDataPath(string)` | 相对于数据目录拼接路径的快捷方法 |
| 主程序行为 | 自动目录创建 | 启动时自动创建 `DataDirectory` 指向的目录 |

## 必要操作

### 更新 `sharwapi.Contracts.Core` 版本

如果你的插件使用了 `Version="0.2.*"` 的包引用，NuGet 还原时会自动获取 v0.2.5，**无需手动操作**。

如果你锁定了具体版本号，将其更新为 `0.2.5`：

```xml
<!-- 修改前 -->
<PackageReference Include="sharwapi.Contracts.Core" Version="0.2.4" />

<!-- 修改后 -->
<PackageReference Include="sharwapi.Contracts.Core" Version="0.2.5" />
```

重新编译后，两个新成员即可使用。**现有代码无需任何改动。**

## 使用新能力（可选）

### 使用 `DataDirectory` 存储文件

你可以直接在插件中通过 `DataDirectory` 获取专属目录路径：

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var dbPath = Path.Combine(DataDirectory, "plugin.db");
    services.AddDbContext<MyDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));
}
```

### 使用 `GetDataPath` 简化路径拼接

`GetDataPath` 等价于 `Path.Combine(DataDirectory, relativePath)`，但更简洁：

```csharp
// 等价写法
var keyPath1 = Path.Combine(DataDirectory, "keys", "private.pem");
var keyPath2 = GetDataPath("keys/private.pem");  // 推荐
```

### 与配置文件配合：支持用户自定义路径

推荐在 `DefaultConfig` 中将路径字段设为**相对路径字符串**，Core 会在首次启动时将其写入配置文件。在 `RegisterServices` 中通过 `GetDataPath` 将其解析为绝对路径后再使用。

```csharp
public object? DefaultConfig => new MySettings
{
    // ✅ 推荐：在 DefaultConfig 中存相对路径
    PrivateKeyPath = "keys/private.pem"
};

public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var settings = configuration.Get<MySettings>()!;

    // GetDataPath 将配置中的相对路径解析为绝对路径：
    // "private.pem"             → {DataDirectory}/private.pem
    // "keys/private.pem"        → {DataDirectory}/keys/private.pem
    var resolvedPath = GetDataPath(settings.PrivateKeyPath);

    if (!File.Exists(resolvedPath))
        GenerateKeyPair(resolvedPath);

    services.Configure<MySettings>(configuration);
}
```

### 自定义数据目录位置

为了插件生态的标准化和规范化，**不建议将文件存储到插件专属目录以外的位置**。插件的所有持久化文件均应存放在 `DataDirectory`（即 `{BaseDir}/data/{Name}/`）中。

这样做的好处包括：目录结构清晰、备份迭代方便、部署迁移时所有插件数据集中在同一个 `data/` 目录下。