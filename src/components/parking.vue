<template>
    <div v-bind="attrs" class="parking-view" :class="align">
        <div class="div-left" :class="align">
            <div class="div-item">
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
<script setup lang="ts">
import { ref, onMounted, computed, useAttrs } from 'vue';
import UiCamera from '@/components/ui-camera.vue'

const attrs = useAttrs()

const rifCode = ref('');
const licensePlate = ref('');
const image1 = ref('');
const hids = ref<any[]>([]);
const hidDevice = ref('');

let lastKeyTime = Date.now()
let buffer = ''

const cameraRef = ref<InstanceType<typeof UiCamera> | null>(null)

const align = computed(() => {
    return attrs.hasOwnProperty('right')  ? '_right' : attrs.hasOwnProperty('top')  ? '_top' : attrs.hasOwnProperty('bottom')  ? '_bottom' : '';
});

onMounted(async () => {
    const dv = await window.Api.getHidDevices();
    console.log(dv);
    hids.value = dv.filter((d: any) => d.manufacturer.toLowerCase().includes('rfid') && d.interface === 1);

    window.Api.onHID((data) => {
        console.log('onHID', data);
    })

    // window.addEventListener('keydown', (e) => {
    //     const currentTime = Date.now()
    //     // Nếu thời gian giữa 2 phím > 100ms, reset buffer (do người gõ tay)
    //     if (currentTime - lastKeyTime > 100) {
    //         buffer = ''
    //     }

    //     if (e.key === 'Enter') {
    //         // scanner thường kết thúc bằng Enter
    //         if (buffer.length > 7) {
    //             console.log('Mã từ thiết bị:', buffer)
    //             rifCode.value = buffer;
    //             capture();
    //         }
    //         buffer = ''
    //     } else {
    //         buffer += e.key
    //     }

    //     lastKeyTime = currentTime
    // })

});

const onChangeHidDevice = () => {
    const devi = hids.value.find((d: any) => d.productId === hidDevice.value);
     window.Api.connectHID(JSON.parse(JSON.stringify({...devi})));
    
}

const capture = async () => {
    const rs = await cameraRef.value.capture();
    console.log(rs);
    image1.value = rs;
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