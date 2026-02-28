# Upgrading from v0.2.1 to v0.2.2 — User Guide

This page is for users who **deploy and operate the SharwAPI host**, covering the breaking change introduced in v0.2.2 that requires action before upgrading.

If you are also a plugin developer, see the [Developer-side Migration Guide](./developer).

## Breaking Changes

### Plugin directory renamed: `Plugins/` → `plugins/`

The directory scanned by the host for plugin DLLs has been renamed from `Plugins` to `plugins` (lowercase initial letter).

**Affected environments**

| Environment | Impact |
|---|---|
| **Linux / macOS** | ⚠️ **Affected**: the file system is case-sensitive. You must manually rename the directory before upgrading, otherwise all plugins will fail to load |
| **Windows** | ✅ Not affected: the file system is case-insensitive, no action required |

**Required action for Linux / macOS users**

Before replacing the host binary, rename the existing plugin directory:

```bash
mv Plugins plugins
```

Then restart the new host binary.

## Upgrade Checklist

1. (**Linux / macOS**) Rename the plugin directory from `Plugins/` to `plugins/`
2. Replace the old host executable with the new one
3. Start the new host and check the startup logs to confirm plugins are loading correctly
