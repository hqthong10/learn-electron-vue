<template>
    <div v-bind="attrs" class="parking-view" :class="align">
        <div class="div-left" :class="align">
            <div v-if="hids.length > 0" class="div-item">
                <el-select
                    v-model="hidDevice"
                    placeholder="Select"
                    size="large"
                    style="width: 240px"
                    @change="onChangeHidDevice"
                    >
                    <el-option
                        v-for="item, idx in hids"
                        :key="idx"
                        :label="`${item.interface}-${item.product}`"
                        :value="item.productId"
                    />
                </el-select>
            </div>
            <div class="div-item">
                <label>Code</label>
                <span>{{ rifCode }}</span>
            </div>
            <div class="div-item">
                <label>Ma so</label>
                <span>{{ licensePlate }}</span>
            </div>
            <div class="div-item">
                <el-button :disabled="loadingCapture" @loading="loadingCapture" @click.native="capture">Chụp</el-button>
            </div>
            <div class="div-item">
                <el-button @click.native="selectImage">Chọn file</el-button>
            </div>
        </div>
        <div class="div-main">
            <div class="display-item"><img v-if="imgCapture1.length > 0" :src="imgCapture1"></div>
            <div class="display-item"></div>
            <div class="display-item"><img v-if="imgDetect.length > 0" :src="imgDetect"></div>
            <div class="display-item"></div>
            <div class="display-item"><ui-camera ref="cameraRef" :config="config1"/></div>
            <div class="display-item"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, useAttrs } from 'vue';
import UiCamera from '@/components/ui-camera.vue';
import { attachChooseFile, fileToBase64 } from '@/utils/helper';

const attrs = useAttrs()

const rifCode = ref('');
const licensePlate = ref('');
const imgCapture1 = ref('');
const imgDetect = ref('');
const cropPath = ref('');
const plateText = ref('');

const loadingCapture = ref(false);

const hids = ref<IDevice[]>([]);
const coms = ref<IDevice[]>([]);
const hidDevice = ref(0);

let lastKeyTime = Date.now()
let buffer = ''
let keyEventListen: any = null;
let onHidListen: any = null;

const cameraRef = ref<InstanceType<typeof UiCamera> | null>(null)

const config1 = reactive<ICamera>({
    name: 'camera 1',
    type: 'rtsp',
    ip: '14.241.245.161',
    port: 554,
    username: 'viewer',
    password: 'FB1D2631C12FE8F7EE8951663A8A108',
    channel: 1
});

const align = computed(() => {
    return attrs.hasOwnProperty('right')  ? '_right' : attrs.hasOwnProperty('top')  ? '_top' : attrs.hasOwnProperty('bottom')  ? '_bottom' : '';
});

onMounted(async () => {
    hids.value = await window.Api.getHidDevices();
    coms.value = await window.Api.getComDevices();
    hidDevice.value = hids.value?.[0]?.productId || 0;
    onChangeHidDevice();
});

onUnmounted(() => {
    if(keyEventListen) {
        window.removeEventListener('keydown', keyEventListen);
    }
    keyEventListen = null;
});

const onChangeHidDevice = () => {
    const devi = hids.value.find((d: IDevice) => d.productId === hidDevice.value);
    console.log('device selected', devi);

    if(devi == null || devi?.interface === 0) {
        keyEventListen = window.addEventListener('keydown', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastKeyTime > 100) {
                buffer = '';
            }
            if (e.key === 'Enter') {
                if (buffer.length > 7) {
                    console.log('Mã từ thiết bị:', buffer);
                    rifCode.value = buffer;
                    capture();
                }
                buffer = '';
            } else {
                buffer += e.key;
            }
            lastKeyTime = currentTime;
        });
    }

    if(devi?.interface === 1) {
        window.Api.connectHID(JSON.parse(JSON.stringify({...devi})));
        onHidListen = window.Api.onHID((data) => {
            console.log('onHID', data);
        })
    }
    
}

const capture = async () => {
    loadingCapture.value = true;
    const rs = await cameraRef.value.capture();
    loadingCapture.value = false;
    console.log(rs);
    imgCapture1.value = rs.imgPath || '';
}



const selectImage = () => {
    attachChooseFile('image/*', false, async (files: File[], event: Event) => {
        const file = files[0]
        if (!file) return;
        loadingCapture.value = true;
        // imgDetect.value = URL.createObjectURL(file);
        
        const base64 = await fileToBase64(file);
        const t2 = await window.Api.detectImage(base64);
        console.log('kết qua t', JSON.parse(t2));
        licensePlate.value = JSON.parse(t2).results.join(' ');
        loadingCapture.value = false;
    });
}

</script>
<style scoped lang="scss">
.parking-view{
    display: flex;
    height: 100%;
    width: 100%;
    background: #f5f5f5;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 6px;

    &._right{
        flex-direction: row-reverse;
    }
    &._top{
        flex-direction: column;
    }
    &._bottom{
        flex-direction: column-reverse;
    }

    .div-left{
        display: flex;
        flex-direction: column;
        flex: none;
        width: 300px;
        height: 100%;
        border-radius: 3px;
        background-color: #ccc;
        padding: 10px;
        gap: 15px;

        &._top, &._bottom{
            width: 100%;
            height: 300px;
            flex-direction: row;
        }

        .div-item{
            display: flex;
            flex-flow: column;
            gap: 6px;
            width: 100%;

            span {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 40px;
                width: 100%;
                background-color: #fff;
                font-size: 26px;
            }
        }
    }

    .div-main {
        display: flex;
        flex-flow: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        width: 100%;
        background: #fff;
        gap: 6px;
        border-radius: 3px;
        
        .display-item {
            background-color: #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            width: calc(50% - 3px);
            aspect-ratio: 16 / 9;
            border-radius: 3px;
            overflow: hidden;

            img{
                max-width: 100%;
            }
        }
    }
}
</style>