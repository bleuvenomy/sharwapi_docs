# Build from Source

Usually, we recommend using the pre-compiled versions from [Releases](https://github.com/SharwOrange/sharwapi.Core/releases).

If you need to modify the main program's source code or develop new plugins, you will need to build from source.

## Prerequisites

Before starting, ensure your development environment has the following tools installed:

- **Version Control**: [Git](https://git-scm.org/)
- **Build Environment**: [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) or higher
- **Code Editor**: [Visual Studio](https://visualstudio.microsoft.com/) or [Visual Studio Code](https://code.visualstudio.com/Download)

## Project Structure

SharwAPI's source code consists of two core parts:

1.  **Main Program (sharwapi.Core)**: The executable responsible for loading plugins and handling network requests.
2.  **Plugin Interface Library (sharwapi.Contracts.Core)**: Defines the rules (interfaces) for communication between plugins and the main program. Both the main program and all plugins must reference it.

## Build Steps

To ensure the main program correctly recognizes the interfaces, we need to build these two projects together.

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

Copy this file to the `Plugins` folder in the main program directory and restart the main program to take effect.