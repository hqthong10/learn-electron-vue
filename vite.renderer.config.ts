// Cấu hình cho renderer process (frontend UI)
// Môi trường: Browser environment
// Chức năng: Vue/React/HTML UI, CSS, assets, etc.

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        }),
        svgLoader({
            svgoConfig: {
                plugins: [
                    {
                        name: 'removeAttrs',
                        params: { attrs: '(width|height|fill|stroke)' } // Loại bỏ fill/stroke cứng
                    }
                ]
            }
        })
    ],

    css: {
        postcss: './postcss.config.js', // Đảm bảo PostCSS được load
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/styles/variables.scss" as *;`
            }
        }
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '~': path.resolve(__dirname, './')
        }
    },

    // Server configuration (dev only)
    server: {
        host: 'localhost',
        port: 3000,
        strictPort: true
    },

    build: {
        chunkSizeWarningLimit: 2000,
        cssCodeSplit: false // Tránh split CSS trong Electron
    }
});
