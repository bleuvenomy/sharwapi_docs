# Build from Source

Prefer pre-built binaries? Grab them from [Releases](https://github.com/SharwOrange/sharwapi.Core/releases).

Build from source only if you're modifying the core or writing plugins.

## Prerequisites

- [Git](https://git-scm.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) or higher
- [Visual Studio](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/Download)

## Project Structure

Two core components:

1. **sharwapi.Core** — Main executable. Loads plugins, handles HTTP.
2. **sharwapi.Contracts.Core** — Interface library. Defines plugin ↔ core contracts. Both must reference this.

## Build Steps

Build both projects together so the core recognizes plugin interfaces.

### Initialize Workspace

First, create a folder as your workspace and initialize an empty solution file (`.sln`) to manage all projects.

```bash
# Create and enter working directory
mkdir sharwapi-source
cd sharwapi-source

# Create solution file
dotnet new sln --name SharwAPI

```

### Pull Source Code

Next, we need to pull the code for the **Main Program** and the **Plugin Interface Library** separately.

```bash
# 1. Pull Main Program code
git clone https://github.com/sharwapi/sharwapi.Core.git

# 2. Pull Plugin Interface Library code
git clone https://github.com/sharwapi/sharwapi.Contracts.Core.git

```

### Link Projects

Add the downloaded projects to the solution and establish references.

```bash
# Add projects to solution
dotnet sln add sharwapi.Core/sharwapi.Core.csproj
dotnet sln add sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj

# Make Main Program reference the Interface Library
dotnet add sharwapi.Core/sharwapi.Core.csproj reference sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj

```

### Compile and Publish

Now you can compile the main program. Run the following command to generate the executable:

```bash
# Compile Main Program (Release mode)
dotnet publish sharwapi.Core/sharwapi.Core.csproj -c Release

```

After compilation, you can find the generated files in the `./sharwapi.Core/bin/Release/net10.0/publish` directory.

### Verify

Enter the publish directory and run the generated main program:

```bash
cd sharwapi.Core/bin/Release/net10.0/publish

# Run program
dotnet sharwapi.Core.dll

```

If you see startup logs, the build was successful.

## Build Plugins

If you want to compile a plugin yourself (taking the official API Manager as an example), the process is quite similar.

### Pull Plugin Source

In your workspace directory, pull the plugin's code:

```bash
git clone https://github.com/sharwapi/sharwapi.Plugin.apimgr.git

```

### Link Interface Library

Plugins also depend on the **Plugin Interface Library**. We need to add the plugin project to the solution and add a reference.

```bash
# Add to solution
dotnet sln add sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj

# Add reference to Interface Library
dotnet add sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj reference sharwapi.Contracts.Core/sharwapi.Contracts.Core.csproj

```

### Compile Plugin

```bash
dotnet publish sharwapi.Plugin.apimgr/sharwapi.Plugin.apimgr.csproj -c Release

```

### Install Plugin

After compilation, find the generated `.dll` file (e.g., `sharwapi.Plugin.apimgr.dll`) in the plugin project's publish directory (`bin/Release/net10.0/publish`).

Copy this file to the `plugins` folder in the main program directory and restart the main program to take effect.