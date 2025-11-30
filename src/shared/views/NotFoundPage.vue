<script setup lang="ts">
/**
 * 頁面不存在元件
 * @description 404 錯誤頁面
 */

import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
    <h1 class="text-6xl font-bold text-gray-300 dark:text-gray-700">
      404
    </h1>
    <h2 class="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
      頁面不存在
    </h2>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      您要找的頁面可能已被移除或暫時無法使用
    </p>
    <RouterLink
      to="/"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      返回首頁
    </RouterLink>
  </div>
</template>
