<template>
    <div class="main-layout">
        <sidebar></sidebar>
        <RouterView class="main-body"></RouterView>
        <ui-overlay-loading />
    </div>
</template>
<style scoped src="@/styles/element.scss"></style>
<style scoped src="./App.scss"></style>
<script setup lang="ts">
import { onMounted, onBeforeMount, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

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