<template>
  <div class="space-y-4 sm:space-y-6">
    <button
      @click="goBack"
      class="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
    >
      ← 返回搜尋結果
    </button>

    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
      <SongHeader :song="song" :is-loading="isLoading" />
      <LyricsContent :song="song" :is-loading="isLoading" />
    </div>

    <ErrorMessage
      v-if="error"
      :message="error?.message || '載入歌詞失敗'"
      :on-retry="refetch"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SongHeader from '../components/SongHeader.vue'
import LyricsContent from '../components/LyricsContent.vue'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'
import { useLyrics } from '../composables/useLyrics'

const router = useRouter()

interface Props {
  id: string
}

const props = defineProps<Props>()

const { song, isLoading, error, refetch } = useLyrics(props.id)

function goBack() {
  router.back()
}
</script>
