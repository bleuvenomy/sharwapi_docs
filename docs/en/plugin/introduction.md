---
coren: SharwAPI.Core
contn: SharwAPI.Contracts.Core
apin: IApiPlugin
---

# Plugin Development Overview

In SharwAPI, the **Main Program** contains no business code; all functionality is implemented by **Plugins**.

This chapter will guide you through writing your own plugin.

::: tip Prerequisites
SharwAPI uses [Dependency Injection (DI)](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview) and the [WebApplication](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.webapplication) of [ASP.NET](https://dotnet.microsoft.com/en-us/apps/aspnet). It is strongly recommended to understand these first to better comprehend the following content and write plugins more smoothly.
:::
::: warning Note
This tutorial assumes you have some programming foundation, a basic understanding of DI and WebApplication, and know how to use search engines and AI tools to assist your learning.
:::

## What is a Plugin?

A plugin is essentially just a regular `.dll` file (class library).

The reason it can be recognized and loaded by the SharwAPI main program is that it adheres to a specific set of rules. This set of rules is called the **Plugin Protocol**, which manifests as the plugin implementing the `{{ $frontmatter.apin }}` interface internally.

You can think of the plugin development process as **"filling out a standard employment form"**. As long as your code fills in the information (name, version) and provides the necessary functions (routes, services) as required by the form, the main program will accept and run it.

## Plugin Protocol (IApiPlugin)

The plugin protocol defines all ways the main program interacts with plugins. Any plugin must reference the `{{ $frontmatter.contn }}` library and implement the `{{ $frontmatter.apin }}` interface within it.

This interface mainly includes the following two categories of members:

### Identity Information
Used to tell the main program "Who am I".

- **Name (Unique Identifier)**: The globally unique ID of the plugin.
  - **Convention**: Use the format **`author.plugin`**. All lowercase, separated by dots `.`. This is automatically replaced when creating from a template.
  - **Example**: `"sharwapi.apimgr"`
  - **Note**: This ID is usually used as the prefix for API routes (e.g., `/sharw.apimgr/...`), so ensure it is concise and **unique**.
- **DisplayName**: The name for humans, displayed in plugin lists or management interfaces.
  - **Example**: `"API Manager"`
- **Version**: The version of the plugin.
  - **Convention**: Must comply with [Semantic Versioning 2.0.0](https://semver.org).
  - **Example**: `"1.0.0"`, `"0.1.0-beta"`
- **Dependencies**: Declares other plugins and their version ranges that this plugin depends on.
  - **Purpose**: Ensures the runtime environment meets the plugin's requirements.

### Core Functionality
Similar to telling the main program "What I want to do".

- **RegisterServices (Register Tools)**
  - **Purpose**: Put your tools (services) into the public toolbox (service collection).
  - **Scenario**: Register database connections, read configuration files, register background scheduled tasks, register your own services.
- **Configure (Configure Pipeline)**
  - **Purpose**: Set up security checkpoints (middleware).
  - **Scenario**: Add request logging, perform request interception.
- **RegisterRoutes (Define Endpoints)**
  - **Purpose**: Set up signposts.
  - **Scenario**: Define which code to execute when a user accesses a URL (e.g., `/api/hello`).