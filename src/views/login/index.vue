<template>
    <div class="login-page">
        <div class="div-contain">
            <h1 class="login-title">Đăng Nhập</h1>
            <el-form :model="form" label-width="auto" label-position="top" class="login-form">
                <el-form-item label="Số điện thoại">
                    <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="Mật khẩu">
                    <el-input v-model="form.password" type="password" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="btn-login" @click="actionLoginProvider">Đăng nhập</el-button>
                </el-form-item>
            </el-form>
                   
            <div><a @click="actionSkip">Bỏ qua</a></div>
        </div>
    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { login } from '@/api/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
    email: '',
    password: ''
});

const actionLoginProvider = async () => {
    const rs = await login(form.email, form.password);
    if (rs.status === 'success' && rs.elements) {
        authStore.loginSuccess(rs.elements?.TOKEN || '', rs.elements);
        router.push('/showtime');
    }
};

const actionSkip = () => {
    router.push('/home');
};
</script>