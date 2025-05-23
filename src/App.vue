<template>
    <div class="main-layout">
        <SideBar></SideBar>
        <RouterView class="main-body"></RouterView>
    </div>
</template>
<style scoped src="./App.scss"></style>
<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import SideBar from '@/components/SideBar.vue';

const router = useRouter();
const authStore = useAuthStore();

onBeforeMount(async () => {
    //
});

onMounted(async() => {
    await authStore.loadFromElectron();

    if(!authStore.token) {
        // router.push('/login');
        router.push('/home');
    } else {
        router.push('/home');
    }
});

</script>