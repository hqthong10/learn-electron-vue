<script setup lang="ts">
import { ref } from 'vue';

const plateImage = ref('');
const rtspUrl = ref('rtsp://admin:123456@192.168.1.100:554/Streaming/Channels/101');

const capture = async () => {
  const path = await window.Api.capturePlateImage(rtspUrl.value);
  plateImage.value = path;
};
</script>

<template>
  <div>
    <input v-model="rtspUrl" style="width: 100%" />
    <button @click="capture">📸 Chụp từ camera</button>
    <div v-if="plateImage">
      <p>Ảnh đã chụp:</p>
      <img :src="`atom://${plateImage}`" style="max-width: 400px" />
    </div>
  </div>
</template>