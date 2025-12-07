<template>
  <div v-if="song" class="mb-4 sm:mb-6">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">{{ song.title }}</h1>
    <p class="text-lg sm:text-xl text-gray-600">{{ song.artist }}</p>
  </div>
  <div v-else class="mb-6 space-y-2">
    <div class="h-8 sm:h-10 bg-gray-200 rounded animate-pulse w-3/4"></div>
    <div class="h-6 sm:h-7 bg-gray-200 rounded animate-pulse w-1/2"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  song: any
  isLoading: boolean
}

defineProps<Props>()
</script>
