import { defineConfig } from 'vitepress'
import mermaidPlugin from '../plugins/mermaidPlugin';
import { zh } from './zh.mts'
import { en } from './en.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sharw's API",
  srcDir: 'docs',
  cleanUrls: true,
  locales: {
    root: { 
      label: '简体中文', 
      ...zh 
    },
    en: { 
      label: 'English', 
      link: '/en/', 
      ...en 
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
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