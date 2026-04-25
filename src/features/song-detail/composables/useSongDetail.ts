// useSongDetail composable
// 負責載入歌曲資料、管理頁面狀態、讀取高亮關鍵字

import { ref, readonly, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { songService } from '../services/song.service'
import { highlightText } from '../utils/highlight-text'
import type { SongDetailView } from '../types/song-detail.types'

export function useSongDetail() {
  const route = useRoute()
  const router = useRouter()

  const state = ref<SongDetailView>({ status: 'loading' })

  const loadSong = async () => {
    const rawId = route.params.id

    // 驗證 route.params.id：需為非空字串
    if (!rawId || typeof rawId !== 'string') {
      state.value = { status: 'error', message: '無效的歌曲 ID' }
      return
    }

    // 讀取 highlight query：僅在為字串且非空時使用
    const rawHighlight = route.query.highlight
    const highlightKeyword =
      typeof rawHighlight === 'string' && rawHighlight.trim() !== '' ? rawHighlight : null

    state.value = { status: 'loading' }

    try {
      const result = await songService.getSongById(rawId)

      if (!result) {
        state.value = { status: 'error', message: '找不到此歌曲' }
        return
      }

      const highlightedLyrics = highlightKeyword
        ? highlightText(result.lyrics, highlightKeyword)
        : result.lyrics

      state.value = {
        status: 'loaded',
        song: result,
        highlightKeyword,
        highlightedLyrics
      }
    } catch (err) {
      console.error('[useSongDetail] load failed', err)
      const message = err instanceof Error ? err.message : '載入歌曲失敗，請稍後再試'
      state.value = { status: 'error', message }
    }
  }

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      void router.push('/')
    }
  }

  onMounted(() => {
    void loadSong()
  })

  return {
    state: readonly(state),
    goBack,
    loadSong
  }
}
