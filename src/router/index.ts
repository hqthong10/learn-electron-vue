import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/home/index.vue';

// Vue.use(Router);

export default new Router({
  mode: 'hash', // ⚠️ Quan trọng cho Electron: dùng 'hash' để tránh lỗi đường dẫn
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
});