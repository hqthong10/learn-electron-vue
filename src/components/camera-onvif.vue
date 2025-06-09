<script setup lang="ts">
import { ref } from 'vue';

const ip = ref('14.241.245.161');
const user = ref('viewer');
const pass = ref('FB1D2631C12FE8F7EE8951663A8A108');
const port = ref('554');
const rtspUrl = ref('');

const getRtsp = async () => {
    const url = await window.Api.getRtspUrlOnvif({
        ip: ip.value,
        username: user.value,
        password: pass.value
    });
    rtspUrl.value = url;
};
</script>

<template>
    <div>
        <input v-model="ip" placeholder="IP Camera" />
        <input v-model="user" placeholder="Username" />
        <input v-model="pass" placeholder="Password" type="password" />
        <button @click="getRtsp">Lấy RTSP URL</button>

        <div v-if="rtspUrl">
            <p>🎥 RTSP: {{ rtspUrl }}</p>
        </div>
    </div>
</template>