<template>
  <div class="mt-6 sm:mt-8">
    <LoadingSpinner v-if="isLoading" />
    <div
      v-else-if="song"
      class="bg-gray-50 p-4 sm:p-6 rounded-lg whitespace-pre-wrap text-gray-900 leading-relaxed text-sm sm:text-base max-h-96 sm:max-h-full overflow-y-auto"
    >
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
