<template>
    <div class="sidebar-main">
        <div class="bar-item">
            <RouterLink to="/">Home</RouterLink>
        </div>
        <div class="bar-item">
            <RouterLink to="/profile">Profile</RouterLink>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';

onMounted(() => {
    //
});

</script>

<style scoped lang="scss"></style>