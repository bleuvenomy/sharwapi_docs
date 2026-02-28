# Development Environment Setup

## Basic Tools
- **Development Tools**: [Visual Studio](https://visualstudio.microsoft.com/) or [Visual Studio Code](https://code.visualstudio.com/Download)
- **SDK**: [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) or higher

### Configure Plugin Source
SharwAPI provides an official NuGet source for distributing the **plugin protocol library** and **project templates**. You need to add it to your development environment.

Open your terminal and run the following command:

```bash
dotnet nuget add source https://nuget.hope-now.top/v3/index.json --name SharwAPI
```

Once added successfully, your development environment will be able to find SharwAPI-related dependency packages.

### Install Development Templates

To simplify the development process, we provide standard scaffolding templates that can be used via the command line.

Run the following command in your terminal to install the templates:

```bash
dotnet new install SharwAPI.Templates

```

## Create Your First Plugin

With the environment configured, creating a plugin project is very simple.

1. **Create New Project**
   
Find a folder and run the following command.

*Note: `-n` specifies the name of this plugin project, and `--Author` specifies the plugin's author.*

```bash
dotnet new sharwapiplugin -n apimgr --Author sharwapi
```

After execution, a folder named `apimgr` will be created in the current directory. The plugin name will automatically become `sharwapi.apimgr`, and the namespace will be `sharwapi.Plugin.apimgr`.

2. **Check the Project**
   
The template will automatically:
   * Create a standard folder structure.
   * Automatically reference the latest version of the **Plugin Protocol Library** (`SharwAPI.Contracts.Core`).
   * Generate sample code.

## Compile and Publish

After writing your code, you need to compile it into a `.dll` file that the main program can load.

### Compile Project

In the root directory of your plugin project, open a terminal and run:

```bash
dotnet publish -c Release

```

This command compiles your code in Release mode and packages it.

### Get Plugin File

After compilation is complete, go to the output directory:
`bin/Release/net10.0/publish/`

In this directory, you will find a `.dll` file with the same name as your project (e.g., `Sharw.Plugin.apimgr.dll`).

### Install and Run

1. Copy the generated `.dll` file to the `plugins` folder of the **Main Program**.
2. Run (or restart) the main program.
3. Check the startup logs. If you see `Loaded Plugin: sharw.apimgr v1.0.0`, the plugin has been successfully loaded.