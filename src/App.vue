<template>
    <div class="main-layout">
        <SideBar v-if="isLogin"></SideBar>
        <RouterView class="main-body"></RouterView>
    </div>
</template>
<style scoped src="./App.scss"></style>
<script setup lang="ts">
import { onMounted, onBeforeMount, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import SideBar from '@/components/SideBar.vue';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = computed(() => authStore?.token?.length > 0);

onBeforeMount(async () => {
    // await authStore.loadFromElectron();
});

onMounted(async() => {
    authStore.loadFromElectron().then(() => {
        if(isLogin.value) {
            router.push('/home');
        } else {
            router.push('/login');
        }  
    })
});

</script>