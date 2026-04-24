<template>
  <div
    class="flex flex-col items-center justify-center py-16 gap-4"
    role="status"
    aria-live="polite"
    aria-label="載入中，請稍候"
  >
    <!-- 骨架屏動畫 -->
    <div class="animate-pulse w-full max-w-2xl space-y-4">
      <!-- 歌名骨架 -->
      <div class="h-8 bg-gray-200 rounded w-3/4" />
      <!-- 歌手骨架 -->
      <div class="h-6 bg-gray-200 rounded w-1/2" />
      <!-- 歌詞骨架 -->
      <div class="space-y-2 mt-6">
        <div class="h-4 bg-gray-200 rounded" />
        <div class="h-4 bg-gray-200 rounded w-11/12" />
        <div class="h-4 bg-gray-200 rounded w-10/12" />
        <div class="h-4 bg-gray-200 rounded" />
        <div class="h-4 bg-gray-200 rounded w-9/12" />
      </div>
    </div>
    <p class="text-gray-400 text-sm mt-4">載入歌曲資訊中...</p>
  </div>
</template>
