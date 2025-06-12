<template>
    <div class="sidebar-main">
        <RouterLink to="/home" class="bar-item" :class="{'active': isActived('home')}"><ui-icon name="home" /></RouterLink>
        <RouterLink to="/setting" class="bar-item" :class="{'active': isActived('setting')}"><ui-icon name="settings" /></RouterLink>
        <div class="space-full"></div>
        
        <RouterLink v-if="logined" to="/profile" class="bar-item"><img :src="avatar" width="40"/></RouterLink>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logined = computed(() => !!authStore?.data);

const avatar = computed(() => authStore?.data?.QO106?.MV656 || '');

const isActived = (text: string) => router.currentRoute.value.path.includes(text);

onMounted(() => {
    //
});

</script>

<style scoped lang="scss">
.sidebar-main{
    display: flex;
    flex-direction: column;
    padding: 0px 0px 20px 0px;
    width: 60px;
    gap: 5px;
    background-color: #ccc;
    padding: 5px;
    flex: none;

    .bar-item{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        padding: 5px;
        border-radius: 8px;
        
        &.active{
            background-color: #f2f2f2;
        }

        .ui-icon{
            display: flex;
            font-size: 30px;
            color: #000;
        }

        img{
            display: flex;
            width: 40px;
            height: 40px;
            background-color: #fff;
            border-radius: 50%;
            object-fit: cover;
        }
    }

    .space-full{
        flex: 1;
    }
}
</style>