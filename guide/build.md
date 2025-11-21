# 手动构建

如果你想要抢先体验未发布的新功能，给项目做贡献，或者你需要开发插件，您可以使用源码库的代码进行手动构建并部署。

---

[[toc]]

---

::: tip 术语统一
在接下来的内容中，为了预防理解困难，再次介绍各术语和其对应的项目
- **CoreAPI** 、 **API本体** 、 **sharwapi.Core** ：均指代 **API框架本体** ，仅包含负责插件加载、路由注册等底层任务代码
- **Contracts** 、**接口层** 、**Contracts.Core** : 均指代 **定义插件与核心框架之间通信的接口** ，插件需要实现 `IApiPlugin` 接口，核心框架通过此接口与插件进行交互

而命令行中则统一使用Linux的文件分隔符(`/`)
:::

## 准备步骤

为了构建项目，你需要先准备以下工具：

- [Git](https://git-scm.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/zh-cn/download/dotnet/9.0)
- [Visual Studio](https://visualstudio.microsoft.com/zh-hans/vs/) 或 [Visual Studio Code](https://code.visualstudio.com/Download)

并且新建一个解决方案文件(.sln)，命令如下

```
mkdir sharwapi
cd sharwapi
dotnet new sln --name sharwapi
```

至此你的准备工作已经完成，接下来可以进行API本体(CoreAPI)的构建

### API本体(CoreAPI)的代码拉取

在刚刚新建解决方案文件的目录，输入以下命令即可拉取代码

::: code-group

```bash [HTTP Clone]
$ git clone https://github.com/sharwapi/sharwapi.Core.git
```

```bash [SSH Clone]
$ git clone git@github.com:sharwapi/sharwapi.Core.git
```
:::

随后将拉取下来的源码添加到解决方案中

```bash
$ dotnet sln sharwapi.sln add sharwapi.Core/sharwapi.Core.csproj
```

接下来你可以继续对接口层的拉取

### 接口层的代码拉取

::: tip 接口的简短介绍
在介绍中虽然并没有介绍接口层，但是其是作为API本体(CoreAPI)与插件(Plugin)沟通的渠道。插件实现了这个接口才能被API识别到，并正常加载。API也依赖于这个接口层才能正常运行。接口层将在后续的[架构](/architecture/)一章中详细介绍
:::

在刚刚新建的解决方案文件的目录中，输入以下命令即可拉取代码

::: code-group

```bash [HTTP Clone]
$ git clone https://github.com/sharwapi/sharwapi.Contracts.Core.git
```

```bash [SSH Clone]
$ git clone git@github.com:sharwapi/sharwapi.Contracts.Core.git
```
:::

随后将拉取下来的源码添加到解决方案中

```bash
$ dotnet sln sharwapi.sln add sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj
```

至此，API本体(Core API)的代码拉取完毕，你可以往下[开始构建](#开始构建)，或是进入[插件](#插件plugin)一节开始你的插件开发

## API本体构建

在构建之前，请先确保 **API本体(CoreAPI)** 和 **接口层(Contracts.Core)** 位于你的解决方案中

随后执行如下命令或在Visual Studio中进行生成

::: code-group

```bash [Visual Studio Code]
dotnet build sharwapi.sln
```
```plain [Visual Studio]
在菜单栏中选择 “生成(Build)” -> “生成解决方案(Build Solution)”。
```
:::

随后你应该能在 `./sharwapi.Core/bin/Debug/net9.0` 中看到编译出来的 `sharwapi.Core`

至此编译完成，可以运行如下命令运行编译后的API

```bash
dotnet ./sharwapi.Core/bin/Debug/net9.0/sharwapi.Core.dll
```

## 插件构建

在此使用官方提供的API Manager插件进行演示

在刚刚新建的解决方案文件的目录中，输入以下命令即可拉取插件代码

::: code-group

```bash [HTTP Clone]
$ git clone https://github.com/sharwapi/sharwapi.Plugin.apimgr.git
```

```bash [SSH Clone]
$ git clone git@github.com:sharwapi/sharwapi.Plugin.apimgr.git
```
:::

随后将拉取下来的源码添加到解决方案中

```bash
$ dotnet sln sharwapi.sln add sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj
```

随后执行如下命令或在Visual Studio中进行生成

::: code-group

```bash [Visual Studio Code]
dotnet build sharwapi.sln
```
```plain [Visual Studio]
在菜单栏中选择 “生成(Build)” -> “生成解决方案(Build Solution)”。
```
随后你应该能在 `./sharwapi.Plugin.apimgr/bin/Debug/net9.0` 中看到编译出来的 `sharwapi.Plugin.apimgr.dll`

将编译出来的 `sharwapi.Plugin.apimgr.dll` 放入 `./sharwapi.Core/bin/debug/net9.0/Plugins` (即 **API本体** 目录下的 `Plugins` 文件夹内)

再运行 **API本体** ，若看到类似下文的提示，你的插件就载入完成了

```bash
Loaded Plugin: apimgr vx.x.x
```