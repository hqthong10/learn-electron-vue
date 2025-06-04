<template>
    <teleport to="body">
        <transition name="fade">
            <div v-if="visible" class="wbn-overlay-loading">
                <div class="loading-box">
                    <!-- <wbn-icon name="question-circle" /> -->
                    <!-- <div class="spinner"></div> -->
                    <!-- <div class="dots-spinner">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div> -->
                    <div class="ring-spinner"></div>
                    <div v-if="text.length > 0" class="spinner-label">{{ text }}</div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { overloading } from '@/utils/overlay-loading';
import { ref, watchEffect, computed } from 'vue';
const visible = computed(() => (overloading as any)._visible.value);
const text = computed(() => (overloading as any)._text.value);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.wbn-overlay-loading {
    position: fixed;
    z-index: 9999;
    display: flex;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);

    .loading-box {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        padding: 10px;
        background: #000;
        border-radius: 10px;
    }


    .spinner-item {
        text-align: center;
    }

    /* Simple circular spinner */
    .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }

    /* Dots spinner */
    .dots-spinner {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
        margin: 20px;
    }

    .dots-spinner div {
        position: absolute;
        top: 33px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #fff;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
    }

    .dots-spinner div:nth-child(1) {
        left: 8px;
        animation: dots1 0.6s infinite;
    }

    .dots-spinner div:nth-child(2) {
        left: 8px;
        animation: dots2 0.6s infinite;
    }

    .dots-spinner div:nth-child(3) {
        left: 32px;
        animation: dots2 0.6s infinite;
    }

    .dots-spinner div:nth-child(4) {
        left: 56px;
        animation: dots3 0.6s infinite;
    }

    /* Ring spinner */
    .ring-spinner {
        display: inline-block;
        width: 56px;
        height: 56px;
        margin: 10px;
    }

    .ring-spinner:after {
        content: " ";
        display: block;
        width: 46px;
        height: 46px;
        margin: 1px;
        border-radius: 50%;
        border: 5px solid #fff;
        border-color: #fff transparent #fff transparent;
        animation: ring-spin 1.2s linear infinite;
    }


}

/* Keyframe animations */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes ring-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes dots1 {
    0% {
        transform: scale(0);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes dots3 {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(0);
    }
}

@keyframes dots2 {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(24px, 0);
    }
}
</style>
