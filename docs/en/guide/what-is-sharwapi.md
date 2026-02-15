# What is Sharw's API?

Sharw's API (also known as SharwAPI) is a **modular Web API service** built on .NET. It doesn't contain specific business features itself, but it can load and run various plugins to implement them.

Think of it as a **Mod Loader** (like Minecraft Forge). You just drop your written plugin files into a folder, and the program automatically recognizes and runs them, giving your service new capabilities.

In short, you can use it to easily create your own API without reinventing the wheel of underlying frameworks.

The project is named after its owner, **SharwOrange**, where **Sharw** is a coined word pronounced **/ʃɑːr/**.

## Core Philosophy

SharwAPI was designed to solve the problems of **reinventing the wheel** and **wasting resources**.

### Develop Like You're Making Mods
In traditional development, every time you write a new feature (even a simple API forwarding interface), you usually need to create a new project and reconfigure basic code like logging, routing, and exception handling.

In SharwAPI, **the main program has already done this groundwork for you**. You only need to write the core business logic (the plugin) and let the main program load it. This makes development as simple as building with LEGO blocks.

### Single Process, Multiple Services
For individual developers or HomeLab users, many needs are just **"small features that take a few dozen lines of code."** Maintaining separate Docker containers or service processes for these fragmented functions is both memory-intensive and hard to manage.

SharwAPI allows you to integrate these **"small tools essential but not large enough to be independent products"** into a single process:

- **Cross-Service Data Sync**: For example, automatically syncing a new password to other associated apps via API after modifying it in SSO.
- **Message Notification Forwarder**: Receiving Webhooks from GitHub or monitoring systems, formatting them, and forwarding them to your IM apps (such as Discord, Slack, etc.).
- **Simple Intranet Tools**: Like a simple interface that just sends Wake-on-LAN (WOL) packets, or a JSON endpoint providing unified configuration info for the local network.

They share the same port and memory of the main program, requiring no extra deployment—just write and use.

## Features

- **Dynamic Extension**: Uses a plugin-based architecture. Simply drop compiled plugins (DLL files) into the `Plugins` directory to run them, without recompiling the main program.
- **Unified Management**: The main program handles logging, configuration reading, and route dispatching, so plugins only need to focus on business implementation.
- **Cross-Platform**: Built on high-performance .NET 10, it runs stably on Windows, Linux, macOS, and other operating systems.

## Who is it for?

SharwAPI is particularly suitable for:

- **HomeLab Enthusiasts**: Server resources at home are limited, and you want to run the most services with the least memory.
- **Individual Developers / Students**: Want to quickly verify ideas or practice programming without being discouraged by tedious project configuration.
- **Toolset Developers**: Need to integrate multiple small tools on a unified platform.

## Community Ecosystem

You can visit the [Plugin Market](https://sharwapi-market.hope-now.top) to find the plugins you want.

In this project, the API core (Core API) is open-sourced under the GPL-3.0 license, while the interface layer for implementing plugins uses the LGPL-3.0 license (official implementation plugins will also be open-sourced under LGPL-3.0).

Although we **do not require** all plugins to be open-sourced under the LGPL-3.0 license (you can use other open-source licenses, keep it closed-source, or even sell it), we **recommend** open-sourcing your plugins under the LGPL-3.0 license. This not only enriches the community plugin ecosystem but also gives your plugins a chance to be improved by others.
