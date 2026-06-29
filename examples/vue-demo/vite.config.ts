import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
  },
  server: {
    port: 5174,
  },
  build: {
    target: 'es2020',
  },
});
