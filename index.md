---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Sharw's API"
  text: "模块化 Web API 服务"
  tagline: "通过插件扩展功能，单一主程序运行多个服务"
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/getting-started
    - theme: alt
      text: Github
      link: https://github.com/sharwapi/sharwapi.core
    - theme: alt
      text: 插件市场
      link: https://sharwapi-market.hope-now.top

features:
  - title: 插件化扩展
    details: 采用类似游戏 Mod 的机制。你只需将插件文件放入目录，无需重新编译主程序，即可直接添加新功能。
  - title: 简化开发流程
    details: 框架会自动处理日志、路由和异常等基础工作。你只需要编写核心业务代码，不用再去写重复繁琐基础代码。
  - title: 单进程多服务
    details: 支持在一个程序内同时运行多个独立工具。相比于为每个功能启动单独的容器，这种方式能显著降低内存占用与维护成本
  - title: 开源透明
    details: 基于高性能的 .NET 9 构建。代码完全公开透明，基于GPLv3和LGPLv3，你可以自由地查看源码或进行定制修改。
---

