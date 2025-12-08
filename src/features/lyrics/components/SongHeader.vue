<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h1
      data-testid="song-title"
      class="text-3xl font-bold text-gray-900 mb-2"
    >
      {{ title }}
    </h1>
    <p
      data-testid="song-artist"
      class="text-lg text-gray-600"
    >
      {{ artist }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  artist: string
}

defineProps<Props>()
</script>
