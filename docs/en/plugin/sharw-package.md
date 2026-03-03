# .sharw Plugin Package

`.sharw` is the recommended plugin distribution format for the SharwAPI framework. It is designed for plugins that carry third-party dependencies, including cross-platform native binaries. Compared to manually deploying a folder, the `.sharw` format bundles the plugin and all its dependencies into a single file, greatly simplifying distribution and installation.

## Format Overview

A `.sharw` file is simply a standard **ZIP archive** with a different extension. You can open or create one using any ZIP-compatible tool.

A standard `.sharw` package, when extracted, has the following layout:

```
MyPlugin.sharw (extracted)
├── MyPlugin.dll              # Plugin entry assembly (must implement IApiPlugin)
├── MyPlugin.deps.json        # .NET dependency manifest (auto-generated at build time)
├── SomeDependency.dll        # Third-party managed dependency
├── runtimes/                 # Cross-platform native library directory (optional)
│   ├── win-x64/
│   │   └── native/
│   │       └── e_sqlite3.dll
│   └── linux-x64/
│       └── native/
│           └── libe_sqlite3.so
```

## Building a .sharw Package

### Method 1: dotnet publish + Manual Packaging

This is the most universal approach and works with any project.

**Step 1: Publish the plugin**

Run the following command from the plugin project root:

```bash
dotnet publish -c Release -p:CopyLocalLockFileAssemblies=true
```

::: tip
`-p:CopyLocalLockFileAssemblies=true` instructs the publish process to copy all NuGet dependencies — including native binaries under `runtimes/` — into the output directory, ensuring the resulting `.sharw` package contains a complete dependency chain.
:::

**Step 2: Navigate to the publish output directory**

```
bin/Release/net10.0/win-x64/publish/
```

**Step 3: Archive all files in the publish directory as a ZIP and rename the extension to `.sharw`**

```bash
# Windows PowerShell
Compress-Archive -Path "bin/Release/net10.0/win-x64/publish/*" -DestinationPath "MyPlugin.zip"
Rename-Item "MyPlugin.zip" "MyPlugin.sharw"
```

```bash
# Linux / macOS
cd bin/Release/net10.0/win-x64/publish/
zip -r ../../../../../../../../MyPlugin.sharw .
```

::: warning Watch the archive structure
Make sure `.dll` files are at the **root** of the archive, not inside a subfolder. Incorrect: `MyPlugin.sharw/MyPlugin/MyPlugin.dll`. Correct: `MyPlugin.sharw/MyPlugin.dll`.
:::

### Method 2: MSBuild Automation (Recommended)

Add an `AfterPublish` target to your `.csproj` to automatically produce a `.sharw` file after every `dotnet publish`:

```xml
<Target Name="PackageSharw" AfterTargets="Publish">
  <ZipDirectory
    SourceDirectory="$(PublishDir)"
    DestinationFile="$(OutDir)$(AssemblyName).sharw"
    Overwrite="true" />
</Target>
```

With this in place, every `dotnet publish` will automatically generate a `.sharw` file under `bin/Release/net10.0/`.

## Installing a Plugin

Simply drop the `.sharw` file into the host application's `plugins/` directory:

```
plugins/
└── MyPlugin.sharw    ← place it here
```

On startup, the host will automatically:
1. Detect all `.sharw` files under `plugins/`
2. Extract each one to `plugins/.cache/MyPlugin/`
3. Skip re-extraction if the `.sharw` file has not been modified (cache is valid)
4. Load the plugin from the cache directory

::: tip Cache directory
`plugins/.cache/` is managed automatically by the host — no manual action is needed. To force a re-extraction, either delete the corresponding cache subdirectory or replace the `.sharw` file (updating its modification timestamp).
:::

## Comparison with Other Formats

| Format | Location | Best For |
| --- | --- | --- |
| **Single DLL** | `plugins/*.dll` | Minimal plugins with no third-party dependencies |
| **Folder plugin** | `plugins/{Name}/` | Development and debugging — easy to swap individual files |
| **.sharw package** | `plugins/*.sharw` | **Recommended for production distribution** — complete dependencies, easy installation |

::: tip Development Tip
During development and debugging, the **folder plugin** format is recommended. Simply copy your `publish` output to `plugins/{Name}/` for fast iteration. Switch to `.sharw` packaging when you are ready to distribute.
:::
