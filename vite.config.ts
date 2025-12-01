/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/** 開發伺服器 Port（E2E 測試也會使用此設定） */
export const DEV_SERVER_PORT = 5173

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署時使用 repo 名稱作為 base path
  // 如果是部署到 username.github.io，請改為 '/'
  base: process.env.NODE_ENV === 'production' ? '/LyriFind/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: DEV_SERVER_PORT,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
})
