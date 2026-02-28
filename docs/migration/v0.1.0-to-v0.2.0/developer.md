# 从 v0.1.0 升级到 v0.2.0 — 开发者侧

本页面面向**开发 SharwAPI 插件**的开发者，介绍从 v0.1.0 升级到 v0.2.0 时需要关注的接口变更和迁移操作。

如果你只是部署运维主程序，请阅读 [用户侧迁移指南](./user)。

## 接口无破坏性变更，但需重新编译

v0.2.0 对 `IApiPlugin` 接口的所有**原有方法**签名均未发生变化：

- [`RegisterServices(IServiceCollection, IConfiguration)`](/plugin/services)
- [`Configure(WebApplication)`](/plugin/middleware)
- [`RegisterRoutes(IEndpointRouteBuilder, IConfiguration)`](/plugin/routes)
- [`RegisterManagementEndpoints(IEndpointRouteBuilder)`](/plugin/management-endpoints)

所有**新增成员**均提供了默认实现。但是，本次升级有两项必要迁移，均需**重新编译**插件：

> ✅ `IApiPlugin` 接口原有成员**完全兼容**，无需修改现有逻辑。
>
> ⚠️ 需将插件项目**目标框架从 `net9.0` 升级至 `net10.0`** 并重新编译。
>
> ⚠️ 需将 `sharwapi.Contracts.Core` 的引用方式**从 `ProjectReference` 改为 NuGet `PackageReference`**。

## 必要迁移

本次升级对插件开发者有两项必要迁移，两者均需 **重新编译插件**。

### 第一项：升级目标框架至 .NET 10

`sharwapi.Contracts.Core` 已面向 `net10.0`。将插件的 `.csproj` 文件中的目标框架修改为 `net10.0`：

```xml
<!-- 修改前（v0.1.0） -->
<TargetFramework>net9.0</TargetFramework>

<!-- 修改后（v0.2.x） -->
<TargetFramework>net10.0</TargetFramework>
```

### 第二项：改为 NuGet 包引用

v0.1.0 时需要 `git clone` 源码并使用 `ProjectReference` 引入 `sharwapi.Contracts.Core`。v0.2.x 起，`sharwapi.Contracts.Core` 改为通过私有 NuGet 源分发。

**第一步**：在插件项目目录下创建（或更新）`nuget.config`，添加 SharwAPI 私有源：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="SharwAPI" value="https://nuget.hope-now.top/v3/index.json" />
  </packageSources>
</configuration>
```

**第二步**：将 `.csproj` 中对 `sharwapi.Contracts.Core` 的引用方式从 `ProjectReference` 改为 `PackageReference`：

```xml
<!-- 修改前（v0.1.0） -->
<ProjectReference Include="..\sharwapi.Contracts.Core\sharwapi.Contracts.Core.csproj" />

<!-- 修改后（v0.2.x） -->
<PackageReference Include="sharwapi.Contracts.Core" Version="0.2.*" />
```

::: tip 关于版本号
`Version="0.2.*"` 表示自动使用 0.2.x 系列的最新稳定版本。如需锁定具体版本，可将其替换为完整版本号（如 `Version="0.2.0"`）。
:::

**第三步**：如果之前工作目录中有 `sharwapi.Contracts.Core` 的源码目录，可以将其删除，不再需要保留。



## 接口对比

### v0.1.0

```csharp
public interface IApiPlugin
{
    string Name { get; }
    string Version { get; }
    string DisplayName { get; }

    void RegisterServices(IServiceCollection services, IConfiguration configuration);
    void Configure(WebApplication app);
    void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration);
    void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup) { ... }
}
```

### v0.2.x（新增成员以 `+` 标注）

```csharp
public interface IApiPlugin
{
    string Name { get; }
    string Version { get; }
    string DisplayName { get; }

  + IReadOnlyDictionary<string, string> Dependencies => new Dictionary<string, string>();
  + bool ValidateDependency(IReadOnlyDictionary<string, string> loadedPluginVersions) => true;
  + bool UseAutoRoutePrefix { get => false; }
  + object? DefaultConfig => null;

    void RegisterServices(IServiceCollection services, IConfiguration configuration);
    void Configure(WebApplication app);
    void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration);
    void RegisterManagementEndpoints(IEndpointRouteBuilder managementGroup) { ... }
}
```

## 重要变更：`configuration` 参数语义全面调整

这是本次升级**对插件逻辑影响最大**的变更，请务必关注。

v0.2.x 中，`RegisterServices()` 和 `RegisterRoutes()` 的 `configuration` 参数均改为**插件专属配置**（来自 `config/{插件名}.json`），不再是全局 `appsettings.json`：

| 方法 | v0.1.0 `configuration` 来源 | v0.2.x `configuration` 来源 |
|---|---|---|
| `RegisterServices()` | 全局 `appsettings.json` | 插件专属 `config/{插件名}.json` |
| `RegisterRoutes()` | 全局 `appsettings.json` | 插件专属 `config/{插件名}.json` |

这意味着插件的配置文件内容完全归属本插件，无需再担心与其他插件的键名冲突。

### 如何迁移

**旧写法（v0.1.0）：** 插件从全局配置中读取自定义节

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // 从 appsettings.json 的 MyPlugin 节读取配置
    var settings = configuration.GetSection("MyPlugin").Get<MyPluginSettings>();
    services.AddSingleton(settings);
}
```

**新写法（v0.2.x）：** 插件从独立配置文件读取，无需指定节名

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    // configuration 就是 config/MyPlugin.json 的内容，直接绑定根节点
    var settings = configuration.Get<MyPluginSettings>();
    services.AddSingleton(settings ?? new MyPluginSettings());
}
```

同时，将原本放在 `appsettings.json` 中的插件配置节移动到 `config/{插件名}.json`，并通过 `DefaultConfig` 提供默认值（见下文）。

## 新增特性使用指南

### 1. 声明插件依赖（`Dependencies`）

如果你的插件依赖其他插件，通过此属性声明，主程序会在启动时自动检查：

```csharp
public IReadOnlyDictionary<string, string> Dependencies => new Dictionary<string, string>
{
    // 格式：{ "插件Name", "版本范围" }
    { "sharwapi.Plugin.guard", "[1.0,2.0)" },  // 需要 guard 插件 1.0.x，不含 2.0
    { "sharwapi.Plugin.db", "*" }               // 需要 db 插件存在，不限版本
};
```

版本范围格式遵循 NuGet 规范，分为两类：

**间隔表示法**

| 格式 | 规则 | 描述 |
|---|---|---|
| `1.0` | x ≥ 1.0 | 最低版本（包含），**推荐用于声明最低依赖** |
| `[1.0]` | x == 1.0 | 精确版本匹配 |
| `(1.0,)` | x > 1.0 | 最低版本（独占） |
| `(,1.0]` | x ≤ 1.0 | 最高版本（包含） |
| `(,1.0)` | x < 1.0 | 最高版本（独占） |
| `[1.0,2.0]` | 1.0 ≤ x ≤ 2.0 | 精确范围（包含两端） |
| `(1.0,2.0)` | 1.0 < x < 2.0 | 精确范围（独占两端） |
| `[1.0,2.0)` | 1.0 ≤ x < 2.0 | 混合范围（常用：包含低端，独占高端） |

**可变版本解析**

| 格式 | 描述 |
|---|---|
| `*` | 不限版本，解析为最高稳定版本 |
| `1.1.*` | 1.1.x 系列的最高稳定版本 |

如果依赖未满足，该插件会被跳过并在日志中记录警告，主程序继续运行其他插件。

### 2. 自定义依赖验证（`ValidateDependency()`）

适合需要运行时判断的复杂场景（例如检查某个插件的具体版本范围无法用声明式语法表达）：

```csharp
public bool ValidateDependency(IReadOnlyDictionary<string, string> loadedPluginVersions)
{
    // loadedPluginVersions 包含已通过阶段一依赖检查的所有插件
    // 返回 false 则本插件不会被加载
    if (!loadedPluginVersions.TryGetValue("sharwapi.Plugin.auth", out var authVersion))
        return false;

    // 例：只与 auth 插件 2.x 兼容
    return authVersion.StartsWith("2.");
}
```

默认实现返回 `true`，不做额外验证，无需覆盖。

### 3. 启用自动路由前缀（`UseAutoRoutePrefix`）

启用后，`RegisterRoutes()` 中注册的路由会自动加上 `/{插件Name}/` 前缀，无需在每条路由中手动写前缀：

```csharp
public bool UseAutoRoutePrefix => true;

public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    // 实际路径：/my.plugin/hello（而非 /hello）
    app.MapGet("/hello", () => "Hello from plugin!");
}
```

::: tip
路由前缀可由主程序用户通过 `appsettings.json` 的 `RouteOverride` 节覆盖，但只允许纯字母数字，详见 [用户侧迁移指南](./user#第三步使用路由前缀覆盖可选)。
:::

### 4. 提供默认配置（`DefaultConfig`）

当 `config/{插件名}.json` 不存在时，主程序会将 `DefaultConfig` 返回的对象序列化为 JSON 并自动创建该文件：

```csharp
public object? DefaultConfig => new MyPluginSettings
{
    Host = "localhost",
    Port = 3306,
    Enabled = true
};
```

推荐同时定义一个带默认值的配置类：

```csharp
public class MyPluginSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 3306;
    public bool Enabled { get; set; } = true;
}
```

## 完整迁移示例

以下展示将一个 v0.1.0 插件完整迁移到 v0.2.x 的前后对比：

### v0.1.0 插件

```csharp
public class MyPlugin : IApiPlugin
{
    public string Name => "my.plugin";
    public string Version => "1.0.0";
    public string DisplayName => "My Plugin";

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        // 从全局配置读取
        var settings = configuration.GetSection("MyPlugin").Get<MyPluginSettings>()
                       ?? new MyPluginSettings();
        services.AddSingleton(settings);
    }

    public void Configure(WebApplication app) { }

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // 手动写完整路径
        app.MapGet("/my.plugin/hello", () => "Hello!");
    }
}
```

### v0.2.x 插件（推荐写法）

```csharp
public class MyPlugin : IApiPlugin
{
    public string Name => "my.plugin";
    public string Version => "1.0.0";
    public string DisplayName => "My Plugin";

    // 新增：自动路由前缀
    public bool UseAutoRoutePrefix => true;

    // 新增：默认配置（首次启动自动生成配置文件）
    public object? DefaultConfig => new MyPluginSettings();

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        // configuration 现在是 config/my.plugin.json 的内容，直接绑定根节点
        var settings = configuration.Get<MyPluginSettings>() ?? new MyPluginSettings();
        services.AddSingleton(settings);
    }

    public void Configure(WebApplication app) { }

    public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        // 不需要手动写前缀，UseAutoRoutePrefix 会自动处理
        app.MapGet("/hello", () => "Hello!");
    }
}
```

## 常见问题

**Q：我的插件不需要任何配置，需要实现 `DefaultConfig` 吗？**

不需要，默认返回 `null`，主程序不会创建配置文件。

**Q：如果我不更新插件代码，只是部署到 v0.2.x，会有什么问题？**

首先，由于主程序和 `sharwapi.Contracts.Core` 已升级至 .NET 10，插件必须重新编译（将目标框架更新为 `net10.0`）才能正常加载。如果只是更新目标框架而不修改其他代码，功能上基本兼容，但有两点差异：
1. `RegisterServices()` 中读取的配置源变了——原本从 `appsettings.json` 读取的插件专属节将读取不到（因为现在传入的是空的插件专属配置文件），可能导致插件使用默认值而非你预期的配置。
2. 路由路径不会自动加前缀（因为 `UseAutoRoutePrefix` 默认为 `false`），行为与 v0.1.0 一致。
