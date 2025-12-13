// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import Mermaid from './components/Mermaid.vue';
// import SwaggerUI from './components/SwaggerUI.vue';

export default {
  ...DefaultTheme,
  enhanceApp: async ({ app }) => {
    app.component('Mermaid', Mermaid);
    // app.component('SwaggerUI', SwaggerUI);
  },
};