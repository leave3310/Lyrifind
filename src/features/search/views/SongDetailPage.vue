<template>
  <div class="song-detail-page max-w-4xl mx-auto px-4 py-8">
    <!-- 返回按鈕 -->
    <button
      data-testid="back-button"
      class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      @click="handleBack"
    >
      <span class="text-xl">←</span>
      <span>返回搜尋結果</span>
    </button>

    <!-- 載入指示器 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤訊息 -->
    <div 
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
      role="alert"
    >
      <p>{{ error }}</p>
      <button
        class="mt-2 text-sm underline hover:no-underline"
        @click="loadSong"
      >
        重試
      </button>
    </div>

    <!-- 歌曲詳細資訊 -->
    <div v-else-if="song" class="song-detail">
      <!-- 歌曲標題和歌手 -->
      <div class="mb-6">
        <h1 
          class="text-3xl font-bold text-gray-900 mb-2"
          data-testid="song-detail-title"
        >
          {{ song.title }}
        </h1>
        <p 
          class="text-xl text-gray-600"
          data-testid="song-detail-artist"
        >
          {{ song.artist }}
        </p>
      </div>

      <!-- 完整歌詞 -->
      <div 
        class="lyrics-container bg-gray-50 rounded-lg p-6"
        data-testid="song-detail-lyrics"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-4">歌詞</h2>
        <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {{ song.lyrics }}
        </div>
      </div>
    </div>

    <!-- 找不到歌曲 -->
    <div
      v-else
      class="text-center py-12"
      data-testid="song-not-found"
    >
      <p class="text-gray-500 text-lg">找不到此歌曲</p>
      <button
        class="mt-4 text-blue-500 hover:text-blue-700 underline"
        @click="handleBack"
      >
        返回搜尋結果
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchService } from '../services/searchService'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import type { Song } from '../types'

const route = useRoute()
const router = useRouter()

const song = ref<Song | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadSong = async () => {
  const songId = route.params.id as string
  
  if (!songId) {
    error.value = '無效的歌曲 ID'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    const result = await searchService.getSongById(songId)
    
    if (result) {
      song.value = result
    } else {
      error.value = '找不到此歌曲'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入歌曲失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadSong()
})
</script>
