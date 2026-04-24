// useSongDetail composable
// 負責載入歌曲資料、管理頁面狀態、讀取高亮關鍵字

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { songService } from '../services/song.service'
import type { Song } from '@/shared/types/common.types'

export function useSongDetail() {
  const route = useRoute()
  const router = useRouter()

  const song = ref<Song | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // 從 URL query parameter 讀取高亮關鍵字
  const highlightKeyword = computed<string | null>(() => {
    const raw = route.query.highlight
    if (typeof raw !== 'string' || raw.trim() === '') return null
    return raw
  })

  const loadSong = async () => {
    const songId = route.params.id as string

    if (!songId) {
      error.value = '無效的歌曲 ID'
      isLoading.value = false
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const result = await songService.getSongById(songId)

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

  const goBack = () => {
    router.back()
  }

  onMounted(() => {
    void loadSong()
  })

  return {
    song,
    isLoading,
    error,
    highlightKeyword,
    goBack,
    loadSong
  }
}
