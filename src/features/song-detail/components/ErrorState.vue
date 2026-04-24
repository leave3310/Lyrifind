<template>
  <div
    class="flex flex-col items-center justify-center py-12 gap-4"
    :role="type === 'not-found' ? 'status' : 'alert'"
    :aria-live="type === 'not-found' ? 'polite' : 'assertive'"
    data-testid="song-detail-error"
  >
    <div
      v-if="type === 'not-found'"
      class="text-center"
      data-testid="song-not-found"
    >
      <p class="text-gray-500 text-lg mb-4">找不到此歌曲</p>
      <slot name="actions">
        <button
          class="text-blue-500 hover:text-blue-700 underline"
          aria-label="返回搜尋結果頁面"
          @click="emit('back')"
        >
          返回搜尋結果
        </button>
      </slot>
    </div>

    <div
      v-else
      class="w-full max-w-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
    >
      <p class="font-medium mb-2">{{ message || '載入歌曲失敗' }}</p>
      <slot name="actions">
        <button
          class="text-sm underline hover:no-underline"
          aria-label="重新載入歌曲資訊"
          @click="emit('retry')"
        >
          重試
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** 錯誤類型：not-found（404）或 error（其他錯誤） */
  type?: 'not-found' | 'error'
  /** 錯誤訊息 */
  message?: string
}>(), {
  type: 'error',
  message: ''
})

const emit = defineEmits<{
  /** 返回上一頁 */
  back: []
  /** 重試 */
  retry: []
}>()
</script>
