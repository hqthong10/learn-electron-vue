import { createMemoryHistory, createRouter } from 'vue-router';
import Home from '@/views/home/index.vue';
import Profile from '@/views/profile/index.vue';
import Splash from '@/views/splash/index.vue';
import Login from '@/views/login/index.vue';
import Setting from '@/views/setting/index.vue';

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/', component: Splash },
        { path: '/login', component: Login },
        { path: '/home', component: Home },
        { path: '/profile', component: Profile },
        { path: '/setting', component: Setting },
    ]
});

export default router;
