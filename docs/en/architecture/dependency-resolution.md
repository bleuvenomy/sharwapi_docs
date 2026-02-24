# Dependency Resolution

SharwAPI's plugin loader uses a rigorous dependency resolution algorithm to ensure that every plugin's dependency environment is fully ready before any plugin is instantiated.

## Loading Flow

1.  **Scan**: The `PluginLoader` scans all DLL files in the plugins directory and reads the metadata of types implementing `IApiPlugin`. No instantiation happens yet.
2.  **Graph Build**: A directed dependency graph is built based on `Name` and `Dependencies` properties.
3.  **Topological Sort**: The graph is sorted to determine the correct loading sequence. Cyclic dependencies (A -> B -> A) will cause the process to abort with an error.
4.  **Validation**:
    *   **Phase 1 (Declarative)**: Checks for the existence of strong dependencies and their version ranges.
    *   **Phase 2 (Imperative)**: Instantiates the plugin and calls `ValidateDependency` for custom logic.
5.  **Initialization**: Calls `RegisterServices` and `Configure` in the sorted order.

## Validation Phases

### Phase 1: Declarative Check

This is a static check based on SemVer (Semantic Versioning).

*   **Input**: `Dependencies` dictionary from the plugin.
*   **Logic**:
    *   Checks if the target plugin exists in the **Candidate List**.
    *   Verifies if the target plugin's `Version` falls within the required range (e.g., `[1.0, 2.0)`).
*   **Result**: If any strong dependency is missing or version mismatch, the plugin is marked `Invalid`.

### Phase 2: Custom Validation

After passing the declarative check, the loader invokes `ValidateDependency`.

*   **Input**: `validPlugins` (All valid plugins that passed Phase 1, along with their versions).
*   **Purpose**: Allows plugins to handle logic that cannot be expressed by simple version ranges.
    *   *“If Plugin A exists, I need it to be at least patch version x.y.z.”*
    *   *“I am incompatible with Plugin B; reject loading if it exists.”*
*   **Mechanism**: The plugin is instantiated but hasn't registered any services or routes yet. Returning `false` discards this plugin instance.

::: tip Design Philosophy
dependency validation is performed before initialization to ensure that when `RegisterServices` is called, you can safely inject services from dependent plugins without worrying about null reference exceptions.
:::
