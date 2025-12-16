<template>
  <div 
    class="search-results"
    data-testid="search-results"
  >
    <div v-if="results.length > 0" class="results-list">
      <ResultItem
        v-for="item in results"
        :key="item.song.id"
        :item="item"
      />
    </div>
    
    <EmptyState v-else message="查無結果" />
  </div>
</template>

<script setup lang="ts">
import type { SearchResultItem } from '../types'
import ResultItem from './SearchResultItem.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

defineProps<{
  results: SearchResultItem[]
}>()
</script>
