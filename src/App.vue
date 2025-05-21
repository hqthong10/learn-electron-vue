<template>
    <div class="main-layout">
        <RouterView class="main-body"></RouterView>
    </div>
</template>
<style scoped src="./App.scss"></style>
<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeMount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

onBeforeMount(async () => {
    //
});

onMounted(async() => {
    await authStore.loadFromElectron();

    if(!authStore.token) {
        router.push('/login');
    } else {
        router.push('/showtime');
    }
});

</script>