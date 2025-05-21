<template>
    <div class="login-page">
        <div class="div-contain">
            <el-tabs v-model="tabActive" type="card" class="login-tabs" @tab-click="handleClickTab">
                <el-tab-pane :label="$t('wr_tabs_account-owner')" name="provider">
                    <h1 class="login-title">{{  $t('login_customer_title') }}</h1>
                    <h6 class="login-subtitle">{{  $t('login_customer_subline') }}</h6>
                    <el-form :model="formPro" label-width="auto" label-position="top" class="login-form">
                        <el-form-item :label="$t('global_email')">
                            <el-input v-model="formPro.email" />
                        </el-form-item>
                        <el-form-item :label="$t('login_password')">
                            <el-input v-model="formPro.password" type="password" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="btn-login" @click="actionLoginProvider">Login</el-button>
                        </el-form-item>
                    </el-form>
                    <p class="via-web"><a @click="loginProviderViaWeb">{{ $t('wr_login-via-web') }}</a></p>
                </el-tab-pane>
                <el-tab-pane :label="$t('wr_tabs_moderator')" name="second">
                    <h1 class="login-title">{{  $t('login_moderator_title') }}</h1>
                    <h6 class="login-subtitle">{{  $t('login_moderator_subline') }}</h6>
                    <el-form :model="formMod" label-width="auto" label-position="top" class="login-form">
                        <el-form-item label="Login Url">
                            <el-input v-model="formMod.email" />
                        </el-form-item>
                        <el-form-item :label="$t('global_email')">
                            <el-input v-model="formMod.email" />
                        </el-form-item>
                        <el-form-item :label="$t('login_password')">
                            <el-input v-model="formMod.password" type="password" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="btn-login" @click="actionLoginModerator">Login</el-button>
                        </el-form-item>
                    </el-form>
                    <p><a @click="loginModeratorViaWeb">{{ $t('wr_login-via-web') }}</a></p>
                </el-tab-pane>
            </el-tabs>
            <div><a @click="actionSkip">Skip</a></div>
        </div>
        <div class="page-foot">
            <div class="page-foot-item">
                <a>{{ $t('login_contact') }}</a>
            </div>
            <div class="page-foot-item">
                <a>{{ $t('login_terms') }}</a>
            </div>
            <div class="page-foot-item">
                <a>{{ $t('login_privacy') }}</a>
            </div>
            <div class="page-foot-item">
                <a>{{ $t('login_support') }}</a>
            </div>
            <div class="page-foot-item">
                <wbn-icon svg name="de" />
                <el-dropdown>
                    <span class="el-dropdown-link">
                    Dropdown List
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                    </span>
                    <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="changeLanguage('en')">en</el-dropdown-item>
                        <el-dropdown-item @click="changeLanguage('de')">de</el-dropdown-item>
                    </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { login } from '@/api/auth';
import { useRouter } from 'vue-router';
import WbnIcon from '@/components/wbn-icon.vue';
import { useI18n } from 'vue-i18n';

const formPro = reactive({
    email: '',
    password: ''
});
const formMod = reactive({
    url: '',
    email: '',
    password: ''
});

const authStore = useAuthStore();
const router = useRouter();
const { locale } = useI18n();

const tabActive = ref('provider');

const changeLanguage = async (lang: string) => {
    
    locale.value = lang;
}

const handleClickTab = async () => {
    //
}

const actionLoginProvider = async () => {
    const rs = await login(formPro.email, formPro.password);
    if (rs.status === 'success' && rs.elements) {
        authStore.loginSuccess(rs.elements?.TOKEN || '', rs.elements);
        router.push('/showtime');
    }
};

const actionLoginModerator = async () => {
    const rs = await login(formMod.email, formMod.password);
    if (rs.status === 'success' && rs.elements) {
        authStore.loginSuccess(rs.elements?.TOKEN || '', rs.elements);
        router.push('/showtime');
    }
};

const loginProviderViaWeb = () => {
    //
};

const loginModeratorViaWeb = () => {
    //    
};

const actionSkip = () => {
    router.push('/room');
};
</script>