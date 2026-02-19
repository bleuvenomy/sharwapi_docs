# Advanced Dependency Configuration

This guide details how to implement complex dependency validation logic in your plugins. To understand how the host resolves these dependencies, see [Dependency Resolution](/en/architecture/dependency-resolution) in the Architecture guide.

## Declaration (Review)

As mentioned in [Plugin Structure](/en/plugin/basic.md), the `Dependencies` property declares what your plugin **must** have to run.

```csharp
public IDictionary<string, string> Dependencies => new Dictionary<string, string>
{
    { "Sharw.Core", ">=1.0.0" }
};
```

## Custom Validation (ValidateDependency)

When your requirements go beyond simple "Name + Version Range" (e.g., optional dependencies, conflict detection), you should override the `ValidateDependency` method.

### Scenario 1: Optional Dependency

Some plugins can run standalone but enable extra features if another plugin is present.

```csharp
public bool ValidateDependency(IDictionary<string, string> allCandidatePlugins)
{
    // "OptionalFeaturePlugin" is NOT in Dependencies property.
    // But if it exists, we might want to check its version.
    
    if (allCandidatePlugins.TryGetValue("OptionalFeaturePlugin", out var versionStr))
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
public bool ValidateDependency(IDictionary<string, string> allCandidatePlugins)
{
    if (allCandidatePlugins.ContainsKey("My.Rival.Plugin"))
    {
        // Detected incompatible plugin, refuse to load.
        return false;
    }
    return true;
}
```

### Best Practices

1.  **Keep it Lightweight**: `ValidateDependency` runs very early. The DI container is not ready. Do not access databases or files here; stick to logic based on plugin metadata.
2.  **Logging**: Since `ILogger` is not injected yet, use `Console` or throw exceptions with clear messages if validation fails. The host catches and logs these exceptions.
