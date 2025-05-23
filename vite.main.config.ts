import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    css: {
        preprocessorOptions: {
            scss: { api: 'modern-compiler' }
        }
    },
    build: {
        rollupOptions: {
            external: ['serialport', 'node-hid']
        }
    }
});
