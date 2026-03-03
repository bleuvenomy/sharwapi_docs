# .sharw 插件包

`.sharw` 是 SharwAPI 框架推荐使用的插件分发格式，适用于所有携带第三方依赖（包括跨平台原生库）的插件。相比手动部署文件夹的方式，`.sharw` 格式将插件及其依赖打包为单个文件，极大简化了分发与安装流程。

## 格式说明

`.sharw` 文件的本质是一个标准的 **ZIP 压缩包**，只是扩展名不同。你可以使用任何 ZIP 工具手动创建或查看其内容。

一个标准的 `.sharw` 包解压后的结构如下：

```
MyPlugin.sharw (解压后)
├── MyPlugin.dll              # 插件入口程序集（必须实现 IApiPlugin）
├── MyPlugin.deps.json        # .NET 依赖清单（构建时自动生成）
├── SomeDependency.dll        # 第三方托管依赖库
├── runtimes/                 # 跨平台原生库目录（可选）
│   ├── win-x64/
│   │   └── native/
│   │       └── e_sqlite3.dll
│   └── linux-x64/
│       └── native/
│           └── libe_sqlite3.so
```

## 构建 .sharw 包

### 方法一：使用 dotnet publish + 手动打包

这是最通用的方法，适用于所有项目。

**第一步：发布插件**

在插件项目根目录执行：

```bash
dotnet publish -c Release -p:CopyLocalLockFileAssemblies=true
```

::: tip
`-p:CopyLocalLockFileAssemblies=true` 会在发布时将所有 NuGet 依赖（包括 `runtimes/` 下的原生库）完整复制到输出目录，确保打包后的 `.sharw` 包含完整依赖链。
:::

**第二步：进入发布目录**

```
bin/Release/net10.0/win-x64/publish/
```

**第三步：将发布目录中的所有文件打包为 ZIP，并将扩展名改为 `.sharw`**

```bash
# Windows PowerShell
Compress-Archive -Path "bin/Release/net10.0/win-x64/publish/*" -DestinationPath "MyPlugin.zip"
Rename-Item "MyPlugin.zip" "MyPlugin.sharw"
```

```bash
# Linux / macOS
cd bin/Release/net10.0/win-x64/publish/
zip -r ../../../../../../../../MyPlugin.sharw .
```

::: warning 注意打包层级
打包时请确保 `.dll` 文件位于压缩包的**根目录**，而不是放在子文件夹内。错误示例：`MyPlugin.sharw/MyPlugin/MyPlugin.dll`，正确示例：`MyPlugin.sharw/MyPlugin.dll`。
:::

### 方法二：使用 MSBuild 自动化（推荐）

你可以在 `.csproj` 中添加 `AfterPublish` 目标，让每次 `dotnet publish` 后自动生成 `.sharw` 文件：

```xml
<Target Name="PackageSharw" AfterTargets="Publish">
  <ZipDirectory
    SourceDirectory="$(PublishDir)"
    DestinationFile="$(OutDir)$(AssemblyName).sharw"
    Overwrite="true" />
</Target>
```

完成后，每次执行 `dotnet publish` 都会在 `bin/Release/net10.0/` 下自动生成 `.sharw` 文件。

## 安装插件

将 `.sharw` 文件直接放入主程序的 `plugins/` 目录即可：

```
plugins/
└── MyPlugin.sharw    ← 放在这里
```

主程序启动时会自动：
1. 检测 `plugins/` 下的所有 `.sharw` 文件
2. 将其解压到 `plugins/.cache/MyPlugin/` 目录下
3. 若 `.sharw` 文件未更新则使用已有缓存，避免重复解压
4. 从缓存目录加载插件

::: tip 缓存目录
`plugins/.cache/` 由主程序自动管理，无需手动操作。如需强制重新解压，删除对应的缓存子目录或重新覆盖 `.sharw` 文件（更新其修改时间）即可。
:::

## 与其他格式的对比

| 格式 | 放置位置 | 适用场景 |
| --- | --- | --- |
| **单文件 DLL** | `plugins/*.dll` | 无第三方依赖的极简插件 |
| **文件夹插件** | `plugins/{Name}/` | 开发调试阶段，便于直接替换文件 |
| **.sharw 插件包** | `plugins/*.sharw` | **推荐用于生产分发**，依赖完整，安装方便 |

::: tip 开发阶段建议
开发和调试时推荐使用**文件夹插件**格式，直接将 `publish` 输出目录复制到 `plugins/{Name}/` 下即可，方便快速迭代。准备发布时再打包为 `.sharw`。
:::
