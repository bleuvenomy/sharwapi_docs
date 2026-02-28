# 从 v0.1.0 升级到 v0.2.0 — 用户侧

本页面面向**部署和运维 SharwAPI 主程序**的用户，介绍从 v0.1.0 升级到 v0.2.0 时需要关注的配置变更和操作步骤。

如果你同时也是插件开发者，请另行阅读 [开发者侧迁移指南](./developer)。

## 升级前准备

- 备份现有的 `appsettings.json` 文件
- 备份 `Plugins/` 目录下的所有插件文件
- v0.2.x 采用**自包含发布**，目标机器上**无需预先安装 .NET 运行时**，直接运行可执行文件即可
- 注意下载对应操作系统的发布包（Windows x64、Linux x64 等顿作单独发布）

## 第一步：更新 `appsettings.json`

这是本次升级**唯一需要手动操作**的配置变更。日志系统从 .NET 内置日志切换到了 Serilog，配置节结构发生了完全变化。

### 变更前（v0.1.0）

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Urls": "http://localhost:5000",
  "ApiInfo": {
    "Name": "Sharw's API",
    "Version": "0.1.0"
  }
}
```

### 变更后（v0.2.x）

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "Async",
        "Args": {
          "configure": [
            {
              "Name": "File",
              "Args": {
                "path": "logs/log-.txt",
                "rollingInterval": "Day",
                "retainedFileCountLimit": 30,
                "fileSizeLimitBytes": 10485760,
                "rollOnFileSizeLimit": true
              }
            }
          ]
        }
      }
    ],
    "Enrich": [ "FromLogContext" ]
  },
  "Urls": "http://localhost:5000",
  "ApiInfo": {
    "Name": "Sharw's API",
    "Version": "0.2.0"
  },
  "RouteOverride": {
  }
}
```

### 变更说明

| 项目 | 操作 |
|---|---|
| 删除 `Logging` 节 | 替换为 `Serilog` 节 |
| 新增 `Serilog` 节 | 完整复制上方配置即可，按需调整日志级别 |
| 新增 `RouteOverride` 节 | 保留空对象 `{}` 即可，后续按需填写 |
| `ApiInfo.Version` | 建议更新为 `0.2.0` |

## 第二步：了解新增的目录结构

v0.2.x 启动后会自动创建以下目录和文件（无需手动操作）：

```
程序运行目录/
├── Plugins/         ← 插件目录（与 v0.1.0 相同）
├── config/          ← 新增：插件配置文件目录
│   ├── PluginA.json ← 插件A的配置（首次启动自动生成）
│   └── PluginB.json ← 插件B的配置（首次启动自动生成）
└── logs/            ← 新增：日志文件目录
    └── log-20260225.txt
```

::: tip 关于插件配置文件
如果插件提供了默认配置（通过 `DefaultConfig` 属性），系统会在 **首次启动时自动生成** `config/{插件名}.json`。你可以在生成后直接编辑该文件来修改插件配置。主程序支持配置文件热重载，但具体能否在无需重启的情况下生效，取决于插件自身是否实现了对配置变更的响应逻辑，**建议修改配置后重启主程序以确保生效**。
:::

## 第三步：使用路由前缀覆盖（可选）

如果你希望修改某个插件的 URL 路径前缀（仅适用于启用了自动路由前缀的插件），在 `appsettings.json` 的 `RouteOverride` 节中添加配置：

```json
{
  "RouteOverride": {
    "my.plugin": "api"
  }
}
```

这会将 `my.plugin` 插件的路由前缀从 `/my.plugin/` 改为 `/api/`。

::: warning 注意
`RouteOverride` 的值只能包含字母和数字（`A-Z`、`a-z`、`0-9`），不支持斜杠、连字符等特殊字符。无效的值会被忽略并回退到默认前缀。
:::

## 常见问题

**Q：升级后启动报错，提示找不到配置节？**

检查 `appsettings.json` 是否已按上方替换 `Logging` → `Serilog`，并确认 `RouteOverride` 节存在（即使为空对象）。

**Q：`logs/` 目录占用磁盘太多怎么办？**

在 `appsettings.json` 的 `Serilog.WriteTo[File].Args` 中调整 `retainedFileCountLimit`（保留天数）和 `fileSizeLimitBytes`（单文件大小限制）。

**Q：旧插件在 v0.2.x 下还能用吗？**

可以，`IApiPlugin` 接口的原有方法签名没有变化，旧插件无需重新编译即可在 v0.2.x 上运行（新增的接口成员均有默认实现）。
