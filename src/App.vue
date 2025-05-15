<template>
    <div class="main-layout">
        <Sidebar />
        <RouterView />
    </div>
</template>
<style scoped src="./App.scss"></style>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

onMounted(() => {
    // router.push('/room');
});

</script>