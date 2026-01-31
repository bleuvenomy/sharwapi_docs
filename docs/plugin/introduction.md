---
coren: SharwAPI.Core
contn: SharwAPI.Contracts.Core
apin: IApiPlugin
---

# 插件开发概览

在 SharwAPI 中，**主程序**不包含任何业务代码，所有的功能都由**插件**来实现。

本章将引导你编写自己的插件。

::: tip 前提知识
SharwApi使用[依赖注入 (DI / Dependency Injection)](https://learn.microsoft.com/zh-cn/dotnet/core/extensions/dependency-injection/overview)和[ASP.NET](https://dotnet.microsoft.com/en-us/apps/aspnet)的[WebApplication](https://learn.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.builder.webapplication)。强烈建议先进行了解，以更顺畅的了解下文并编写插件。
:::
::: warning 注意
教程假定你有一定的编程基础、基本了解DI、WebApplication，并懂得如何使用搜索引擎和AI这些工具来辅助理解。
:::

## 什么是插件？

插件本质上只是一个普通的 `.dll` 文件（类库）。

它之所以能被 SharwAPI 主程序识别并加载，是因为它遵守了一套特定的规则。这套规则被称为 **插件协议**，实际表现为插件内部实现了 `{{ $frontmatter.apin }}` 接口。

你可以把开发插件的过程想象成 **“填写一份标准的入职表格”**。只要你的代码按照表格要求填好了信息（名称、版本）并提供了必要的功能（路由、服务），主程序就会接纳并运行它。

## 插件协议 (IApiPlugin)

插件协议定义了主程序与插件交互的所有方式。任何插件都必须引用 `{{ $frontmatter.contn }}` 库，并实现其中的`{{ $frontmatter.apin }}`接口。

该接口主要包含以下两类成员：

### 身份信息
用于告诉主程序“我是谁”。

- **Name (唯一标识)**: 插件的全局唯一 ID。
  - **规范**: 推荐采用 **`作者名.插件名`** 的格式。全小写，使用点号 `.` 分隔。
  - **示例**: `"sharwapi.apimgr"`
  - **注意**: 这个 ID 通常会用作 API 路由的前缀（如 `/sharw.apimgr/...`），请确保它简洁且**唯一**。
- **DisplayName (显示名称)**: 给人类看的名字，会显示在插件列表或管理界面中。
  - **示例**: `"API Manager"`
- **Version (版本号)**: 插件的版本。
  - **规范**: 必须遵守 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/) 标准。
  - **示例**: `"1.0.0"`, `"0.1.0-beta"`

### 核心功能
类似于告诉主程序“我想要做什么。

- **RegisterServices (注册工具)**
  - **作用**: 往公共工具箱（服务集合）里放入你的工具（服务）。
  - **场景**: 注册数据库连接、读取配置文件、注册后台定时任务、注册自己的服务。
- **Configure (配置管道)**
  - **作用**: 设置安检关卡（中间件）。
  - **场景**: 添加请求日志、进行请求拦截。
- **RegisterRoutes (定义接口)**
  - **作用**: 填写路标。
  - **场景**: 定义用户访问哪个 URL（如 `/api/hello`）时执行哪段代码。