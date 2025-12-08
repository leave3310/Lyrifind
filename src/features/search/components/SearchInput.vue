<template>
  <div class="w-full max-w-2xl mx-auto">
    <form @submit.prevent="handleSubmit" class="relative">
      <input
        v-model="localKeyword"
        type="text"
        placeholder="搜尋歌曲、歌手或歌詞..."
        class="w-full px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :disabled="disabled"
        @input="handleInput"
      />
      <button
        type="submit"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
        :disabled="disabled || !localKeyword.trim()"
        aria-label="搜尋"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>

    <!-- 關鍵字截斷提示 -->
    <p
      v-if="localKeyword.length > 200"
      class="mt-2 text-sm text-orange-600"
    >
      關鍵字已超過 200 字元，將自動截斷
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  disabled?: boolean
  autoSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  autoSearch: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  input: []
}>()

const localKeyword = ref(props.modelValue)

// 監聽 prop 變化
watch(() => props.modelValue, (newValue) => {
  localKeyword.value = newValue
})

// 監聽本地值變化並發送更新
watch(localKeyword, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleSubmit = () => {
  if (localKeyword.value.trim()) {
    emit('search')
  }
}

const handleInput = () => {
  emit('input')
  if (props.autoSearch) {
    emit('search')
  }
}
</script>
