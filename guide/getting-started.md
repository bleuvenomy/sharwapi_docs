# 快速开始

本文将引导你下载并运行 SharwAPI 的**主程序**，并安装你的第一个**插件**。

## 准备工作

SharwAPI 非常轻量，几乎可以在任何设备上运行。为了获得良好的体验，建议你的设备满足以下基本条件：

- **操作系统**：Windows x64 或 Linux x64
- **处理器**：1 核或更高
- **内存**：512M 或更高
- **运行环境**：需安装 [ASP.NET Core 9 Runtime](https://dotnet.microsoft.com/zh-cn/download/dotnet/9.0)

## 运行主程序

主程序（SharwAPI.Core）是整个系统的基础，负责加载插件和处理网络请求。

### 下载与解压
请前往 [Github Releases](https://github.com/SharwOrange/sharwapi.Core/releases) 页面，下载适合你操作系统的版本。下载完成后，将压缩包解压到任意目录。

### 启动程序
打开终端（命令行），进入解压后的目录，执行以下命令启动：

::: code-group

```bash [Windows PowerShell]
# 或直接双击打开程序
$ ./sharwapi.Core
```

```bash [Linux]
# 首次运行前赋予执行权限
$ chmod +x ./sharwapi.Core

# 启动程序
$ ./sharwapi.Core
```
:::

启动成功后，你会在终端看到类似下面的日志，这表示主程序已经开始工作，并自动创建了插件目录（`Plugins`）：

```text
$ ./sharwapi.Core
info: PluginLoader[0]
      Plugins directory did not exist and was created at /srv/sharwapi/Plugins
info: PluginLoader[0]
      Registering plugin services...
info: sharwapi.Core[0]
      Configuring plugin middleware...
info: sharwapi.Core[0]
      Registering plugin routes...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

此时，你可以打开浏览器访问 `http://localhost:5000`。如果看到显示 API 名称和运行时间的页面，说明主程序已成功运行。

::: tip 修改端口
默认情况下程序监听 `5000` 端口。如果需要修改，可以打开目录下的 `appsettings.json` 文件，找到 `Urls` 字段进行配置。
:::

## 安装插件

SharwAPI 的功能完全依赖于插件。安装插件的过程非常简单，就像给游戏安装 Mod 一样：**下载文件，放入文件夹，重启程序**。

下面以官方的 **API Manager** 插件为例进行演示。

### 获取插件

你可以通过以下途径获取插件文件（通常是 `.dll` 格式）：

* [SharwAPI 插件市场](https://sharwapi-market.hope-now.top)
* [插件索引仓库](https://github.com/sharwapi/sharwapi_Plugins_Collection)

在本例中，请前往 [API Manager 的发布页](https://github.com/sharwapi/sharwapi.Plugin.apimgr/releases) 下载最新版本的插件文件。

### 安装步骤

1. 找到主程序目录下的 `Plugins` 文件夹（如果没有，请先运行一次主程序让其自动生成，或手动创建）。
2. 将下载好的插件文件（例如 `sharwapi.Plugin.apimgr.dll`）复制到 `Plugins` 文件夹中。
3. **重启** SharwAPI 主程序。

### 验证安装

重启后，查看终端日志。如果你看到类似 `Loaded Plugin: apimgr v1.0.0` 的提示，说明插件已成功加载。

::: warning 来源信任
由于插件与主程序运行在同一个进程中，插件拥有较高的系统权限。为了安全起见，请**仅安装来自官方或你信任的开发者**发布的插件。
:::