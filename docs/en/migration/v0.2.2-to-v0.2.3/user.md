# Upgrading from v0.2.2 to v0.2.3 — User Guide

This page is for users who **deploy and operate the SharwAPI host**, covering what to expect when upgrading from v0.2.2 to v0.2.3.

v0.2.3 contains **no breaking changes**. Simply replace the host binary to complete the upgrade — no changes to existing plugins are required.

If you are also a plugin developer, see the [Developer Migration Guide](./developer).

## Breaking Changes

None.

## Upgrade Steps

1. Replace the old host executable with the new one
2. Start the host normally — no further action needed

## New Capabilities

After upgrading, the `plugins/` directory additionally supports the following two plugin formats:

| Format | Example | Description |
|---|---|---|
| **Directory** | `plugins/MyPlugin/` | A folder containing the DLL and its dependencies |
| **.sharw package** | `plugins/MyPlugin.sharw` | A single-file ZIP archive |

Existing plugins do not need to be moved or reformatted — all formats coexist in the same `plugins/` directory.
