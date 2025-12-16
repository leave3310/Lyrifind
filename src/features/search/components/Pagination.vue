<template>
  <div 
    class="pagination flex items-center justify-center gap-2 py-4"
    data-testid="pagination"
  >
    <!-- 上一頁 -->
    <button
      :disabled="currentPage === 1"
      class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      data-testid="prev-page"
      @click="$emit('page-change', currentPage - 1)"
    >
      上一頁
    </button>

    <!-- 頁碼按鈕 -->
    <div class="flex gap-1">
      <template v-for="page in displayPages" :key="page">
        <button
          v-if="typeof page === 'number'"
          :class="[
            'px-3 py-2 border rounded-lg transition-colors',
            page === currentPage
              ? 'bg-blue-500 text-white border-blue-500'
              : 'hover:bg-gray-100'
          ]"
          @click="$emit('page-change', page)"
        >
          {{ page }}
        </button>
        <span v-else class="px-3 py-2">{{ page }}</span>
      </template>
    </div>

    <!-- 下一頁 -->
    <button
      :disabled="currentPage === totalPages"
      class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      data-testid="next-page"
      @click="$emit('page-change', currentPage + 1)"
    >
      下一頁
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  'page-change': [page: number]
}>()

// 計算要顯示的頁碼
const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    // 總頁數 <= 7，顯示所有頁碼
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 總頁數 > 7，使用省略號
    if (current <= 4) {
      // 靠近開頭
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 靠近結尾
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      // 中間
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})
</script>
