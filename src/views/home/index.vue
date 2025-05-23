<template>
    <div class="home-view">
        <div class="div-sidebar">
            <el-dropdown placement="top-start">
                <el-button>{{ (serialport) }}</el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="(item,index) in devices" :key="index" @click="choiceSerialport(item)">{{ getName(item.path || '') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <div class="div-main">
            home

        </div>

    </div>
</template>
<style scoped src="./index.scss"></style>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import HID from 'node-hid'

let devices = reactive<any[]>([]);
const serialport = ref('Chọn thiết bị');

onMounted(async () => {
    const dt = await window.Api.getListSerialport();
    devices.push(...dt.serialport);
    devices.push(...dt.hid);
    console.log(devices);

    window.Api.onRFID((tag) => {
        console.log('🪪 Thẻ RFID nhận được:', tag)
    })

    // const _devices = HID.devices();
    // console.log('_devices', _devices);

    // const readerInfo = _devices.find(device => 
    //     device.vendorId === 0x1234 && device.productId === 0x5678 // Thay bằng ID thực của đầu đọc
    // );

    // if (readerInfo) {
    //     const reader = new HID.HID(readerInfo.path)
        
    //     reader.on('data', (data) => {
    //         // const cardData = parseCardData(data) // Hàm phân tích dữ liệu thẻ
    //         console.log('Dữ liệu thẻ:', data)
    //     })
        
    //     reader.on('error', (err) => {
    //         console.error('Lỗi đầu đọc HID:', err)
    //     })
    // } else {
    //     console.error('Không tìm thấy đầu đọc thẻ')
    // }
});

const getName =(txt: string) => {
    return txt.split('/').pop();
}

const choiceSerialport = (obj: any) => {
    window.Api.useSerialport(obj.path);
}

</script>
