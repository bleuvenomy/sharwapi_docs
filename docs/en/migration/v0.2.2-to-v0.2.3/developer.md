# Upgrading from v0.2.2 to v0.2.3 — Developer Guide

This page is for developers who **build SharwAPI plugins**, covering new capabilities available in v0.2.3.

v0.2.3 introduces **no breaking changes to plugin code**. All existing plugins compile and load without any modifications.

## Summary of Changes

| Type | Description |
|---|---|
| New plugin format | Directory format: place the `publish/` output folder directly in `plugins/` |
| New plugin format | `.sharw` format: bundle the plugin into a single ZIP archive |

## Required Actions

Existing plugins continue to work without any changes.

## New Capabilities (Optional)

### During development: use the folder format for rapid iteration

During development and debugging, copy the `dotnet publish` output directory directly into `plugins/` — no packaging step needed:

```bash
dotnet publish -c Debug -p:CopyLocalLockFileAssemblies=true
# Copy bin/Debug/net10.0/publish/ to plugins/MyPlugin/ in the host directory
```

### For distribution: use the .sharw format

For plugins that carry third-party dependencies — especially cross-platform native binaries — the `.sharw` format is the recommended distribution method.

Add the following MSBuild target to your `.csproj` to generate a `.sharw` package automatically on every `dotnet publish`:

```xml
<Target Name="CreateSharwPackage" AfterTargets="Publish">
  <ZipDirectory
    SourceDirectory="$(PublishDir)"
    DestinationFile="$(OutDir)$(AssemblyName).sharw"
    Overwrite="true" />
</Target>
```

For full details, see [.sharw Plugin Package](/en/plugin/sharw-package).
