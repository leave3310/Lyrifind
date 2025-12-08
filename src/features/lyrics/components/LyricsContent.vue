<template>
  <div
    data-testid="lyrics-content"
    class="bg-white rounded-lg shadow-sm p-6 md:p-8"
  >
    <div class="prose prose-lg max-w-none">
      <pre class="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">{{ lyrics }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  lyrics: string
}

defineProps<Props>()
</script>

<style scoped>
pre {
  font-family: inherit;
  margin: 0;
}
</style>
