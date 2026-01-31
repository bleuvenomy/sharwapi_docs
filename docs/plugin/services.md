# 注册服务 (RegisterServices)

`RegisterServices` 是插件中用于**注册依赖注入服务**的方法。

它的主要作用是建立**依赖关系**。在现代软件开发中，我们通过“依赖注入 (DI)”容器来管理对象。通过此方法，你可以：

1.  **请求服务（消费者）**：配置你的插件需要使用的外部工具（如 HTTP 客户端、数据库连接）。
2.  **提供服务（提供者）**：注册你的业务逻辑类，使其能被插件自身其他部分或其他插件使用。

同时，依赖注入类会自动注入依赖服务到消费者，同时管理服务的生命周期。

## 托管模式

SharwAPI 采用[依赖注入](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)的“托管模式”来管理对象。这意味着你不需要在代码中手动编写 `new ServiceClass()`，而是由主程序根据你的配置自动管理对象、自动注入依赖。

这种方式有两个主要优势：
1. **生命周期管理**：系统会自动处理对象的释放，避免内存泄漏。
2. **实例共享**：可以轻松实现跨插件或跨请求的数据共享。

## 服务生命周期

在注册服务时，需要根据业务需求选择合适的[依赖注入的生命周期](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes)，这决定了对象在内存中存在的时间。

### 1. Transient (瞬时)
* **行为**：每次获取该服务时，都会创建一个全新的对象。用完即弃。
* **适用场景**：轻量级的、无状态的工具类（如简单的计算器、数据格式化工具）。
* **例子**：`services.AddTransient<MyService>();`

### 2. Scoped (作用域)
* **行为**：在同一个 HTTP 请求的处理过程中，多次获取该服务将返回同一个对象。当请求结束时，对象会被销毁。
* **适用场景**：数据库上下文 (`DbContext`) 或需要在一个请求内保持状态的业务服务。这是开发中最常用的模式。
* **例子**：`services.AddScoped<MyService>();`

### 3. Singleton (单例)
* **行为**：在应用程序的整个运行期间，该服务只有一个对象。所有请求和插件都共享这一个实例。
* **适用场景**：缓存服务、全局配置读取、后台定时任务。
* **例子**：`services.AddSingleton<MyService>();`

## 常用操作

### 请求外部资源 (我是消费者)

当你的插件需要访问外部网络时，应注册相应的客户端（例如使用 `HttpClient`）。

```csharp
// 注册一个名为 "baidu" 的客户端，并预设基础地址
services.AddHttpClient("baidu", client =>
{
    client.BaseAddress = new Uri("https://api.baidu.com");
    client.DefaultRequestHeaders.Add("User-Agent", "SharwAPI-Plugin");
});

```

### 提供公共服务 (我是提供者)

如果你编写了一个功能强大的类（例如数据库操作服务），并希望它能被**当前插件**甚至**其他插件**使用，你需要将其注册到容器中。

```csharp
// 注册为单例服务：全系统共享同一个 MyDatabaseService 实例
services.AddSingleton<IDatabaseService, MyDatabaseService>();

```

注册后，任何插件（包括你自己）只需在构造函数或路由处理方法中声明 `IDatabaseService` 类型参数，主程序就会自动注入你注册的那个实例。

### 读取配置

方法的第二个参数 `IConfiguration` 用于访问配置数据。它包含了插件目录下的同名配置文件（`config/你的插件名.json`）。

```csharp
// 方式一：直接读取特定字段
var apiKey = configuration["ApiKey"];

// 方式二：将配置段绑定到对象 (推荐)
services.Configure<MyOptions>(configuration);
```

此部分内容详见 [配置处理](/plugin/configuration)


::: danger 严禁手动构建
请 **绝对不要** 在此方法中调用 `services.BuildServiceProvider()`。

```csharp
// 错误示范
var provider = services.BuildServiceProvider(); 

```

该操作会强制创建一个独立于主程序的**容器副本**，导致以下严重后果：

1. **单例失效**：主程序和你的插件将各自持有一个独立的单例对象，数据无法互通。
2. **依赖丢失**：你的插件无法获取在之后注册的其他服务。
3. **内存风险**：该副本容器可能无法被正确释放，从而导致内存泄漏。
:::