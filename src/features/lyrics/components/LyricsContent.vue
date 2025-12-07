<template>
  <div class="mt-8">
    <LoadingSpinner v-if="isLoading" />
    <div v-else-if="song" class="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-gray-900 leading-relaxed">
      {{ song.lyrics }}
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

interface Props {
  song: any
  isLoading: boolean
}

defineProps<Props>()
</script>
