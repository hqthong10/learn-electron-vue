<template>
    <div id="app">
        <div class="container">
            <h1>Cài đặt Camera</h1>

            <!-- Camera Configuration -->
            <div class="config-section">
                <h2>Cấu hình Camera</h2>
                <div class="config-grid">
                    <div class="config-group">
                        <label>IP Camera:</label>
                        <input v-model="cameraConfig.ip" type="text" placeholder="192.168.1.64"
                            :disabled="isConnected" />
                    </div>

                    <div class="config-group">
                        <label>Port:</label>
                        <input v-model="cameraConfig.port" type="number" placeholder="80" :disabled="isConnected" />
                    </div>

                    <div class="config-group">
                        <label>Username:</label>
                        <input v-model="cameraConfig.username" type="text" placeholder="admin"
                            :disabled="isConnected" />
                    </div>

                    <div class="config-group">
                        <label>Password:</label>
                        <input v-model="cameraConfig.password" type="password" placeholder="password"
                            :disabled="isConnected" />
                    </div>
                </div>

                <div class="button-group">
                    <button @click="testConnection" :disabled="isLoading" class="btn btn-primary">
                        {{ isLoading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối' }}
                    </button>

                    <button v-if="isConnected" @click="disconnect" class="btn btn-secondary">
                        Ngắt kết nối
                    </button>
                </div>
            </div>

            <!-- Connection Status -->
            <div class="status-section">
                <div class="status-indicator" :class="statusClass">
                    <span class="status-dot"></span>
                    {{ connectionStatus }}
                </div>
            </div>

            <!-- Camera Controls -->
            <div v-if="isConnected" class="controls-section">
                <h2>Điều khiển Camera</h2>

                <div class="button-group">
                    <button @click="captureImage" :disabled="isCapturing" class="btn btn-success">
                        {{ isCapturing ? 'Đang chụp...' : '📷 Chụp ảnh' }}
                    </button>

                    <button v-if="lastCapturedImage" @click="saveImage" class="btn btn-info">
                        💾 Lưu ảnh
                    </button>

                    <button @click="clearImages" class="btn btn-warning">
                        🗑️ Xóa ảnh
                    </button>
                </div>
            </div>

            <!-- Image Display -->
            <div v-if="lastCapturedImage" class="image-section">
                <h2>Ảnh đã chụp</h2>
                <div class="image-container">
                    <img :src="lastCapturedImage" alt="Captured Image" />
                    <div class="image-info">
                        <p><strong>Thời gian:</strong> {{ lastCaptureTime }}</p>
                        <p><strong>Camera:</strong> {{ cameraConfig.ip }}</p>
                    </div>
                </div>
            </div>

            <!-- Image Gallery -->
            <div v-if="capturedImages.length > 0" class="gallery-section">
                <h2>Thư viện ảnh ({{ capturedImages.length }})</h2>
                <div class="gallery-grid">
                    <div v-for="(image, index) in capturedImages" :key="index" class="gallery-item"
                        @click="selectImage(image)">
                        <img :src="image.data" :alt="`Ảnh ${index + 1}`" />
                        <div class="gallery-info">
                            <small>{{ formatTime(image.timestamp) }}</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error Messages -->
            <div v-if="errorMessage" class="error-section">
                <div class="error-message">
                    ⚠️ {{ errorMessage }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface CameraConfig {
    ip: string
    port: number
    username: string
    password: string
}

interface CapturedImage {
    data: string
    timestamp: string
}

// Reactive data
const cameraConfig = ref<CameraConfig>({
    ip: '14.241.245.161',
    port: 554,
    username: 'viewer',
    password: 'FB1D2631C12FE8F7EE8951663A8A108'
})

const isConnected = ref(false)
const isLoading = ref(false)
const isCapturing = ref(false)
const connectionStatus = ref('Chưa kết nối')
const errorMessage = ref('')
const lastCapturedImage = ref('')
const lastCaptureTime = ref('')
const capturedImages = ref<CapturedImage[]>([])

// Computed properties
const statusClass = computed(() => {
    if (isConnected.value) return 'status-connected'
    if (isLoading.value) return 'status-connecting'
    return 'status-disconnected'
})

// Methods
const testConnection = async () => {
    isLoading.value = true
    errorMessage.value = ''
    connectionStatus.value = 'Đang kết nối...'

    try {
        const result = await window.Api.testCameraConnection({ ...cameraConfig.value})
        if (result.success) {
            isConnected.value = true
            connectionStatus.value = 'Đã kết nối'
        } else {
            throw new Error(result.error || 'Kết nối thất bại')
        }
    } catch (error: any) {
        errorMessage.value = error.message || 'Không thể kết nối camera'
        connectionStatus.value = 'Kết nối thất bại'
    } finally {
        isLoading.value = false
    }
}

const disconnect = () => {
    isConnected.value = false
    connectionStatus.value = 'Chưa kết nối'
    errorMessage.value = ''
}

const captureImage = async () => {
    isCapturing.value = true
    errorMessage.value = ''

    try {
        const result = await window.Api.captureSnapshot({ ...cameraConfig.value })

        if (result.success && result.image) {
            lastCapturedImage.value = result.image
            lastCaptureTime.value = result.timestamp || new Date().toISOString()

            // Add to gallery
            capturedImages.value.unshift({
                data: result.image,
                timestamp: result.timestamp || new Date().toISOString()
            })

            // Keep only last 10 images
            if (capturedImages.value.length > 10) {
                capturedImages.value = capturedImages.value.slice(0, 10)
            }
        } else {
            throw new Error(result.error || 'Chụp ảnh thất bại')
        }
    } catch (error: any) {
        errorMessage.value = error.message || 'Không thể chụp ảnh'
    } finally {
        isCapturing.value = false
    }
}

const saveImage = async () => {
    if (!lastCapturedImage.value) return

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `hikvision-${timestamp}.jpg`

        const result = await window.Api.saveImage(lastCapturedImage.value, filename)

        if (result.success) {
            alert(`Ảnh đã được lưu: ${result.filePath}`)
        } else {
            throw new Error(result.error || 'Lưu ảnh thất bại')
        }
    } catch (error: any) {
        errorMessage.value = error.message || 'Không thể lưu ảnh'
    }
}

const selectImage = (image: CapturedImage) => {
    lastCapturedImage.value = image.data
    lastCaptureTime.value = image.timestamp
}

const clearImages = () => {
    capturedImages.value = []
    lastCapturedImage.value = ''
    lastCaptureTime.value = ''
}

const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN')
}

// Load saved config on mount
onMounted(() => {
    const savedConfig = localStorage.getItem('hikvision-config')
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig)
            cameraConfig.value = { ...cameraConfig.value, ...config }
        } catch (e) {
            console.error('Failed to load saved config:', e)
        }
    }
})

// Save config when changed
const saveConfig = () => {
    localStorage.setItem('hikvision-config', JSON.stringify(cameraConfig.value))
}
</script>

<style scoped>
#app {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 2.5em;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #34495e;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.config-section,
.controls-section,
.image-section,
.gallery-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    border: 1px solid #dee2e6;
}

.config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.config-group {
    display: flex;
    flex-direction: column;
}

.config-group label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #495057;
}

.config-group input {
    padding: 10px;
    border: 2px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.config-group input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.config-group input:disabled {
    background-color: #e9ecef;
    color: #6c757d;
}

.button-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-primary {
    background: linear-gradient(45deg, #3498db, #2980b9);
    color: white;
}

.btn-secondary {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);
    color: white;
}

.btn-success {
    background: linear-gradient(45deg, #2ecc71, #27ae60);
    color: white;
}

.btn-info {
    background: linear-gradient(45deg, #3498db, #2980b9);
    color: white;
}

.btn-warning {
    background: linear-gradient(45deg, #f39c12, #e67e22);
    color: white;
}

.status-section {
    text-align: center;
    margin-bottom: 20px;
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 16px;
}

.status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.status-disconnected {
    background: #ecf0f1;
    color: #7f8c8d;
}

.status-disconnected .status-dot {
    background: #bdc3c7;
}

.status-connecting {
    background: #fff3cd;
    color: #856404;
}

.status-connecting .status-dot {
    background: #ffc107;
}

.status-connected {
    background: #d4edda;
    color: #155724;
}

.status-connected .status-dot {
    background: #28a745;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}

.image-container {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.image-container img {
    max-width: 600px;
    max-height: 400px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-info {
    flex: 1;
    padding: 20px;
    background: white;
    border-radius: 10px;
    border: 2px solid #e9ecef;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
}

.gallery-item {
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.3s;
    border: 2px solid #e9ecef;
}

.gallery-item:hover {
    transform: scale(1.05);
    border-color: #3498db;
}

.gallery-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.gallery-info {
    padding: 10px;
    background: white;
    text-align: center;
}

.error-section {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
}

.error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 15px 20px;
    border-radius: 5px;
    border: 1px solid #f5c6cb;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 15px;
    }

    .config-grid {
        grid-template-columns: 1fr;
    }

    .image-container {
        flex-direction: column;
    }

    .image-container img {
        max-width: 100%;
    }

    .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}
</style>