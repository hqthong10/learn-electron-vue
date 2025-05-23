<template>
    <div class="home-view">
        <div class="div-sidebar">
            <el-dropdown placement="top-start">
                <el-button>{{ deviceActive }}</el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="(item, index) in devices" :key="index"
                            @click="choiceSerialport(item)">{{ (item.product || '') }}</el-dropdown-item>
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

let devices = reactive<any[]>([]);
const deviceActive = ref('Chọn thiết bị');

onMounted(async () => {
    const dv = await window.Api.getDevices();
    const hids = dedupeById(dv.hid || []);
    // const coms = dedupeById(dv.com || []);
    hids.forEach((hid: any) => {
        devices.push(hid);
    });

    // devices.push(...hids);
    // devices.push(hids[0]);
    // devices.push(hids[2]);
    // devices.push(hids[3]);
    // devices.push(hids[4]);
    // devices.push(hids[5]);


    window.Api.onCOM((tag) => {
        console.log('COM nhận được:', tag)
    });

    window.Api.onHID((data) => {
        console.log('HID nhận được:', data)
    });

    let buffer = ''
    window.addEventListener('keydown', (e) => {
        console.log('keydown:', e)
        if (e.key === 'Enter') {
            console.log('Thẻ:', buffer)
            buffer = ''
        } else {
            buffer += e.key
        }
    })

});

function dedupeById(arr: any[]) {
    const seen = new Set();
    return arr.filter(item => {
        const key = `${item.vendorId}-${item.productId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

const getName = (txt: string) => {
    return txt.split('/').pop();
}

const choiceSerialport = (obj: any) => {
    deviceActive.value = obj.product;
    // window.Api.connectCOM(obj.path);
    window.Api.connectHID({...obj});
}

</script>
