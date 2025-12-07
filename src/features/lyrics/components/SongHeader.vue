<template>
  <div v-if="song" class="mb-6">
    <h1 class="text-4xl font-bold text-gray-900">{{ song.title }}</h1>
    <p class="text-xl text-gray-600 mt-2">{{ song.artist }}</p>
  </div>
  <div v-else class="mb-6">
    <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  song: any
  isLoading: boolean
}

defineProps<Props>()
</script>
