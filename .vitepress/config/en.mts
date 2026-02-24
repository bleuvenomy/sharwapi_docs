import { defineConfig } from 'vitepress'

export const en = defineConfig({
  lang: 'en',
  description: "A dynamically built API powered by plugins",
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/en/guide/what-is-sharwapi' }
    ],

    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'What is SharwAPI', link: '/en/guide/what-is-sharwapi'},
          { text: 'Getting Started', link: '/en/guide/getting-started'},
          { text: 'Build Manually', link: '/en/guide/build'},
          { text: 'Configuration', link: '/en/guide/configuration'}
        ]
      },
      {
        text: 'Plugins',
        items: [
          { 
            text: 'Basics',
            items: [
              { text: 'Introduction', link: '/en/plugin/introduction'},
              { text: 'Getting Started', link: '/en/plugin/start'},
              { text: 'Structure', link: '/en/plugin/basic'},
            ]
          },
          { 
            text: 'Core Interfaces',
            items: [
              { text: 'Registering Services', link: '/en/plugin/services'},
              { text: 'Route Registration', link: '/en/plugin/routes'},
              { text: 'Configuring Middleware', link: '/en/plugin/middleware'},
              { text: 'Plugin Configuration', link: '/en/plugin/plugin-config'},
              { text: 'Logging', link: '/en/plugin/logging'},
            ]
          },
          { 
            text: 'Advanced Features',
            items: [
              { text: 'Management Endpoints', link: '/en/plugin/management-endpoints'},
              { text: 'Dependency Resolution', link: '/en/plugin/dependencies'},
            ]
          }
        ] 
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/en/architecture/overview'},
          { text: 'Request Flow', link: '/en/architecture/request-flow'},
          { text: 'Plugin System', link: '/en/architecture/plugin-system'},
          { text: 'Dependency Resolution', link: '/en/architecture/dependency-resolution'},
          { text: 'Logging System', link: '/en/architecture/logging'}
        ]
      }
    ],

    footer: {
      message: 'This site is powered by <a href="https://www.netlify.com" target="_blank">Netlify</a>'
    }
  }
})
