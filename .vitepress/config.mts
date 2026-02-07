import { defineConfig } from 'vitepress'
import mermaidPlugin from './plugins/mermaidPlugin';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sharw's API",
  description: "一个由插件动态构建的 API",
  srcDir: 'docs',
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/guide/what-is-sharwapi' }
    ],

    sidebar: ({
      '/': [
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
          text: '插件',
          items: [
            { text: '介绍', link: '/plugin/introduction'},
            { text: '快速开始', link: '/plugin/start'},
            { text: '编写基础插件', link: '/plugin/basic'},
            { items:[
              { text: '注册服务', link: '/plugin/services'},
              { text: '配置中间件', link: '/plugin/configure'},
              { text: '路由注册', link: '/plugin/routes'},
            ]},
            { text: '配置处理', link: '/plugin/configuration'},
            { text: '日志记录', link: '/plugin/logging'},
            { text: '管理接口', link: '/plugin/management-endpoints'}
          ] 
        },
        {
          text: '架构',
          items: [
            { text: '架构一览', link: '/architecture/overview'},
            { text: '请求处理流程', link: '/architecture/request-flow'},
            { text: '插件系统', link: '/architecture/plugin-system'},
            { text: '日志系统', link: '/architecture/logging'}
          ]
        }
      ]
    }),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      message: 'This site is powered by <a href="https://www.netlify.com" target="_blank">Netlify</a>'
    }
  },
  markdown: {
    toc: {
      level: [1,2,3]
    },
    config: (md) => {
      md.use(mermaidPlugin);
    }
  }
})
