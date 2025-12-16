<template>
  <div 
    class="lyrics-highlight text-sm text-gray-700"
    v-html="highlightedHtml"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLyricsHighlight } from '../composables/useLyricsHighlight'

const props = defineProps<{
  text: string
  query: string
}>()

const { highlightText } = useLyricsHighlight()

const highlightedHtml = computed(() => {
  return highlightText(props.text, props.query)
})
</script>

<style scoped>
.lyrics-highlight :deep(mark) {
  @apply bg-yellow-200 font-bold;
}
</style>
