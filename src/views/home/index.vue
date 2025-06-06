<template>
    <div class="home-view">
        <div class="div-left">
            {{ rifCode }}
        </div>
        <div class="div-main">
            <div class="display-item">1</div>
            <div class="display-item">2</div>
            <div class="display-item">3</div>
            <div class="display-item">4</div>
        </div>
    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const rifCode = ref('');
let lastKeyTime = Date.now()
let buffer = ''

onMounted(async () => {
    window.addEventListener('keydown', (e) => {
        const currentTime = Date.now()

        // Nếu thời gian giữa 2 phím > 100ms, reset buffer (do người gõ tay)
        if (currentTime - lastKeyTime > 100) {
            buffer = ''
        }

        if (e.key === 'Enter') {
            // scanner thường kết thúc bằng Enter
            if (buffer.length > 4) {
                console.log('Mã từ thiết bị:', buffer)
                rifCode.value = buffer;
            }
            buffer = ''
        } else {
            buffer += e.key
        }

        lastKeyTime = currentTime
    })

});

</script>
