# 快速开始

## API本体(Core API)

### 基本要求

虽然本项目流畅运行对服务器性能的要求特别低，但因为你可能会加载的插件，我们推荐你的服务器配置如下

- 系统：Windows x64 / Linux x64
- CPU：1 核或更高
- 内存：1GB 或更高
- 硬盘：5GB 可用空间
- 运行时：[ASP.NET Core 9 Runtime](https://dotnet.microsoft.com/zh-cn/download/dotnet/9.0)

---

### 运行

前往[Github Release](https://github.com/SharwOrange/sharwapi.Core/releases)下载你对应平台的版本，将压缩包解压到你喜欢的地方，并运行

::: code-group

```bash [Windows PowerShell]
$ ./sharwapi.Core
```

```bash [Linux]
$ chmod +x ./sharwapi.Core

$ ./sharwapi.Core
```
:::

运行后，你应该会在终端看到类似如下的启动日志：

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
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Production
info: Microsoft.Hosting.Lifetime[0]
      Content root path: /srv/sharwapi
```

打开浏览器，访问`http://localhost:5000`。

如果你的浏览器显示出API名称，版本号以及运行时间，那你的API就已经上线了！

下一步，你可以对你的API加入[插件](#插件plugin)，或是开发你自己的插件以实现功能了

::: tip 关于监听地址
`Now listening on: http://localhost:5000`中的链接就是你API的地址，你可以在`appsettings.json`中的`Urls`中修改监听的地址
:::

## 插件(Plugin)

在这里，我们就用官方的API Manager插件进行示例

### 下载插件

要快速找到你想要的插件，有两种方法，一种是去到索引仓库的`plugins`文件夹中查找，另一种则是前往官方提供的网页版插件市场中下载

- [Sharw's API插件索引仓库](https://github.com/sharwapi/sharwapi_Plugins_Collection)
- [Sharw's API插件市场](https://sharwapi.hope-now.top/market)

在这里我们要安装的是API Manager这个插件，在我们找到 [API Manager插件的GitHub库](https://github.com/sharwapi/sharwapi.Plugin.apimgr) 后，按照`README.md`的说明，前往 [Releases](https://github.com/sharwapi/sharwapi.Plugin.apimgr/releases) 中下载插件

::: warning 安全性警告
Core API没有任何代码安全的检查，因此无法检测插件是否存在危险代码，无论是官方插件还是任何第三方插件，我们都强烈建议在加载前查阅代码。确保安全后再进行加载

官方索引仓库只负责存放插件的README文件，不存放项目源码，审核也只有初次提交到索引仓库时审核，下载时会导向该插件存储库(不受官方控制)，所以也请不要对在官方渠道查找到的插件放松
:::

---

### 安装插件

要安装插件，你可以将下载下来的插件(以.dll文件形式)放入API本体目录下的 `Plugins` 文件夹中，然后重启API本体

在这里，我们将[前文](#下载插件)下载下来的插件放入API本体目录下的 `Plugins` 文件中，就像下面这样

```powershell
PS /srv/sharwapi/Plugins> ls

    Directory: /srv/sharwapi/Plugins

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          2025/11/15    14:22           8192 sharwapi.Plugin.Admin.dll
```
随后重启API本体，插件就顺利载入了

有些插件可能需要额外配置(比如说在appsettings.json中添加配置项)，请以插件的README文件为准