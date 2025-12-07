<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      搜尋歌詞
    </label>
    <div class="flex gap-2">
      <input
        v-model="query"
        @keyup.enter="search"
        type="text"
        placeholder="輸入歌名、歌手或歌詞..."
        maxlength="200"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        @click="search"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        搜尋
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')

const emit = defineEmits<{
  search: [query: string]
}>()

function search() {
  if (query.value.trim()) {
    emit('search', query.value)
  }
}
</script>
