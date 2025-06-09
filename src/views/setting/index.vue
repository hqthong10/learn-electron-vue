<template>
    <div class="setting-view">
        <el-tabs v-model="activeName" class="demo-tabs">
            <el-tab-pane label="Hik-connect" name="first">
                <camera-hik />
            </el-tab-pane>
            <el-tab-pane label="RTSP" name="second">
                <camera-rtsp />
            </el-tab-pane>
            <el-tab-pane label="ONVIf" name="three">
                <camera-onvif />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';

const activeName = ref('first');

onMounted(() => {
    //
});

</script>
