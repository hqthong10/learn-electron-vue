import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/base.css'
import './index.css';

import './styles/index.scss';
import './styles/theme.scss';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(ElementPlus);
app.use(createPinia());

app.use(router);

app.mount('#app');


// window.Api.ipcRenderer.on('rfid-tag', (event, tag) => {
//   console.log('Received tag:', tag)
// })