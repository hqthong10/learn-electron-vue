import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/home/index.vue";
import Profile from "../views/profile/index.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/profile", component: Profile },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
