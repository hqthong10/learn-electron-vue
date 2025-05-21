import Vue from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router'
import Home from '@/views/home/index.vue';
import Profile from '@/views/profile/index.vue';
import SplashPage from "../views/splash/index.vue";


const router = createRouter({
  history: createMemoryHistory(),
    // mode: 'hash',
    routes: [
    { path: '/', component: Home },
    { path: '/profile', component: Profile },
  ]
});

// router.beforeEach(async (to, from, next) => {
//   const token = await window.electronAPI.getToken();

//   if (!token && to.path !== '/login') {
//     next('/login');
//   } else if (token && to.path === '/login') {
//     next('/home');
//   } else {
//     next();
//   }
// });

export default router;