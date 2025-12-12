# 架构一览

本文将从宏观角度介绍 API框架 的整体架构设计。API框架 采用微内核架构（Microkernel Architecture），核心框架仅负责最基础的生命周期管理，而具体的业务功能完全由插件系统驱动。

## 核心设计理念

SharwAPI 的设计遵循以下核心原则：

1.  **微内核 (Microkernel)**: API 本体（CoreAPI）极其精简，不包含任何具体的业务逻辑。
2.  **插件化 (Plugin-based)**: 所有功能（包括路由、服务、中间件）均通过插件实现。
3.  **依赖注入 (DI) 驱动**: 深度集成 ASP.NET Core 的 DI 容器，实现模块间的松耦合。

## 系统分层

整体架构可以分为以下三层：

### 1. 宿主层 (Host Layer)
即 `sharwapi.Core` 项目。
- **职责**:
    - 启动 ASP.NET Core 运行时。
    - 加载配置文件 (`appsettings.json`)。
    - 扫描并加载插件程序集 (`.dll`)。
    - 初始化全局 DI 容器。
    - 编排插件的生命周期方法 (`RegisterServices`, `Configure`, `RegisterRoutes`)。

### 2. 接口层 (Contract Layer)
即 `sharwapi.Contracts.Core` 项目。
- **职责**:
    - 定义核心接口 `IApiPlugin`。
    - 提供插件开发所需的公共依赖。
    - 确保宿主与插件之间的通信协议一致。

### 3. 插件层 (Plugin Layer)
即各个 `sharwapi.Plugin.*` 项目。
- **职责**:
    - 实现具体的业务逻辑。
    - 注册特定的服务和中间件。
    - 定义 API 端点。

## 启动流程

SharwAPI 的启动流程严格遵循以下顺序：

1.  **初始化**: 创建 `WebApplicationBuilder`，配置日志和基础选项。
2.  **插件加载**: 扫描 `Plugins` 目录，反射加载实现了 `IApiPlugin` 的程序集。
3.  **服务注册**: 遍历所有插件，调用 `RegisterServices`。此时插件将自己的服务注入到全局 DI 容器中。
4.  **构建应用**: 调用 `builder.Build()`，生成 `WebApplication` 实例。
5.  **中间件配置**: 遍历所有插件，调用 `Configure`。插件将自己的中间件插入到请求管道中。
6.  **路由注册**: 遍历所有插件，调用 `RegisterRoutes`。插件定义具体的 API 端点。
7.  **运行**: 启动 Web 服务器，开始监听请求。
