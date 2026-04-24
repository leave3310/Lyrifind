<template>
  <button
    data-testid="back-button"
    class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
    aria-label="返回搜尋結果頁面"
    @click="emit('click')"
  >
    <span class="text-xl" aria-hidden="true">←</span>
    <span>返回搜尋結果</span>
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>
