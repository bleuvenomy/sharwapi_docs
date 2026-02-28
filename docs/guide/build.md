# 从源码构建

通常情况下，建议您直接使用 [Releases](https://github.com/SharwOrange/sharwapi.Core/releases) 中的预编译版本。

如果您需要修改主程序的源代码，或者开发新的插件，则需要从源码进行构建。

## 准备工作

在开始之前，请确保您的开发环境已安装以下工具：

- **版本控制工具**: [Git](https://git-scm.org/)
- **编译环境**: [.NET 10 SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet/10.0) 或更高版本
- **代码编辑器**: [Visual Studio](https://visualstudio.microsoft.com/zh-hans/vs/) 或 [Visual Studio Code](https://code.visualstudio.com/Download)

## 项目结构说明

SharwAPI 的源码由两个核心部分组成：

1.  **主程序 (sharwapi.Core)**: 负责加载插件、处理网络请求的运行程序。
2.  **插件接口库 (sharwapi.Contracts.Core)**: 定义了插件与主程序通信的规则（接口）。主程序和所有插件都必须引用它。

## 构建步骤

为了确保主程序能正确识别接口，我们需要将这两个项目放在一起构建。

### 初始化工作区

首先，创建一个文件夹作为工作区，并初始化一个空的解决方案文件（`.sln`），用于管理所有项目。

```bash
# 创建并进入工作目录
mkdir sharwapi-source
cd sharwapi-source

# 创建解决方案文件
dotnet new sln --name SharwAPI

```

### 拉取源码

接下来，我们需要分别拉取 **主程序** 和 **插件接口库** 的代码。

```bash
# 1. 拉取主程序代码
git clone https://github.com/sharwapi/sharwapi.Core.git

# 2. 拉取插件接口库代码
git clone https://github.com/sharwapi/sharwapi.Contracts.Core.git

```

### 关联项目

将下载好的两个项目添加到解决方案中，并建立引用关系。

```bash
# 将项目加入解决方案
dotnet sln add sharwapi.Core/sharwapi.Core.csproj
dotnet sln add sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj

# 让主程序引用接口库
dotnet add sharwapi.Core/sharwapi.Core.csproj reference sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj

```

### 编译与发布

现在可以编译主程序了。执行以下命令生成可执行文件：

```bash
# 编译主程序 (Release 模式)
dotnet publish sharwapi.Core/sharwapi.Core.csproj -c Release

```

编译完成后，可以在 `./sharwapi.Core/bin/Release/net10.0/publish` 目录下找到生成的文件。

### 运行验证

进入发布目录，运行生成的主程序：

```bash
cd sharwapi.Core/bin/Release/net10.0/publish

# 运行程序
dotnet sharwapi.Core.dll

```

如果看到启动日志，说明构建成功。

## 构建插件

如果您想自己编译某个插件（以官方的 API Manager 为例），流程也非常相似。

### 拉取插件源码

在工作区目录下，拉取插件的代码：

```bash
git clone https://github.com/sharwapi/sharwapi.Plugin.apimgr.git

```

### 关联接口库

插件同样依赖于**插件接口库**。我们需要将插件项目加入解决方案，并添加引用。

```bash
# 加入解决方案
dotnet sln add sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj

# 添加对接口库的引用
dotnet add sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj reference sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj

```

### 编译插件

```bash
dotnet publish sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj -c Release

```

### 安装插件

编译完成后，在插件项目的发布目录（`bin/Release/net10.0/publish`）中找到生成的 `.dll` 文件（例如 `sharwapi.Plugin.apimgr.dll`）。

将该文件复制到主程序目录下的 `plugins` 文件夹中，重启主程序即可生效。