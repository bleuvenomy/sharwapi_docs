# 开发环境准备

## 基础工具
- **开发工具**: [Visual Studio](https://visualstudio.microsoft.com/zh-hans/vs/) 或 [Visual Studio Code](https://code.visualstudio.com/Download)
- **SDK**: [.NET 10 SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet/10.0) 或更高版本
- **Git**: [Git 客户端](https://git-scm.org/)

### 配置插件源
SharwAPI 提供了官方的 NuGet 源，用于分发**插件协议库**和**项目模板**。你需要将其添加到你的开发环境中。

打开终端，执行以下命令：

```bash
dotnet nuget add source https://nuget.hope-now.top/v3/index.json --name SharwAPI
```

添加成功后，你的开发环境就能找到 SharwAPI 相关的依赖包了。

### 安装开发模板

为了简化开发流程，我们提供了标准可以在命令行使用的脚手架模板。

在终端执行以下命令安装模板：

```bash
dotnet new install SharwAPI.Templates

```

## 创建你的第一个插件

环境配置完成后，创建插件项目变得非常简单。

1. **新建项目**
   
找一个文件夹，执行以下命令。

*其中 `-n` 是这个插件项目的名称，`--Author` 则是插件的作者*

```bash
dotnet new sharwapiplugin -n apimgr --Author sharwapi
```

输入完成后会在当前目录下创建一个名为 `apimgr` 的项目，插件名称会自动替换成 `sharwapi.apimgr`，命名空间会自动替换成 `sharwapi.Plugin.apimgr`。

2. **查看项目**
   
模板会自动为你：
   * 创建标准的文件夹结构。
   * 自动引用最新版的 **插件协议库** (`SharwAPI.Contracts.Core`)。
   * 生成示例代码。

## 编译与发布

当你写完代码后，需要将其编译成主程序可以加载的 `.dll` 文件。

### 编译项目

在插件项目的根目录下，打开终端并运行以下命令：

```bash
dotnet publish -c Release

```

这条命令会以 Release（发布）模式编译你的代码，并将其打包。

### 获取插件文件

编译完成后，请前往输出目录：
`bin/Release/net10.0/publish/`

在该目录下，你会找到一个与你项目同名的 `.dll` 文件（例如 `Sharw.Plugin.apimgr.dll`）。

### 安装运行

1. 将生成的 `.dll` 文件复制到 **主程序** 的 `Plugins` 文件夹中。
2. 运行（或重启）主程序。
3. 观察启动日志，如果看到 `Loaded Plugin: sharw.apimgr v1.0.0`，说明插件已成功加载。