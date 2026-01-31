# 日志系统原理

本文将介绍 SharwAPI 日志系统的设计思路与工作原理。

SharwAPI 采用了集中式的日志管理架构，目的是为了让**主程序**统一管理所有日志的输出格式和存储位置，同时让**插件**只需专注于记录日志内容本身。

## 架构概览

日志系统的核心是由 **Serilog** 库驱动的。主程序在启动时，会通过特定的配置将其挂载到系统中，接管所有的日志记录任务。

核心设计思想是：**主程序负责配置，插件负责使用**。

### 1. 主程序集成

在主程序启动的构建阶段，SharwAPI 会读取配置文件并初始化日志系统。这一步发生在任何插件加载之前，确保了从一开始就能记录到完整的系统行为。

以下是主程序初始化日志系统的关键代码逻辑：

```csharp
// 1. 构建配置：读取 appsettings.json 文件
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

// 2. 初始化全局 Logger：让 Serilog 准备好
sharwapi.Core.Logger.Initialize(configuration);
Log.Information("Starting web host");

// 3. 挂载到主程序：告诉系统使用 Serilog 来处理所有日志
// 这一步之后，无论是系统内部产生的日志，还是插件里记录的日志，都归它管。
builder.Host.UseSerilog();
```

这意味着：
*   **统一接管**：所有通过标准接口 (`ILogger`) 输出的日志，最终都会交给 Serilog 处理。
*   **全覆盖**：这不仅包括插件的日志，也包括 ASP.NET Core 框架内部（如 Web 服务器启动、路由匹配）的日志。

### 2. 配置驱动

由于日志系统完全由主程序接管，因此日志的行为（例如输出到控制台还是文件、日志文件的切分策略等）完全由主程序的配置文件 `appsettings.json` 控制。

这种设计实现了**配置与代码的分离**。如果你想改变日志的存储位置，只需要修改配置文件，而不需要重新编译任何插件代码。

### 3. 上下文丰富

SharwAPI 默认配置了日志的“上下文增强”功能。这意味着每条日志在记录时，会自动附带当前的运行环境信息，例如：

*   **ThreadId**: 线程 ID，用于分析并发问题。
*   **MachineName**: 服务器名称，用于区分多台服务器的日志。
*   **EnvironmentName**: 运行环境（开发环境或生产环境）。

这对于排查问题非常有帮助，因为你可以清楚地知道一条日志是在什么环境下、哪台机器上产生的。

## 为什么选择 Serilog？

SharwAPI 选择 Serilog 而不是其他日志库，主要是看重它的 **结构化日志 (Structured Logging)** 能力。

### 什么是结构化日志？

在传统的日志系统中，日志通常只是一段普通的文本。

*   **传统方式**：
    `Log.Info("User " + userId + " logged in");`
    
    结果是一段字符串："User 123 logged in"。计算机很难理解这段文字里的 "123" 是什么意思。

*   **结构化方式 (Serilog)**：
    `Log.Info("User {UserId} logged in", userId);`

    在这种模式下，日志不再仅仅是一段文本，而是一条包含数据的记录。`UserId` 作为一个独立的字段被保留了下来。

当我们将日志发送到专业的日志分析平台（如 Seq 或 ELK）时，我们可以像查询数据库一样查询日志：

`Select * From Logs Where UserId = 123`

这极大地提高了排查问题的效率，尤其是在日志数据量巨大的生产环境中。
