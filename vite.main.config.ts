// Cấu hình cho main process (backend của Electron app)
// Môi trường: Node.js environment
// Chức năng: Tạo cửa sổ, quản lý menu, file system, etc.
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
    css: {
        preprocessorOptions: {
            scss: { api: 'modern-compiler' }
        }
    },

    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            external: ['serialport', 'node-hid', 'node-rtsp-stream']
        }
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
});
