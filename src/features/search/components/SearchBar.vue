<template>
  <form @submit.prevent="handleSearch" class="search-bar w-full" role="search" aria-label="歌曲搜尋">
    <div class="flex gap-2">
      <input
        v-model="localQuery"
        type="text"
        data-testid="search-input"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="搜尋歌名、歌手或歌詞..."
        aria-label="搜尋關鍵字輸入框"
        aria-describedby="search-hint"
      />
      <button
        type="submit"
        data-testid="search-button"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
        aria-label="執行搜尋"
      >
        搜尋
      </button>
    </div>
    <span id="search-hint" class="sr-only">輸入歌名、歌手或歌詞內容，按 Enter 或點擊搜尋按鈕開始搜尋</span>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const localQuery = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  localQuery.value = newValue
})

watch(localQuery, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleSearch = () => {
  emit('search', localQuery.value)
}
</script>
