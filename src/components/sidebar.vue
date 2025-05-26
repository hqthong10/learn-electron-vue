<template>
    <div class="sidebar-main">
        <RouterLink to="/home" class="bar-item"><UiIcon name="navi-home" />Home</RouterLink>
        <RouterLink to="/profile" class="bar-item">Profile</RouterLink>
        <div class="space-full"></div>
        <div class="bar-item">
            <label>{{ name }}</label>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import UiIcon from '@/components/ui-icon.vue';

const authStore = useAuthStore();

const name = computed(() => authStore?.data?.QV102 || '');

const avatar = computed(() => authStore?.data?.QO106?.MV656 || '');

onMounted(() => {
    console.log(avatar.value);
});

</script>

<style scoped>
.sidebar-main{
    display: flex;
    flex-direction: column;
    padding: 0px 0px 20px 0px;

    .bar-item{
        display: flex;
        align-items: center;
        padding: 3px 10px;
        gap: 10px;
    }

    .space-full{
        flex: 1;
    }
}
</style>