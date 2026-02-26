# Plugin System

The plugin system is the core of SharwAPI. This article explains how plugins are discovered, loaded, and how their lifecycles are managed by the main program.

## Loading Mechanism

The main program uses **AssemblyLoadContext (ALC)** technology to implement isolated loading of plugins. This process is fully automated and consists of the following steps:

1.  **Directory Scanning**: When the main program starts, it automatically checks the `Plugins` folder in the root directory.
2.  **Context Creation**: For each plugin `.dll` file found, a separate `PluginLoadContext` (isolated environment) is created.
3.  **Isolated Loading**:
    *   Loads the plugin assembly and its dependencies into their respective contexts.
    *   **Smart Resolution**: The plugin's own dependencies (e.g., `Newtonsoft.Json v13.0`) are visible only within the current context; shared libraries (e.g., `Sharw.Contracts`) automatically fall back to the main program context to ensure type compatibility.
4.  **Instance Creation**: Looks for a class implementing the `IApiPlugin` interface within the isolated environment and creates an instance of it.
    * **Current Limitation**: Only the first discovered `IApiPlugin` implementation in each plugin DLL will be loaded.
    * **Recommendation**: Keep exactly one plugin entry class per DLL to avoid additional implementations being ignored.
5.  **Dependency Check**:
    *   Iterates through all loaded plugins, checking the dependencies declared in their `Dependencies` property.
    *   **Existence Check**: Ensures that depended-on plugins are loaded.
    *   **Version Compatibility**: Validates whether the dependency plugin's `Version` satisfies the declared version range (supports formats like `[1.0, 2.0)` or `1.*`).
    *   **Auto Unload**: If dependencies are not met, the main program logs an error and removes the plugin from the active list to prevent runtime errors.
6.  **Plugin Running**: Plugins that pass the dependency check formally enter the running state.

::: info About Dependencies
Starting from version v0.2.0, SharwAPI uses **AssemblyLoadContext** technology to achieve isolated loading of plugins.
This completely resolves dependency issues where different plugins use different versions of the same third-party library, as they run in their own isolated environments without interfering with each other.

However, versions of SharwAPI prior to v0.2.0 used a **Shared Load Context** strategy.
This meant all plugins and the main program ran in the same "environment". If Plugin A and Plugin B referenced different versions of the same third-party library, it could lead to version conflicts or runtime errors.
:::

## Isolation Standards

To prevent plugins from interfering with each other, SharwAPI adopts the following isolation strategies:

### Configuration Isolation (Physical Isolation)
SharwAPI abandons the traditional global `appsettings.json` mixed configuration pattern in favor of **independent file configuration**.
*   **Mechanism**: When the main program starts, it automatically reads the JSON file with the same name as the plugin in the `config/` directory (e.g., `config/sharw.demo.json`).
*   **Injection**: When calling `RegisterServices`, the `configuration` parameter passed to the plugin will **only contain** the content of that file.
*   **Advantage**: Plugins do not need to worry about configuration key collisions, nor do they need to use `GetSection` for multi-layer nesting; they can read directly from the root node.

### Route Partitioning (Logical Isolation)
When defining endpoints in `RegisterRoutes`, it is **strongly recommended** to enable automatic prefix mode (`UseAutoRoutePrefix = true`).
This ensures that all your APIs are safely confined under `/api/{PluginName}/`, completely eliminating route conflicts.

### Service Naming (Logical Isolation)
Although logic is isolated, the **Dependency Injection (DI) Container** is still globally shared. When registering services in `RegisterServices`, it is still recommended to use the **plugin name** as a prefix.
*   **Recommended**: `services.AddHttpClient("sharw.demo.client", ...)`
*   **Avoid**: `services.AddHttpClient("client", ...)` (Easily overwritten by other plugins)

## Lifecycle Management

Plugin instances are **globally unique (Singleton)** throughout the application's runtime.
This means there is only one object of the `IApiPlugin` implementation class in memory, and the main program holds it until shutdown.

### Key Lifecycle Hooks

Plugins intervene in different startup stages of the main program by implementing the following four methods:

1.  **RegisterServices**
    *   **Stage**: Before application build.
    *   **Function**: Registers dependency services (e.g., database services, background tasks) into the global container.


2.  **Configure (Configure Pipeline)**
    *   **Timing**: After application build, before startup.
    *   **Function**: Inserts middleware (e.g., logging, authentication logic) into the HTTP request processing pipeline.


3.  **RegisterRoutes (Map Routes)**
    *   **Timing**: After middleware configuration.
    *   **Function**: Defines user-facing business API endpoints (e.g., `/api/demo/hello`).
    *   **Note**: All HTTP requests pass through middleware defined in `Configure` first and reach here **last**. For details, please refer to [Request Flow](/en/architecture/request-flow).


4.  **RegisterManagementEndpoints (Mount Management)**
    *   **Timing**: Called on-demand by the invoker.
    *   **Function**: Defines operations endpoints strictly for administrators (e.g., `/admin/plugin/demo/status`). These endpoints are typically used for checking plugin liveness, forcing config reloads, etc., and are not open to regular users. For details, please refer to [Management Endpoints](/en/plugin/management-endpoints).

## Development Tooling Notes

* **Swagger / OpenAPI UI is enabled only in Development**: the host mounts Swagger middleware and UI only under `IsDevelopment()`.
* In production, Swagger pages are not exposed by default. If documentation endpoints are needed, provide a controlled solution (for example, an authenticated documentation gateway).