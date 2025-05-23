import Vue from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import Home from '@/views/home/index.vue';
import Profile from '@/views/profile/index.vue';
import Splash from '@/views/splash/index.vue';
import Login from '@/views/login/index.vue';

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/', component: Splash },
        { path: '/login', component: Login },
        { path: '/home', component: Home },
        { path: '/profile', component: Profile }
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
