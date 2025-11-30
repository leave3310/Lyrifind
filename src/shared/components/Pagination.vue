<script setup lang="ts">
/**
 * Pagination 元件
 * @description 分頁導航元件
 */

import { computed } from 'vue'

/** Props 定義 */
interface Props {
  /** 當前頁碼 */
  currentPage: number
  /** 總頁數 */
  totalPages: number
  /** 是否禁用 */
  disabled?: boolean
  /** 顯示的頁碼數量（奇數） */
  visiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  visiblePages: 5,
})

/** Emits 定義 */
interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'change', page: number): void
}

const emit = defineEmits<Emits>()

/**
 * 計算要顯示的頁碼列表
 */
const visiblePageNumbers = computed(() => {
  const pages: (number | '...')[] = []
  const total = props.totalPages
  const current = props.currentPage
  const visible = props.visiblePages

  if (total <= visible) {
    // 總頁數小於等於可見頁數，全部顯示
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 計算起始和結束頁碼
    const half = Math.floor(visible / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, current + half)

    // 調整邊界
    if (current <= half) {
      end = visible
    } else if (current > total - half) {
      start = total - visible + 1
    }

    // 添加第一頁和省略號
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    // 添加可見頁碼
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // 添加省略號和最後一頁
    if (end < total) {
      if (end < total - 1) {
        pages.push('...')
      }
      pages.push(total)
    }
  }

  return pages
})

/**
 * 是否可以往前翻頁
 */
const canGoPrev = computed(() => props.currentPage > 1)

/**
 * 是否可以往後翻頁
 */
const canGoNext = computed(() => props.currentPage < props.totalPages)

/**
 * 跳轉至指定頁碼
 * @param page - 目標頁碼
 */
function goToPage(page: number): void {
  if (props.disabled || page < 1 || page > props.totalPages || page === props.currentPage) {
    return
  }
  emit('update:currentPage', page)
  emit('change', page)
}

/**
 * 跳轉至上一頁
 */
function goToPrev(): void {
  if (canGoPrev.value) {
    goToPage(props.currentPage - 1)
  }
}

/**
 * 跳轉至下一頁
 */
function goToNext(): void {
  if (canGoNext.value) {
    goToPage(props.currentPage + 1)
  }
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="pagination flex items-center justify-center space-x-1"
    data-testid="pagination"
    role="navigation"
    aria-label="分頁導航"
  >
    <!-- 上一頁按鈕 -->
    <button
      type="button"
      data-testid="pagination-prev"
      :disabled="!canGoPrev || disabled"
      class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="上一頁"
      @click="goToPrev"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
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

    <!-- 頁碼按鈕 -->
    <template v-for="(page, index) in visiblePageNumbers" :key="index">
      <span
        v-if="page === '...'"
        class="flex h-9 w-9 items-center justify-center text-gray-500"
        aria-hidden="true"
      >
        ...
      </span>
      <button
        v-else
        type="button"
        :data-testid="`pagination-page-${page}`"
        :disabled="disabled"
        :class="[
          'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors',
          page === currentPage
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
          disabled && 'cursor-not-allowed opacity-50',
        ]"
        :aria-current="page === currentPage ? 'page' : undefined"
        :aria-label="`第 ${page} 頁`"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- 下一頁按鈕 -->
    <button
      type="button"
      data-testid="pagination-next"
      :disabled="!canGoNext || disabled"
      class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="下一頁"
      @click="goToNext"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </nav>
</template>
