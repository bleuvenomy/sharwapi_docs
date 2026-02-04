# 插件开发概览

在 SharwAPI 中，**主程序**不包含任何业务代码，所有的功能都由**插件**来实现。

本章将引导你配置开发环境，并连接到官方的插件源。

## 什么是插件？

从技术角度看，插件本质上只是一个普通的 `.dll` 文件（类库）。

之所以它能被 SharwAPI 主程序识别并加载，是因为它遵守了一套特定的规则。这套规则在代码中被称为 **插件协议**（即 `IApiPlugin` 接口）。

你可以把开发插件的过程想象成 **“填写一份标准的入职表格”**。只要你的代码按照表格要求填好了信息（名称、版本）并提供了必要的功能（路由、服务），主程序就会接纳并运行它。

## 插件协议 (IApiPlugin)

插件协议定义了主程序与插件交互的所有方式。任何插件都必须引用并实现 `SharwAPI.Contracts.Core` 库。

该接口主要包含以下两类成员：

### 身份信息
用于告诉主程序“我是谁”。

- **Name (唯一标识)**: 插件的全局唯一 ID。
  - **规范**: 采用 **`作者名.插件名`** 的格式。全小写，使用点号 `.` 分隔。使用模板创建时会自动替换。
  - **示例**: `"sharwapi.apimgr"`
  - **注意**: 这个 ID 通常会用作 API 路由的前缀（如 `/sharw.apimgr/...`），请确保它简洁且具有辨识度。
- **DisplayName (显示名称)**: 给人类看的名字，会显示在插件列表或管理界面中。
  - **示例**: `"API Manager"`
- **Version (版本号)**: 插件的版本。
  - **规范**: 必须遵守 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/) 标准。
  - **示例**: `"1.0.0"`, `"0.1.0-beta"`

### 核心功能
用于告诉主程序“我要做什么”。

- **RegisterServices (注册工具)**
  - **作用**: 类似于往公共工具箱里放入你的工具。
  - **场景**: 注册数据库连接、读取配置文件、注册后台定时任务。
- **Configure (配置管道)**
  - **作用**: 类似于设置安检关卡。
  - **场景**: 添加请求日志、进行权限拦截（中间件）。
- **RegisterRoutes (定义接口)**
  - **作用**: 类似于填写路标。
  - **场景**: 定义用户访问哪个 URL（如 `/api/hello`）时执行哪段代码。

## 开发环境准备

### 基础工具
- **开发工具**: [Visual Studio](https://visualstudio.microsoft.com/zh-hans/vs/) 或 [Visual Studio Code](https://code.visualstudio.com/Download)
- **SDK**: [.NET 9 SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet/9.0) 或更高版本
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

其中 `-n` 是这个插件项目的名称，`--Author` 则是插件的作者

```bash
dotnet new sharwapiplugin -n apimgr --Author sharwapi
```

输入完成后会在当前目录下创建一个名为 `apimgr` 的项目，插件名称会自动替换成 `sharwapi.apimgr`，命名空间会自动替换成 `sharwapi.Plugin.apimgr`

2. **查看项目**
模板会自动为你：
   * 创建标准的文件夹结构。
   * 自动引用最新版的 **插件协议库** (`SharwAPI.Contracts.Core`)。
   * 生成示例代码。