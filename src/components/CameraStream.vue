<template>
  <div>
    <canvas ref="canvas" width="640" height="480" />
    <button @click="capture">📸 Capture</button>
    <img v-if="captured" :src="captured" alt="Captured Frame" style="max-width: 100%; margin-top: 1rem;" />
  </div>
</template>

<script>
import JSMpeg from 'jsmpeg';

export default {
  data() {
    return {
      captured: null,
      player: null
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    const url = 'ws://localhost:9999'; // phải match với rtsp-proxy.js
    this.player = new JSMpeg.Player(url, { canvas });
  },
  methods: {
    capture() {
      const canvas = this.$refs.canvas;
      this.captured = canvas.toDataURL('image/jpeg');
      // Bạn có thể gửi this.captured xuống backend để nhận diện biển số
      this.$emit('captured', this.captured);
    }
  }
};
</script>
