<template>
  <div class="search-bar w-full">
    <div class="flex gap-2">
      <input
        v-model="localQuery"
        type="text"
        data-testid="search-input"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="搜尋歌名、歌手或歌詞..."
        @keyup.enter="handleSearch"
      />
      <button
        data-testid="search-button"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
        @click="handleSearch"
      >
        搜尋
      </button>
    </div>
  </div>
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
