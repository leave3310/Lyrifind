<script setup lang="ts">
/**
 * 應用程式標頭元件
 * @description 網站頂部導覽列
 */
import { RouterLink } from 'vue-router'

interface Props {
  /** 是否顯示返回按鈕 */
  showBack?: boolean
}

interface Emits {
  /** 點擊返回按鈕 */
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
})

const emit = defineEmits<Emits>()

function handleBack() {
  emit('back')
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
  >
    <div class="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <button
          v-if="props.showBack"
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="返回"
          @click="handleBack"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <RouterLink to="/" class="flex items-center gap-2 text-xl font-bold text-primary" data-testid="header-title">
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <span>LyriFind</span>
        </RouterLink>
      </div>

      <nav class="flex items-center gap-2">
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          首頁
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
