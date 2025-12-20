<template>
  <section 
    class="search-results"
    data-testid="search-results"
    role="region"
    aria-label="搜尋結果"
  >
    <div v-if="results.length > 0" class="results-list">
      <p class="sr-only">找到 {{ results.length }} 筆結果</p>
      <ResultItem
        v-for="item in results"
        :key="item.song.id"
        :item="item"
      />
    </div>
    
    <EmptyState v-else message="查無結果" role="status" aria-live="polite" />
  </section>
</template>

<script setup lang="ts">
import type { SearchResultItem } from '../types'
import ResultItem from './SearchResultItem.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

defineProps<{
  results: SearchResultItem[]
}>()
</script>
