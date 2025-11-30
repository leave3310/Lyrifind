<script setup lang="ts">
/**
 * SearchBar 元件
 * @description 搜尋輸入框元件
 */
import { ref, watch } from 'vue'

/** Props 定義 */
interface Props {
  /** 搜尋關鍵字（v-model） */
  modelValue?: string
  /** 佔位文字 */
  placeholder?: string
  /** 是否正在載入 */
  loading?: boolean
  /** 是否自動聚焦 */
  autofocus?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/** Emits 定義 */
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '請輸入歌名、歌手或歌詞...',
  loading: false,
  autofocus: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

/** 內部輸入值 */
const inputValue = ref(props.modelValue)

/** 監聽外部 modelValue 變化 */
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  }
)

/**
 * 處理輸入變化
 * @param event - 輸入事件
 */
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
}

/**
 * 處理搜尋提交
 */
function handleSubmit(): void {
  const trimmedValue = inputValue.value.trim()
  emit('search', trimmedValue)
}

/**
 * 處理按鍵事件
 * @param event - 鍵盤事件
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    handleSubmit()
  }
}

/**
 * 清除輸入
 */
function handleClear(): void {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="search-bar" data-testid="search-bar">
    <div class="relative flex items-center">
      <!-- 搜尋圖示 -->
      <div class="absolute left-3 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- 輸入框 -->
      <input
        :value="inputValue"
        type="text"
        data-testid="search-input"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :autofocus="autofocus"
        class="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-20 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
        aria-label="搜尋歌詞"
        @input="handleInput"
        @keydown="handleKeyDown"
      />

      <!-- 清除按鈕 -->
      <button
        v-if="inputValue && !loading"
        type="button"
        data-testid="clear-button"
        class="absolute right-14 text-gray-400 hover:text-gray-600"
        aria-label="清除搜尋"
        @click="handleClear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- 搜尋按鈕 -->
      <button
        type="button"
        data-testid="search-button"
        :disabled="disabled || loading || !inputValue.trim()"
        class="absolute right-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-gray-300"
        aria-label="執行搜尋"
        @click="handleSubmit"
      >
        <span v-if="loading" class="flex items-center">
          <svg
            class="mr-1 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          搜尋中
        </span>
        <span v-else>搜尋</span>
      </button>
    </div>
  </div>
</template>
