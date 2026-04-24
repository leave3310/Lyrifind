<template>
  <header class="mb-6">
    <h1
      class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
      data-testid="song-detail-title"
    >
      {{ title }}
    </h1>
    <p
      class="text-lg sm:text-xl text-gray-600"
      data-testid="song-detail-artist"
      aria-label="`歌手：${artist}`"
    >
      歌手：{{ artist }}
    </p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  artist: string
}>()
</script>
