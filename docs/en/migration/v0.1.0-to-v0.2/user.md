# Migrating from v0.1.0 to v0.2.x — Users

This page is for users who **deploy and operate the SharwAPI host**, covering configuration changes and steps required when upgrading from v0.1.0 to v0.2.x.

If you are also a plugin developer, please also read the [Developer Migration Guide](./developer).

## Before You Upgrade

- Back up your existing `appsettings.json`
- Back up all plugin files in the `Plugins/` directory

## Step 1: Update `appsettings.json`

This is the **only manual configuration change** required for this upgrade. The logging system has switched from .NET's built-in logging to Serilog, and the configuration section structure has changed completely.

### Before (v0.1.0)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Urls": "http://localhost:5000",
  "ApiInfo": {
    "Name": "Sharw's API",
    "Version": "0.1.0"
  }
}
```

### After (v0.2.x)

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "Async",
        "Args": {
          "configure": [
            {
              "Name": "File",
              "Args": {
                "path": "logs/log-.txt",
                "rollingInterval": "Day",
                "retainedFileCountLimit": 30,
                "fileSizeLimitBytes": 10485760,
                "rollOnFileSizeLimit": true
              }
            }
          ]
        }
      }
    ],
    "Enrich": [ "FromLogContext" ]
  },
  "Urls": "http://localhost:5000",
  "ApiInfo": {
    "Name": "Sharw's API",
    "Version": "0.2.0"
  },
  "RouteOverride": {
  }
}
```

### Summary of Changes

| Item | Action |
|---|---|
| Remove `Logging` section | Replace with `Serilog` section |
| Add `Serilog` section | Copy the configuration above and adjust log levels as needed |
| Add `RouteOverride` section | Keep as an empty object `{}` and fill in as needed |
| `ApiInfo.Version` | Recommended to update to `0.2.0` |

## Step 2: Understand the New Directory Structure

After starting v0.2.x, the following directories and files are created automatically (no manual action needed):

```
Application directory/
├── Plugins/         ← Plugin directory (same as v0.1.0)
├── config/          ← NEW: Per-plugin configuration directory
│   ├── PluginA.json ← PluginA config (auto-generated on first start)
│   └── PluginB.json ← PluginB config (auto-generated on first start)
└── logs/            ← NEW: Log file directory
    └── log-20260225.txt
```

::: tip About Plugin Config Files
If a plugin provides a default configuration (via the `DefaultConfig` property), the system will **automatically generate** `config/{PluginName}.json` on first startup. You can edit this file after it is created to change the plugin's configuration. The host supports config file hot-reload, but whether changes take effect without a restart depends on whether the plugin itself has implemented configuration change handling. **Restarting the host is recommended to ensure changes take effect.**
:::

## Step 3: Use Route Prefix Overrides (Optional)

If you want to change a plugin's URL path prefix without modifying plugin code (only applies to plugins with `UseAutoRoutePrefix` enabled), add configuration to the `RouteOverride` section in `appsettings.json`:

```json
{
  "RouteOverride": {
    "my.plugin": "api"
  }
}
```

This changes `my.plugin`'s route prefix from `/my.plugin/` to `/api/`.

::: warning Note
The value of `RouteOverride` may only contain letters and digits (`A-Z`, `a-z`, `0-9`). Slashes, hyphens, and other special characters are not supported. Invalid values are ignored and fall back to the default prefix.
:::

## FAQ

**Q: After upgrading, the application fails to start with a missing configuration section error.**

Check that `appsettings.json` has been updated to replace `Logging` with `Serilog`, and confirm that the `RouteOverride` section exists (even as an empty object).

**Q: The `logs/` directory is consuming too much disk space.**

Adjust `retainedFileCountLimit` (days to retain) and `fileSizeLimitBytes` (max file size) in the `Serilog.WriteTo[File].Args` section of `appsettings.json`.

**Q: Will my existing plugins still work on v0.2.x?**

Yes. The original method signatures in `IApiPlugin` are unchanged. Existing plugins do not need to be recompiled to run on v0.2.x (all new interface members have default implementations).
