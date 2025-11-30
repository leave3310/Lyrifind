/**
 * LyricsDetail 元件單元測試
 * @description 測試歌詞詳細頁元件的行為
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LyricsDetail from '../components/LyricsDetail.vue'
import type { Song } from '@/shared/types'

/** 測試用歌曲資料 */
const mockSong: Song = {
  id: '1',
  title: '測試歌曲',
  artist: '測試歌手',
  lyrics: '這是第一行歌詞\n這是第二行歌詞\n這是第三行歌詞',
}

describe('LyricsDetail', () => {
  it('應該顯示歌曲名稱', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: mockSong,
        loading: false,
      },
    })
    
    const title = wrapper.find('[data-testid="lyrics-title"]')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('測試歌曲')
  })

  it('應該顯示歌手名稱', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: mockSong,
        loading: false,
      },
    })
    
    const artist = wrapper.find('[data-testid="lyrics-artist"]')
    expect(artist.exists()).toBe(true)
    expect(artist.text()).toBe('測試歌手')
  })

  it('應該顯示歌詞內容', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: mockSong,
        loading: false,
      },
    })
    
    const content = wrapper.find('[data-testid="lyrics-content"]')
    expect(content.exists()).toBe(true)
    expect(content.text()).toContain('這是第一行歌詞')
  })

  it('應該渲染返回按鈕', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: mockSong,
        loading: false,
      },
    })
    
    const backButton = wrapper.find('[data-testid="back-button"]')
    expect(backButton.exists()).toBe(true)
  })

  it('點擊返回按鈕應觸發 back 事件', async () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: mockSong,
        loading: false,
      },
    })
    
    const backButton = wrapper.find('[data-testid="back-button"]')
    await backButton.trigger('click')
    
    expect(wrapper.emitted('back')).toBeTruthy()
  })

  it('載入中應顯示載入指示器', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: null,
        loading: true,
      },
    })
    
    const spinner = wrapper.find('[data-testid="loading-spinner"]')
    expect(spinner.exists()).toBe(true)
  })

  it('載入中不應顯示歌詞內容', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: null,
        loading: true,
      },
    })
    
    const content = wrapper.find('[data-testid="lyrics-content"]')
    expect(content.exists()).toBe(false)
  })

  it('歌曲不存在時應顯示錯誤訊息', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: null,
        loading: false,
        error: {
          code: 'NOT_FOUND' as const,
          message: '找不到指定的歌曲',
          retryable: false,
        },
      },
    })
    
    const errorMessage = wrapper.find('[data-testid="not-found-message"]')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toContain('找不到')
  })

  it('歌詞應保留換行格式', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: mockSong,
        loading: false,
      },
    })
    
    const content = wrapper.find('[data-testid="lyrics-content"]')
    // 驗證使用 whitespace-pre-line 或 br 標籤保留換行
    expect(content.html()).toMatch(/whitespace-pre-line|<br/i)
  })

  it('錯誤可重試時應顯示重試按鈕', () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: null,
        loading: false,
        error: {
          code: 'NETWORK_ERROR' as const,
          message: '網路連線失敗',
          retryable: true,
        },
      },
    })
    
    const retryButton = wrapper.find('[data-testid="retry-button"]')
    expect(retryButton.exists()).toBe(true)
  })

  it('點擊重試按鈕應觸發 retry 事件', async () => {
    const wrapper = mount(LyricsDetail, {
      props: {
        song: null,
        loading: false,
        error: {
          code: 'NETWORK_ERROR' as const,
          message: '網路連線失敗',
          retryable: true,
        },
      },
    })
    
    const retryButton = wrapper.find('[data-testid="retry-button"]')
    await retryButton.trigger('click')
    
    expect(wrapper.emitted('retry')).toBeTruthy()
  })
})
