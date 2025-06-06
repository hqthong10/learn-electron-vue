<template>
  <div class="video-player">
    <video
      ref="videoRef"
      controls
      muted
      autoplay
      class="video-element"
    ></video>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import Hls from 'hls.js';

export default {
  name: 'VideoPlayer',
  props: {
    src: String
  },
  setup(props) {
    const videoRef = ref(null);
    let hls = null;

    onMounted(() => {
      if (props.src && videoRef.value) {
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(props.src);
          hls.attachMedia(videoRef.value);
        } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.value.src = props.src;
        }
      }
    });

    onUnmounted(() => {
      if (hls) {
        hls.destroy();
      }
    });

    return {
      videoRef
    };
  }
};
</script>