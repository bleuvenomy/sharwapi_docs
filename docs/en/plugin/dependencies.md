# Advanced Dependency Configuration

This guide details how to implement complex dependency validation logic in your plugins. To understand how the host resolves these dependencies, see [Dependency Resolution](/en/architecture/dependency-resolution) in the Architecture guide.

## Dependency Declaration (Review)

As mentioned in [Plugin Structure](/en/plugin/basic.md), the `Dependencies` property declares what your plugin **must** have to run.

```csharp
public IReadOnlyDictionary<string, string> Dependencies => new Dictionary<string, string>
{
    { "Sharw.Core", ">=1.0.0" }
};
```

## Custom Validation (ValidateDependency)

When your requirements go beyond simple "Name + Version Range" (e.g., optional dependencies, conflict detection), you should override the `ValidateDependency` method.

### Scenario 1: Optional Dependency

Some plugins can run standalone but enable extra features if another plugin is present.

```csharp
public bool ValidateDependency(IReadOnlyDictionary<string, string> validPlugins)
{
    // "OptionalFeaturePlugin" is NOT in the Dependencies property (not a hard requirement).
    // But if it exists, we want to ensure it is new enough to be compatible.
    // Note: validPlugins only contains plugins that have already passed the first stage
    //       (hard dependency check), not all candidate plugins.
    
    if (validPlugins.TryGetValue("OptionalFeaturePlugin", out var versionStr))
    {
        var version = Version.Parse(versionStr);
        if (version.Major < 2)
        {
            // If the optional plugin is too old, we can decide not to load ourselves
            // to prevent runtime compatibility issues.
            Console.WriteLine($"[Warning] OptionalFeaturePlugin found but version {version} is too old. Aborting load.");
            return false;
        }
    }

    return true; // Validation passed
}
```

### Scenario 2: Conflict Detection

If your plugin cannot coexist with another plugin.

```csharp
public bool ValidateDependency(IReadOnlyDictionary<string, string> validPlugins)
{
    // Note: validPlugins only contains plugins that passed the first-stage hard dependency check
    if (validPlugins.ContainsKey("My.Rival.Plugin"))
    {
        // Detected incompatible plugin, refuse to load.
        return false;
    }
    return true;
}
```

### Validation Flow

1. **Collect Candidates**: The main program scans and loads all plugin assemblies into a "candidate list".
2. **Stage 1 (Declarative)**: Iterates each plugin's `Dependencies` property to verify hard dependencies are satisfied.
3. **Stage 2 (Custom)**: For plugins that pass Stage 1, calls `ValidateDependency`.
    * If it returns `true`: The plugin enters the "valid plugins list".
    * If it returns `false`: The plugin is rejected and will not be loaded (unless other plugins depend on it, they may also be affected).


## Notes

::: tip Keep it Lightweight
`ValidateDependency` runs very early. The DI container is not ready. Do not access databases or files here; stick to logic based on plugin metadata.
:::

::: tip Logging
Since `ILogger` is not injected yet, use `Console` or throw exceptions with clear messages if validation fails. The host catches and logs these exceptions.
:::