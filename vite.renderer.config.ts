import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import vitePluginSass from 'vite-plugin-sass';
import path from 'path';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
      ],
    }),
    vitePluginSass(),
    svgLoader({
      svgoConfig: {
        plugins: [
          {
            name: 'removeAttrs',
            params: { attrs: '(width|height|fill|stroke)' }, // Loại bỏ fill/stroke cứng
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
  },
});
