# Logging System Principles

This article will introduce the design concepts and working principles of the SharwAPI logging system.

SharwAPI adopts a centralized logging management architecture. The purpose is to let the **main program** unify the management of all output formats and storage locations, while allowing **plugins** to focus solely on recording the log content itself.

## Architecture Overview

The core of the logging system is driven by the **Serilog** library. When the main program starts, it mounts Serilog into the system via specific configurations, taking over all logging tasks.

The core design philosophy is: **The main program is responsible for configuration, and the plugins are responsible for usage.**

### 1. Main Program Integration

During the build phase of the main program startup, SharwAPI reads the configuration file and initializes the logging system. This step happens before any plugins are loaded, ensuring that complete system behavior can be recorded from the very beginning.

Below is the key code logic for initializing the logging system in the main program:

```csharp
// 1. Build Configuration: Read the appsettings.json file
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

// 2. Initialize Global Logger: Get Serilog ready
sharwapi.Core.Logger.Initialize(configuration);
Log.Information("Starting web host");

// 3. Mount to Main Program: Tell the system to use Serilog for all logs
// After this step, whether it's internal system logs or logs recorded in plugins, it's all managed by Serilog.
builder.Host.UseSerilog();
```

This means:
*   **Unified Takeover**: All logs output via standard interfaces (`ILogger`) are eventually handled by Serilog.
*   **Full Coverage**: This includes not only plugin logs but also logs from within the ASP.NET Core framework (such as web server startup, route matching).

### 2. Configuration Driven

Since the logging system is completely taken over by the main program, logging behaviors (such as output to console or file, log file rotation policies, etc.) are entirely controlled by the main program's configuration file `appsettings.json`.

This design achieves **separation of configuration and code**. If you want to change the storage location of logs, you only need to modify the configuration file without recompiling any plugin code.

### 3. Context Enrichment

SharwAPI configures "Context Enrichment" for logs by default. This means that every log record will automatically include current runtime environment information, such as:

*   **ThreadId**: Thread ID, used for analyzing concurrency issues.
*   **MachineName**: Server name, used to distinguish logs from multiple servers.
*   **EnvironmentName**: Runtime environment (Development or Production).

This is very helpful for troubleshooting, as you can clearly know in which environment and on which machine a log was generated.

## Why Choose Serilog?

SharwAPI chooses Serilog over other logging libraries primarily for its **Structured Logging** capabilities.

### What is Structured Logging?

In traditional logging systems, logs are usually just plain text.

*   **Traditional Way**:
    `Log.Info("User " + userId + " logged in");`
    
    The result is a string: "User 123 logged in". It is difficult for a computer to understand what "123" means in this text.

*   **Structured Way (Serilog)**:
    `Log.Info("User {UserId} logged in", userId);`

    In this mode, logs are no longer just text, but records containing data. `UserId` is preserved as an independent field.

When we send logs to professional log analysis platforms (such as Seq or ELK), we can query logs like querying a database:

`Select * From Logs Where UserId = 123`

This greatly improves the efficiency of troubleshooting, especially in production environments with massive amounts of log data.
