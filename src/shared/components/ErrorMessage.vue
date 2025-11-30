<script setup lang="ts">
/**
 * 錯誤訊息元件
 * @description 顯示錯誤訊息並提供重試按鈕
 */
import type { AppError } from '@/shared/types'

interface Props {
  /** 錯誤物件 */
  error: AppError
  /** 是否顯示重試按鈕 */
  showRetry?: boolean
}

interface Emits {
  /** 點擊重試按鈕 */
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  showRetry: true,
})

const emit = defineEmits<Emits>()

/** 處理重試點擊 */
function handleRetry() {
  emit('retry')
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-4 rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20"
    role="alert"
  >
    <!-- 錯誤圖示 -->
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
      <svg
        class="h-6 w-6 text-error"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>

    <!-- 錯誤訊息 -->
    <div class="space-y-1">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">發生錯誤</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ props.error.message }}
      </p>
    </div>

    <!-- 重試按鈕 -->
    <button
      v-if="props.showRetry && props.error.retryable"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      @click="handleRetry"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      重試
    </button>
  </div>
</template>
