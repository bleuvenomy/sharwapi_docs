# What is SharwAPI?

SharwAPI is a modular Web API service built on .NET. It provides the runtime infrastructure and loads plugins to implement specific features.

The architecture follows a plugin-host model. Plugins are compiled DLL files placed in the `Plugins` directory. The main program discovers and loads them automatically at startup.

This design lets you build custom APIs without configuring routing, logging, or middleware from scratch.

The project is maintained by **SharwOrange**. The name **Sharw** is pronounced **/ʃɑːr/**.

## Core Philosophy

SharwAPI addresses two common issues in small-scale API development: duplicated setup work and fragmented resource usage.

### Develop Like Building Plugins

In traditional .NET development, each new feature often requires a new project with repeated configuration for logging, routing, and error handling.

SharwAPI moves this groundwork into the main program. Plugin developers write only the business logic. The host handles request processing, configuration loading, and lifecycle management.

### Single Process, Multiple Services

Many useful features are small—sometimes just a few dozen lines of code. Running each as a separate container or process consumes unnecessary memory and complicates deployment.

SharwAPI allows multiple independent plugins to run within a single process. They share the same HTTP listener, configuration system, and logging pipeline.

Examples of suitable use cases:

- **Cross-service synchronization**: Trigger actions in other tools when an event occurs, such as updating credentials across apps after an SSO change.
- **Notification forwarding**: Receive webhooks from GitHub or monitoring systems, format the payload, and forward to Discord, Slack, or other IM platforms.
- **Local network utilities**: Expose simple endpoints for tasks like sending Wake-on-LAN packets or serving unified configuration data to devices on the LAN.

## Features

- **Dynamic plugin loading**: Place compiled plugin DLLs in the `Plugins` directory. The main program loads them without recompilation or restart of the host.
- **Unified infrastructure**: Routing, configuration, logging, and middleware are managed by the host. Plugins focus on business logic.
- **Cross-platform runtime**: Built on .NET 10. Runs on Windows, Linux, and macOS with consistent behavior.

## Target Users

SharwAPI is designed for:

- **HomeLab users**: Run multiple lightweight services within a single process to conserve memory and simplify management.
- **Individual developers and students**: Prototype ideas or practice API development without spending time on project scaffolding.
- **Toolset maintainers**: Integrate several small utilities under a single endpoint namespace and deployment unit.

## Community and Licensing

Browse available plugins at the [Plugin Market](https://sharwapi-market.hope-now.top).

Licensing structure:

- **SharwAPI Core**: GPL-3.0 license
- **Plugin interface library (SharwAPI.Contracts.Core)**: LGPL-3.0 license
- **Official plugins**: Also released under LGPL-3.0

Plugin developers may choose any license for their own plugins, including proprietary distribution. However, releasing plugins under LGPL-3.0 is encouraged. This allows others to link against your plugin interface and contribute improvements, while keeping the core ecosystem interoperable.