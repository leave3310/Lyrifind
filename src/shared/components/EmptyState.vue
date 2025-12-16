<template>
  <div 
    class="empty-state text-center py-12"
    data-testid="empty-state"
  >
    <p class="text-gray-500 text-lg">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
}>(), {
  message: '查無結果'
})
</script>
