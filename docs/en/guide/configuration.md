# Configuration Guide

Starting from v0.2.0, SharwAPI separates configuration into two scopes: **Main Program Configuration** and **Plugin Configuration**.

This design ensures system stability. Changes to one plugin's configuration do not affect the main program or other plugins.

## Main Program Configuration

The main program uses `appsettings.json` in the root directory. This file controls network settings, logging levels, and API metadata.

### Common Settings

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ]
  },
  "Urls": "http://localhost:5000",
  "ApiInfo": {
    "Name": "Sharw's API",
    "Version": "1.0.0"
  },
  "RouteOverride": {
    "sharwapi.apimgr": "admin"
  }
}

```

* **Urls (Listening Address)**
  * Controls the IP and port the main program listens on.
  * Default: `"http://localhost:5000"`
  * **Example**: If you want other devices on the LAN to access it and change the port to 8080, modify it to `"http://0.0.0.0:8080"`.


* **Logging (Log Level)**
  * Controls the detail level of logs output to the terminal.
  * **Default**: Default level. Usually set to `"Information"`. If you encounter issues and need to debug, change it to `"Debug"` or `"Trace"` to see more details.
  * **Microsoft**: Framework internal logs. Recommended to keep at `"Warning"` to avoid excessive noise.


* **ApiInfo (API Information)**
  * Defines basic information (like name and version) returned when accessing the root path `/`.


* **RouteOverride (Custom Plugin Route)**
  * Allows you to modify the default route prefix of a plugin (by default, the route prefix is the plugin name).
  * **Configuration Method**: Add key-value pairs in the `RouteOverride` object, where the key is the **Plugin Name** and the value is the **New Route Prefix**.
  * **Limitation**: The new prefix only allows alphanumeric characters (`A-Z`, `a-z`, `0-9`). If it contains illegal characters, it will fall back to the default plugin name.
  * **Example**: `"sharwapi.apimgr": "admin"` changes the access path of this plugin from `/sharwapi.apimgr/...` to `/admin/...`.

## Plugin Configuration

To avoid conflicts, SharwAPI after v0.2.0 adopts a **Configuration Isolation** mechanism. Plugin configurations are not stored in `appsettings.json`.

### Configuration File Location

All plugin configuration files are stored uniformly in the `config` folder under the main program's root directory.

### Naming Convention

The naming rule for plugin configuration files is: `Plugin ID (Name).json`.

For example, if you install a plugin with the ID `sharw.apimgr`:

1. The main program automatically reads `sharw.apimgr.json` in the `config` directory.
2. If the file does not exist, the main program automatically generates a default configuration file.

### Modifying Plugin Configuration

1. Enter the `config` directory.
2. Find the `.json` file corresponding to the plugin.
3. Edit it with a text editor and save.
4. **Note**: After modifying plugin configurations, you need to restart the main program for changes to take effect.