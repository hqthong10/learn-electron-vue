<template>
    <div class="camera-container">
        <div class="camera-config">
            <h3>Hikvision Camera Configuration</h3>
            <form @submit.prevent="connectCamera">
                <div class="form-group">
                    <label>Camera IP:</label>
                    <input v-model="config.ip" type="text" placeholder="192.168.1.100" required />
                </div>

                <div class="form-group">
                    <label>Username:</label>
                    <input v-model="config.username" type="text" placeholder="admin" required />
                </div>

                <div class="form-group">
                    <label>Password:</label>
                    <input v-model="config.password" type="password" required />
                </div>

                <div class="form-group">
                    <label>Port:</label>
                    <input v-model="config.port" type="number" placeholder="554" />
                </div>

                <div class="form-group">
                    <label>Channel:</label>
                    <input v-model="config.channel" type="number" placeholder="1" />
                </div>

                <button type="submit" :disabled="isConnecting">
                    {{ isConnecting ? 'Connecting...' : 'Connect Camera' }}
                </button>
            </form>
        </div>

        <div v-if="isConnected" class="camera-controls">
            <div class="video-container">
                <video ref="videoElement" :src="rtspUrl" autoplay muted controls @loadstart="onVideoLoadStart"
                    @error="onVideoError">
                    Your browser does not support video streaming.
                </video>
            </div>

            <div class="controls">
                <button @click="captureScreenshot" :disabled="isCapturing">
                    {{ isCapturing ? 'Capturing...' : 'Capture Screenshot' }}
                </button>

                <div v-if="lastScreenshot" class="screenshot-info">
                    <p>Last screenshot: {{ lastScreenshot.timestamp }}</p>
                    <img :src="lastScreenshot.dataUrl" alt="Screenshot" class="thumbnail" />
                </div>
            </div>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
    name: 'CameraComponent',
    setup() {
        const config = reactive({
            ip: '14.241.245.161',
            port: 554,
            username: 'viewer',
            password: 'FB1D2631C12FE8F7EE8951663A8A108',
            channel: 1
        });

        const isConnecting = ref(false);
        const isConnected = ref(false);
        const isCapturing = ref(false);
        const rtspUrl = ref('');
        const error = ref('');
        const lastScreenshot = ref(null);
        const videoElement = ref(null);

        const connectCamera = async () => {
            isConnecting.value = true;
            error.value = '';

            try {
                const result = await window.Api.connectCamera({ ...config });

                if (result.success) {
                    rtspUrl.value = result.rtspUrl;
                    isConnected.value = true;

                    // For direct RTSP streaming in video element (may not work in all browsers)
                    // Alternative: Use HLS.js or other streaming libraries
                    if (videoElement.value) {
                        videoElement.value.src = result.rtspUrl;
                    }
                } else {
                    error.value = result.error;
                }
            } catch (err) {
                error.value = 'Failed to connect to camera: ' + err.message;
            } finally {
                isConnecting.value = false;
            }
        };

        const captureScreenshot = async () => {
            if (!rtspUrl.value) return;

            isCapturing.value = true;
            error.value = '';

            try {
                const result = await window.Api.captureScreenshot(rtspUrl.value);

                if (result.success) {
                    // Convert file path to data URL for display
                    const fs = require('fs');
                    const imageBuffer = fs.readFileSync(result.path);
                    const base64Image = imageBuffer.toString('base64');
                    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

                    lastScreenshot.value = {
                        path: result.path,
                        dataUrl: dataUrl,
                        timestamp: new Date().toLocaleString()
                    };
                } else {
                    error.value = 'Failed to capture screenshot: ' + result.error;
                }
            } catch (err) {
                error.value = 'Screenshot error: ' + err.message;
            } finally {
                isCapturing.value = false;
            }
        };

        const onVideoLoadStart = () => {
            console.log('Video loading started');
        };

        const onVideoError = (event) => {
            console.error('Video error:', event);
            error.value = 'Video streaming error. RTSP may not be directly supported in browser.';
        };

        return {
            config,
            isConnecting,
            isConnected,
            isCapturing,
            rtspUrl,
            error,
            lastScreenshot,
            videoElement,
            connectCamera,
            captureScreenshot,
            onVideoLoadStart,
            onVideoError
        };
    }
};
</script>

<style scoped>
.camera-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.camera-config {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.video-container {
    margin: 20px 0;
}

video {
    width: 100%;
    max-width: 640px;
    height: auto;
    border: 1px solid #ddd;
}

.controls {
    margin: 20px 0;
}

.screenshot-info {
    margin-top: 15px;
    padding: 10px;
    background: #e9ecef;
    border-radius: 4px;
}

.thumbnail {
    max-width: 200px;
    height: auto;
    border: 1px solid #ddd;
    margin-top: 10px;
}

.error-message {
    color: red;
    padding: 10px;
    background: #ffebee;
    border-radius: 4px;
    margin: 10px 0;
}
</style>