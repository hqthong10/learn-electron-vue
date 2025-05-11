import Vue from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router'
import Home from '../views/home/index.vue';
import Profile from '../views/profile/index.vue';


// Vue.use(Router);

// export default new Router({
//   mode: 'hash', // ⚠️ Quan trọng cho Electron: dùng 'hash' để tránh lỗi đường dẫn
//   routes: [
//     {
//       path: '/',
//       name: 'Home',
//       component: Home
//     },
//     {
//       path: '/profile',
//       name: 'Profile',
//       component: Profile
//     }
//   ]
// });

const routes = [
  { path: '/', component: Home },
  { path: '/profile', component: Profile },
]

export default createRouter({
  history: createMemoryHistory(),
    // mode: 'hash',
    routes,
})