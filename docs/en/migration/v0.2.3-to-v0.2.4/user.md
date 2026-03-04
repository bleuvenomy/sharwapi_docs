# Upgrading from v0.2.3 to v0.2.4 — User Guide

This page is for users who **deploy and operate the SharwAPI host**, covering what to expect when upgrading from v0.2.3 to v0.2.4.

v0.2.4 contains **no breaking changes**. Simply replace the host binary to complete the upgrade — no changes to existing plugins or configuration files are required.

If you are also a plugin developer, see the [Developer Migration Guide](./developer).

## Breaking Changes

None.

## Upgrade Steps

1. Replace the old host executable with the new one
2. Start the host normally — no further action needed

## New Capabilities

No configuration changes are needed. Any existing `RouteOverride` entries will automatically trigger the `OnRoutePrefixResolved` callback on the corresponding plugin (if that plugin implements the method) after upgrading.
