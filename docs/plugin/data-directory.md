# 插件数据目录

从 v0.2.2 版本开始，`IApiPlugin` 接口提供了 `DataDirectory` 属性和 `GetDataPath` 方法，用于在插件专属目录中存储持久化文件。

## DataDirectory

`DataDirectory` 返回插件专属数据目录的完整路径，默认值为 `{BaseDir}/data/{插件名}/`。

```csharp
// 接口默认实现
string DataDirectory => Path.Combine(AppContext.BaseDirectory, "data", Name);
```

主程序在加载插件时会**自动创建**此目录，插件无需手动调用 `Directory.CreateDirectory`。

### 目录结构示例

```
{BaseDir}/
├── config/
│   └── my.plugin.json        ← 插件配置文件
├── plugins/
│   └── my.plugin.dll
└── data/
    └── my.plugin/            ← DataDirectory，主程序自动创建
        ├── plugin.db
        └── keys/
            └── private.pem
```

::: tip
`DataDirectory` 仅作为只读属性使用，不建议在插件中重写此属性。为了插件生态的标准化和规范化，插件的所有持久化文件应始终存放在专属数据目录内。
:::

## GetDataPath

`GetDataPath(string relativePath)` 是 `DataDirectory` 的路径拼接快捷方法，将相对路径解析为完整的绝对路径：

```csharp
string GetDataPath(string relativePath) => Path.Combine(DataDirectory, relativePath);
```

### 使用示例

```csharp
// 等价写法对比
var path1 = Path.Combine(DataDirectory, "keys", "private.pem");
var path2 = GetDataPath("keys/private.pem");  // ✅ 推荐，更简洁
```

支持多级子目录，`Path.Combine` 会自动处理跨平台路径分隔符：

```csharp
GetDataPath("keys/2026/private.pem")
// Windows: {DataDirectory}\keys\2026\private.pem
// Linux:   {DataDirectory}/keys/2026/private.pem
```

## 在 RegisterServices 中使用

### 基本用法：存储单个文件

```csharp
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var dbPath = GetDataPath("plugin.db");
    services.AddDbContext<MyDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));
}
```

### 与配置文件配合：路径由配置决定

推荐在 `DefaultConfig` 中将路径字段设为**相对路径字符串**，在 `RegisterServices` 中通过 `GetDataPath` 解析为绝对路径。这样用户可以看到并理解文件存在哪里，而无需修改代码：

```csharp
// 1. 定义配置模型
public class MySettings
{
    public string DatabasePath   { get; set; } = "";
    public string PrivateKeyPath { get; set; } = "";
}

// 2. 在 DefaultConfig 中预填相对路径
public object? DefaultConfig => new MySettings
{
    DatabasePath   = "plugin.db",
    PrivateKeyPath = "keys/private.pem"
};

// 3. 在 RegisterServices 中解析路径
public void RegisterServices(IServiceCollection services, IConfiguration configuration)
{
    var settings = configuration.Get<MySettings>()!;

    // GetDataPath 将配置中的相对路径解析为绝对路径
    var dbPath  = GetDataPath(settings.DatabasePath);
    var keyPath = GetDataPath(settings.PrivateKeyPath);

    // 若密钥不存在则生成
    if (!File.Exists(keyPath))
        GenerateKeyPair(keyPath);

    services.AddDbContext<MyDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));

    services.Configure<MySettings>(configuration);
}
```

首次启动后，主程序生成的 `config/my.plugin.json` 内容如下：

```json
{
  "DatabasePath": "plugin.db",
  "PrivateKeyPath": "keys/private.pem"
}
```

用户阅读配置文件时可以清楚地看到文件的相对位置，知道它们在 `data/my.plugin/` 目录下。

### 在路由中按需生成文件

数据目录同样可以在路由处理器中使用：

```csharp
public void RegisterRoutes(IEndpointRouteBuilder app, IConfiguration configuration)
{
    app.MapGet("/export", () =>
    {
        var outputPath = GetDataPath($"exports/export-{DateTime.Now:yyyyMMddHHmmss}.csv");
        
        // 确保子目录存在
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        File.WriteAllText(outputPath, "id,name\n1,example");

        return Results.Ok(new { file = outputPath });
    });
}
```
