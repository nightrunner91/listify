import {
  fileURLToPath,
  URL
} from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {port: 5173,},
  css: {preprocessorOptions: {scss: {additionalData: '@use "@/assets/styles/@core/globals.scss";'}}},
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}}
})
