# Getting Started

Download SharwAPI. Run it. Add your first plugin.

## Prerequisites

SharwAPI runs on minimal hardware. Recommended specs:

- **OS**: Windows x64 or Linux x64
- **Processor**: 1 Core or higher
- **Memory**: 512M or higher
- **Runtime**: Releases include .NET Runtime — no separate install needed

## Running the Main Program

SharwAPI.Core loads plugins and handles HTTP requests.

### Download & Extract
Download your OS version from [Github Releases](https://github.com/sharwapi/sharwapi.Core/releases). Extract to any directory.

### Launch
Open terminal, navigate to the directory, and run:

::: code-group

```bash [Windows PowerShell]
# Or simply double-click the executable
$ ./sharwapi.Core
```

```bash [Linux]
# Grant execution permission first
$ chmod +x ./sharwapi.Core

# Launch
$ ./sharwapi.Core
```
:::

Upon successful startup, you will see logs similar to the following in your terminal, indicating that the main program is working and has automatically created the plugin directory (`Plugins`):

```text
$ ./sharwapi.Core
info: PluginLoader[0]
      Plugins directory did not exist and was created at /srv/sharwapi/Plugins
info: PluginLoader[0]
      Registering plugin services...
info: sharwapi.Core[0]
      Configuring plugin middleware...
info: sharwapi.Core[0]
      Registering plugin routes...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

Visit http://localhost:5000 in your browser. Seeing the API name and runtime means it's running.

::: tip Port Configuration
By default, the program listens on port `5000`. If you need to change it, open the `appsettings.json` file in the directory and configure the `Urls` field.
:::

## Installing Plugins

Plugins add functionality. Installation: Download → Drop into folder → Restart.

Let's use the official **API Manager** plugin as an example.

### Get the Plugin

You can get plugin files (usually in `.dll` format) from:

* [SharwAPI Plugin Market](https://sharwapi-market.hope-now.top)
* [Plugin Index Repository](https://github.com/sharwapi/sharwapi_Plugins_Collection)

In this example, go to the [API Manager Release Page](https://github.com/sharwapi/sharwapi.Plugin.apimgr/releases) to download the latest plugin file.

### Installation Steps

1. Find the `Plugins` folder in the main program directory (if it doesn't exist, run the main program once to generate it automatically, or create it manually).
2. Copy the downloaded plugin file (e.g., `sharwapi.Plugin.apimgr.dll`) into the `Plugins` folder.
3. **Restart** the SharwAPI main program.

### Verify Installation

After restarting, check the terminal logs. If you see a message similar to `Loaded Plugin: apimgr v1.0.0`, the plugin has been successfully loaded.

::: warning Trusted Sources
Since plugins run in the same process as the main program, they have high system privileges. For security, please **only install plugins from official sources or developers you trust**.
:::