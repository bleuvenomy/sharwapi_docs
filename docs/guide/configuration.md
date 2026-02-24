# 配置指南

从v0.2.0开始 SharwAPI 的配置分为两个部分：**主程序配置**和**插件配置**。

这种分离设计是为了确保系统的稳定性：修改某个插件的配置不会影响到主程序或其他插件的运行。

## 主程序配置

主程序的配置文件名为 `appsettings.json`，位于程序运行的根目录下。它主要控制网络监听、日志记录等基础设施参数。

### 常见配置项

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ]
  },
  "Urls": "http://localhost:5000",
  "ApiInfo": {
    "Name": "Sharw's API",
    "Version": "1.0.0"
  },
  "RouteOverride": {
    "sharwapi.apimgr": "admin"
  }
}

```

* **Urls (监听地址)**
  * 控制主程序监听的 IP 和端口。
  * 默认值：`"http://localhost:5000"`
  * **示例**：如果你想让局域网内其他设备也能访问，并且将端口改为 8080，可修改为 `"http://0.0.0.0:8080"`。


* **Logging (日志级别)**
  * 控制终端输出日志的详细程度。
  * **Default**: 默认级别。通常设置为 `"Information"`。如果你遇到问题需要调试，可以将其改为 `"Debug"` 或 `"Trace"` 以查看更多细节。
  * **Microsoft**: 框架内部日志。建议保持 `"Warning"`，以免产生过多干扰信息。


* **ApiInfo (API 信息)**
  * 定义访问根路径 `/` 时返回的基础信息（如名称和版本号）。


* **RouteOverride (自定义插件路由)**
  * 允许你修改插件的默认路由前缀（默认情况下，插件路由前缀为插件名称）。
  * **配置方式**：在 `RouteOverride` 对象中添加键值对，键为**插件名称**，值为**新路由前缀**。
  * **限制**：新前缀仅允许包含字母和数字（`A-Z`, `a-z`, `0-9`）。如果包含非法字符，将回退使用默认插件名。
  * **示例**：`"sharwapi.apimgr": "admin"` 会将该插件的访问路径从 `/sharwapi.apimgr/...` 更改为 `/admin/...`。

## 插件配置

为了避免冲突，v0.2.0后的 SharwAPI 采用了 **配置隔离** 机制。插件的配置不存放在 `appsettings.json` 中。

### 配置文件位置

所有插件的配置文件都统一存放在主程序根目录下的 `config` 文件夹中。

### 命名规则

插件配置文件的命名规则为：`插件ID (Name).json`。

例如，如果你安装了一个 ID 为 `sharw.apimgr` 的插件：

1. 主程序会自动在 `config` 目录下读取 `sharw.apimgr.json`。
2. 如果该文件不存在，主程自动生成一个默认配置文件。

### 修改插件配置

1. 进入 `config` 目录。
2. 找到对应插件的 `.json` 文件。
3. 使用文本编辑器修改后保存。
4. **注意**：修改插件配置后，需要重启主程序才能生效。