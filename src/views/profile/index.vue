<template>
    <div class="profile-view">
        <span>{{  name }}</span>
        <el-image :src="avatar"></el-image>
        <el-button @click.native="actionLogout">logout</el-button>
    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { logout } from '@/api/auth';

const authStore = useAuthStore();
const router = useRouter();

const name = computed(() => authStore?.data?.QV102 || '');

const avatar = computed(() => authStore?.data?.QO106?.MV656 || '');

onMounted(() => {
    //
});

const actionLogout = async () => {
    await logout();
    router.push('/login');
}

</script>
