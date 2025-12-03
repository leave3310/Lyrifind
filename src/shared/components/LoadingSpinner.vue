<script setup lang="ts">
/**
 * 載入指示器元件
 * @description 顯示載入中的動畫指示器
 */

interface Props {
  /** 大小：small | medium | large */
  size?: 'small' | 'medium' | 'large'
  /** 是否顯示文字 */
  showText?: boolean
  /** 自訂文字 */
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showText: true,
  text: '載入中...',
})

const sizeClasses = {
  small: 'w-4 h-4 border-2',
  medium: 'w-8 h-8 border-3',
  large: 'w-12 h-12 border-4',
}

const textSizeClasses = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2" data-testid="loading-spinner">
    <div
      :class="[
        sizeClasses[props.size],
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
      ]"
      role="status"
      aria-label="載入中"
    />
    <span v-if="props.showText" :class="[textSizeClasses[props.size], 'text-secondary']">
      {{ props.text }}
    </span>
  </div>
</template>
