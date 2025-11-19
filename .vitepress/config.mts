import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sharw's API",
  description: "一个由插件动态构建的 API",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/guide' },
      { text: 'API示例', link: 'http://192.168.31.104:8080' }
    ],

    sidebar: ({
      '/guide/': [
        {
          text: '介绍',
          items: [
            { text: '什么是Sharw\'s API', link: '/guide/what-is-sharwapi'},
            { text: '快速开始', link: '/guide/getting-started'},
            { text: '配置', link: '/guide/appsettings'},
            { text: '手动构建', link: '/guide/build'}
          ]
        }
      ]
    }),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  markdown: {
    toc: {
      level: [1,2,3]
    }
  }
})
