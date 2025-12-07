<template>
  <div class="flex items-center justify-center py-8">
    <div class="inline-flex items-center space-x-2">
      <div
        class="w-4 h-4 bg-blue-500 rounded-full animate-bounce"
        style="animation-delay: 0s"
      ></div>
      <div
        class="w-4 h-4 bg-blue-500 rounded-full animate-bounce"
        style="animation-delay: 0.2s"
      ></div>
      <div
        class="w-4 h-4 bg-blue-500 rounded-full animate-bounce"
        style="animation-delay: 0.4s"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 載入指示器元件
// 顯示三個彈跳圓點動畫
</script>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
