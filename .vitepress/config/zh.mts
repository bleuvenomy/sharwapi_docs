import { defineConfig } from 'vitepress'

export const zh = defineConfig({
  lang: 'zh',
  description: "一个由插件动态构建的 API",
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/what-is-sharwapi' }
    ],

    sidebar: [
      {
        text: '开始',
        items: [
          { text: '什么是Sharw\'s API', link: '/guide/what-is-sharwapi'},
          { text: '快速开始', link: '/guide/getting-started'},
          { text: '手动构建', link: '/guide/build'},
          { text: '配置文件', link: '/guide/configuration'}
        ]
      },
      {
        text: '插件开发指南',
        items: [
          { 
            text: '基础入门',
            items: [
              { text: '介绍', link: '/plugin/introduction'},
              { text: '快速开始', link: '/plugin/start'},
              { text: '插件结构', link: '/plugin/basic'},
            ]
          },
          { 
            text: '核心接口',
            items: [
              { text: '注册服务', link: '/plugin/services'},
              { text: '路由注册', link: '/plugin/routes'},
              { text: '中间件配置', link: '/plugin/middleware'},
              { text: '读取插件配置', link: '/plugin/plugin-config'},
              { text: '插件数据目录', link: '/plugin/data-directory'},
              { text: '日志记录', link: '/plugin/logging'},
            ]
          },
          { 
            text: '高级特性',
            items: [
              { text: '管理接口', link: '/plugin/management-endpoints'},
              { text: '高级依赖配置', link: '/plugin/dependencies'},
              { text: '.sharw 插件包', link: '/plugin/sharw-package'},
            ]
          }
        ] 
      },
      {
        text: '架构',
        items: [
          { text: '架构一览', link: '/architecture/overview'},
          { text: '请求处理流程', link: '/architecture/request-flow'},
          { text: '插件系统', link: '/architecture/plugin-system'},
          { text: '依赖解析机制', link: '/architecture/dependency-resolution'},
          { text: '日志系统', link: '/architecture/logging'}
        ]
      },
      {
        text: '从旧版本迁移',
        items: [
          {
            text: '从 v0.1.0 升级到 v0.2.0',
            items: [
              { text: '用户侧变更', link: '/migration/v0.1.0-to-v0.2.0/user'},
              { text: '开发者侧变更', link: '/migration/v0.1.0-to-v0.2.0/developer'},
            ]
          },
          {
            text: '从 v0.2.1 升级到 v0.2.2',
            items: [
              { text: '用户侧变更', link: '/migration/v0.2.1-to-v0.2.2/user'},
              { text: '开发者侧变更', link: '/migration/v0.2.1-to-v0.2.2/developer'},
            ]
          }
        ]
      },
      {
        text: '更新日志',
        items: [
          { text: 'v0.2.2', link: '/changelog/v0.2.2'},
          { text: 'v0.2.1', link: '/changelog/v0.2.1'},
          { text: 'v0.2.0', link: '/changelog/v0.2.0'},
        ]
      }
    ],

    footer: {
      message: 'This site is powered by <a href="https://www.netlify.com" target="_blank">Netlify</a>'
    }
  }
})
