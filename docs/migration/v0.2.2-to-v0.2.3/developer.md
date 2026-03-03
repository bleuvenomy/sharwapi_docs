# 从 v0.2.2 升级到 v0.2.3 — 开发者侧

本页面面向**开发 SharwAPI 插件**的开发者，介绍从 v0.2.2 升级到 v0.2.3 时可以利用的新能力。

v0.2.3 **对插件代码没有任何破坏性变更**，所有现有插件代码可直接编译通过，无需修改。

## 变更概览

| 类型 | 说明 |
|---|---|
| 新增插件加载形式 | 文件夹格式：将 `publish/` 输出目录直接放入 `plugins/` |
| 新增插件加载形式 | `.sharw` 格式：将插件打包为单个 ZIP 压缩包 |

## 必要操作

现有插件无需做任何修改即可继续正常加载。

## 使用新能力（可选）

### 开发阶段：使用文件夹格式快速部署

开发和调试时，可直接将 `dotnet publish` 的输出目录复制到 `plugins/` 下，无需额外打包：

```bash
dotnet publish -c Debug -p:CopyLocalLockFileAssemblies=true
# 将 bin/Debug/net10.0/publish/ 复制到主程序的 plugins/MyPlugin/
```

### 发布阶段：使用 .sharw 格式分发

对于携带第三方依赖（特别是跨平台原生库）的插件，推荐将发布产物打包为 `.sharw` 格式进行分发。

可在 `.csproj` 中添加以下 MSBuild 目标，让 `dotnet publish` 自动完成打包：

```xml
<Target Name="CreateSharwPackage" AfterTargets="Publish">
  <ZipDirectory
    SourceDirectory="$(PublishDir)"
    DestinationFile="$(OutDir)$(AssemblyName).sharw"
    Overwrite="true" />
</Target>
```

详细说明请参阅 [.sharw 插件包](/plugin/sharw-package)。
