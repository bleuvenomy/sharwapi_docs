---
coren: SharwAPI.Core
contn: SharwAPI.Contracts.Core
apin: IApiPlugin
---

# Plugin Development Guide

SharwAPI's core contains no business logic—**all functionality is delivered via Plugins**.

This guide walks you through creating your first SharwAPI plugin, step by step.

::: tip Before You Start
SharwAPI is built on [Dependency Injection (DI)](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview) and ASP.NET's [WebApplication](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.webapplication). Familiarity with these concepts will help you get the most out of this guide.
:::

::: warning Prerequisites
This tutorial assumes you have basic programming experience, understand DI and WebApplication fundamentals, and know how to use search engines or AI tools to troubleshoot.
:::

## What Is a Plugin?

At its core, a plugin is simply a standard `.dll` class library.

What makes it recognizable to SharwAPI is adherence to a specific contract—the **Plugin Protocol**. Technically, this means your plugin must implement the `{{ $frontmatter.apin }}` interface.

Think of plugin development like **"filling out a standardized onboarding form"**: as long as your code provides the required metadata (name, version) and implements the expected behaviors (routes, services), SharwAPI will load and execute it automatically.

## The Plugin Protocol (`{{ $frontmatter.apin }}`)

The Plugin Protocol defines how the main application interacts with plugins. To be compatible, your plugin must reference the `{{ $frontmatter.contn }}` library and implement the `{{ $frontmatter.apin }}` interface.

This interface consists of two main categories:

### Identity Metadata
Tell SharwAPI *"Who you are"*.

- **`Name` (Unique Identifier)**
  - A globally unique ID for your plugin.
  - **Convention**: Use `author.plugin` format (lowercase, dot-separated). Automatically populated when using the project template.
  - **Example**: `"sharwapi.apimgr"`
  - **Note**: This ID often becomes the URL prefix for your APIs (e.g., `/sharwapi.apimgr/...`), so keep it concise and unique.

- **`DisplayName`**
  - A human-readable name shown in plugin lists or admin UIs.
  - **Example**: `"API Manager"`

- **`Version`**
  - Your plugin's version string.
  - **Convention**: Must follow [Semantic Versioning 2.0.0](https://semver.org).
  - **Example**: `"1.0.0"`, `"0.1.0-beta"`

- **`Dependencies`**
  - Declares other plugins (and version ranges) your plugin relies on.
  - **Purpose**: Ensures all required components are present at runtime.

### Core Lifecycle Methods
Tell SharwAPI *"What you do"*.

- **`RegisterServices` (Register Dependencies)**
  - **Purpose**: Add your services to the shared DI container.
  - **Use cases**: Register database contexts, load configuration, schedule background jobs, or expose custom services.

- **`Configure` (Configure Middleware Pipeline)**
  - **Purpose**: Insert middleware into the request processing pipeline.
  - **Use cases**: Add request logging, authentication checks, or CORS handling.

- **`RegisterRoutes` (Define API Endpoints)**
  - **Purpose**: Map URL paths to your handler logic.
  - **Use cases**: Define what happens when a user visits `/api/hello` or posts to `/data/upload`.