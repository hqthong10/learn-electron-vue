<template>
    <div class="ui-camera">
        <div v-if="!isConnected">
            <el-button @click.native="connectCamera">Connect</el-button>
        </div>

        <div v-if="isConnected" class="camera-view">
            <video ref="videoElement" :src="rtspUrl" autoplay muted @loadstart="onVideoLoadStart"
                @error="onVideoError">
                Your browser does not support video streaming.
            </video>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose } from 'vue';
import fs from 'fs';

const config = reactive({
    ip: '14.241.245.161',
    port: 554,
    username: 'viewer',
    password: 'FB1D2631C12FE8F7EE8951663A8A108',
    channel: 1
});

const isConnected = ref(false);
const rtspUrl = ref('');
const videoElement = ref(null);

onMounted(async () => {
    rtspUrl.value = `rtsp://${config.username}:${config.password}@${config.ip}:${config.port}`
});

const connectCamera = async () => {
    isConnected.value = true;      
    if (videoElement.value) {
        videoElement.value.src = rtspUrl.value;
    }
};

const capture = async () => {
    const result = await window.Api.camRtspCapture(rtspUrl.value);
    console.log(result)

    // if (result) {
    //     const imageBuffer = fs.readFileSync(result);
    //     const base64Image = imageBuffer.toString('base64');
    //     const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    //     return {
    //         path: result,
    //         dataUrl: dataUrl,
    //         timestamp: new Date().toLocaleString()
    //     };
    // }
    return result;
};

const onVideoLoadStart = () => {
    console.log('Video loading started');
};

const onVideoError = (event: any) => {
    console.error('Video error:', event);
};

defineExpose({
    capture
});
</script>

<style scoped lang="scss">
.ui-camera {
    display: flex;
    width: 100%;
    height: 100%;

    video {
        width: 100%;
        height: 100%;
    }
}
</style>