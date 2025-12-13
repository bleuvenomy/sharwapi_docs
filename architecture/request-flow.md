# 请求流

本文将详细解析一个 HTTP 请求在 SharwAPI 中的流转过程，帮助开发者理解请求是如何穿过核心框架并最终到达插件定义的端点的。

## 请求处理管道 (Pipeline)

当一个请求到达服务器时，它会依次经过以下环节：

### 1. 核心中间件
这些是宿主框架默认配置的中间件，用于处理全局性的基础设施逻辑：
- **ExceptionHandler**: 全局异常捕获。如果后续处理抛出未捕获异常，将在此处转化为标准的 JSON 错误响应。

### 2. 插件中间件
这是由各个插件在 `Configure` 方法中注册的中间件。
- **执行顺序**: 取决于插件的加载顺序。
- **职责**: 插件可以在此处拦截请求、修改请求上下文、进行鉴权或记录日志。
- **注意**: 如果某个插件中间件未调用 `next()`，请求将停止向后传递，后续环节将不会执行。

### 3. 路由匹配 (Routing)
请求通过中间件后，进入端点路由系统。
- 框架会根据 URL 路径查找匹配的端点（Endpoint）。
- 这些端点是由各个插件在 `RegisterRoutes` 方法中定义的。

### 4. 端点执行 (Endpoint Execution)
一旦找到匹配的端点，框架将执行对应的处理委托（Delegate）。
- **模型绑定**: 自动解析 URL 参数、查询字符串或 JSON Body。
- **依赖注入**: 自动注入处理逻辑所需的服务。
- **业务逻辑**: 执行插件编写的具体代码。

### 5. 响应返回
处理结果（如 JSON 数据、状态码）将沿着管道原路返回，最终发送给客户端。

## 流程图解

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    participant Client as 客户端
    participant Host as API本体
    participant Middleware as 中间件
    participant Plugin as 插件端点

    Client->>Host: 发送 HTTP 请求
    
    Host->>Middleware: 进入处理管道
    activate Middleware
    
    Note right of Middleware: 1. 核心中间件 (异常处理等)<br/>2. 插件中间件 (鉴权/日志)
    
    Middleware->>Middleware: 执行中间件逻辑
    
    Middleware->>Host: 请求通过，进行路由匹配
    deactivate Middleware
    
    Host->>Plugin: 匹配成功，调用插件端点
    activate Plugin
    
    Note right of Plugin: 执行业务逻辑<br/>依赖注入 & 模型绑定
    
    Plugin-->>Host: 返回处理结果
    deactivate Plugin

    Host-->>Client: 发送 HTTP 响应
```
