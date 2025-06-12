<template>
    <div class="home-view">
        <div class="div-left">
            <div class="div-item">
                <label>Code</label>
                <span>{{ rifCode }}</span>
            </div>
            <div class="div-item">
                <label>Ma so</label>
                <span>{{ licensePlate }}</span>
            </div>
            <div class="div-item">
                <el-button @click.native="capture">Chụp</el-button>
            </div>
        </div>
        <div class="div-main">
            <div class="display-item"><img v-if="image1.length > 0" :src="image1"></div>
            <div class="display-item">2</div>
            <div class="display-item">3</div>
            <div class="display-item">4</div>
            <div class="display-item"><ui-camera ref="cameraRef" /></div>
            <div class="display-item">6</div>
        </div>
    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiCamera from '@/components/ui-camera.vue'

const rifCode = ref('');
const licensePlate = ref('');
const image1 = ref('');

let lastKeyTime = Date.now()
let buffer = ''

const cameraRef = ref<InstanceType<typeof UiCamera> | null>(null)

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

const capture = async () => {
    const rs = await cameraRef.value.capture();
    console.log(rs);
    image1.value = rs;
}

</script>
