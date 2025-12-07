<template>
  <div class="space-y-6">
    <button
      @click="goBack"
      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      ← 返回搜尋結果
    </button>

    <div class="bg-white rounded-lg shadow p-6">
      <SongHeader :song="song" :is-loading="isLoading" />
      <LyricsContent :song="song" :is-loading="isLoading" />
    </div>

    <ErrorMessage v-if="error" :message="error" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SongHeader from '../components/SongHeader.vue'
import LyricsContent from '../components/LyricsContent.vue'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'

const router = useRouter()
const song = ref(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

function goBack() {
  router.back()
}
</script>
