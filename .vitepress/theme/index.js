// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
// import SwaggerUI from './components/SwaggerUI.vue'; // 导入你的组件

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // app.component('SwaggerUI', SwaggerUI);
  }
};