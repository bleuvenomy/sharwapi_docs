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
            text: '核心功能',
            items: [
              { text: '注册服务', link: '/plugin/services'},
              { text: '路由注册', link: '/plugin/routes'},
              { text: '中间件配置', link: '/plugin/configure'},
            ]
          },
          { 
            text: '高级特性',
            items: [
              { text: '读取配置', link: '/plugin/configuration'},
              { text: '日志记录', link: '/plugin/logging'},
              { text: '管理接口', link: '/plugin/management-endpoints'},
              { text: '高级依赖配置', link: '/plugin/dependencies'},
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
      }
    ],

    footer: {
      message: 'This site is powered by <a href="https://www.netlify.com" target="_blank">Netlify</a>'
    }
  }
})
