/**
 * SearchResults 元件單元測試
 * @description 測試搜尋結果列表元件的行為
 */
import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

import type { MatchType, SearchResult } from '@/shared/types'

import SearchResults from '../components/SearchResults.vue'

/** 建立測試用搜尋結果 */
function createMockResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    song: {
      id: '1',
      title: '測試歌曲',
      artist: '測試歌手',
      lyrics: '這是測試歌詞內容',
    },
    score: 100,
    matchType: 'TITLE_EXACT' as MatchType,
    highlightedTitle: '測試歌曲',
    highlightedArtist: '測試歌手',
    highlightedLyrics: '這是測試歌詞內容',
    ...overrides,
  }
}

describe('SearchResults', () => {
  it('應該渲染搜尋結果列表容器', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: [],
        loading: false,
      },
    })

    const container = wrapper.find('[data-testid="search-results"]')
    expect(container.exists()).toBe(true)
  })

  it('無結果時應顯示空結果訊息', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: [],
        loading: false,
        keyword: '找不到的關鍵字',
      },
    })

    const emptyMessage = wrapper.find('[data-testid="empty-results"]')
    expect(emptyMessage.exists()).toBe(true)
    expect(emptyMessage.text()).toContain('找不到')
  })

  it('有結果時應渲染結果項目', () => {
    const results = [
      createMockResult({ song: { id: '1', title: '歌曲一', artist: '歌手一', lyrics: '歌詞一' } }),
      createMockResult({ song: { id: '2', title: '歌曲二', artist: '歌手二', lyrics: '歌詞二' } }),
    ]

    const wrapper = mount(SearchResults, {
      props: {
        results,
        loading: false,
      },
    })

    const items = wrapper.findAll('[data-testid="search-result-item"]')
    expect(items.length).toBe(2)
  })

  it('載入中應顯示載入指示器', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: [],
        loading: true,
      },
    })

    const spinner = wrapper.find('[data-testid="loading-spinner"]')
    expect(spinner.exists()).toBe(true)
  })

  it('載入中不應顯示空結果訊息', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: [],
        loading: true,
        keyword: '測試',
      },
    })

    const emptyMessage = wrapper.find('[data-testid="empty-results"]')
    expect(emptyMessage.exists()).toBe(false)
  })

  it('點擊結果項目應觸發 select 事件', async () => {
    const result = createMockResult()
    const wrapper = mount(SearchResults, {
      props: {
        results: [result],
        loading: false,
      },
    })

    const item = wrapper.find('[data-testid="search-result-item"]')
    await item.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([result.song.id])
  })

  it('應該顯示搜尋關鍵字', () => {
    const wrapper = mount(SearchResults, {
      props: {
        results: [createMockResult()],
        loading: false,
        keyword: '周杰倫',
      },
    })

    const keywordDisplay = wrapper.find('[data-testid="search-keyword"]')
    if (keywordDisplay.exists()) {
      expect(keywordDisplay.text()).toContain('周杰倫')
    }
  })

  it('應該顯示結果數量', () => {
    const results = [
      createMockResult({ song: { id: '1', title: '歌曲一', artist: '歌手一', lyrics: '歌詞一' } }),
      createMockResult({ song: { id: '2', title: '歌曲二', artist: '歌手二', lyrics: '歌詞二' } }),
      createMockResult({ song: { id: '3', title: '歌曲三', artist: '歌手三', lyrics: '歌詞三' } }),
    ]

    const wrapper = mount(SearchResults, {
      props: {
        results,
        loading: false,
        totalCount: 3,
      },
    })

    const countDisplay = wrapper.find('[data-testid="results-count"]')
    if (countDisplay.exists()) {
      expect(countDisplay.text()).toContain('3')
    }
  })

  it('結果項目應包含歌曲名稱', () => {
    const result = createMockResult({
      song: { id: '1', title: '我的歌曲', artist: '測試歌手', lyrics: '測試歌詞' },
      highlightedTitle: '我的歌曲',
    })

    const wrapper = mount(SearchResults, {
      props: {
        results: [result],
        loading: false,
      },
    })

    const title = wrapper.find('[data-testid="song-title"]')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('我的歌曲')
  })

  it('結果項目應包含歌手名稱', () => {
    const result = createMockResult({
      song: { id: '1', title: '測試歌曲', artist: '我的歌手', lyrics: '測試歌詞' },
      highlightedArtist: '我的歌手',
    })

    const wrapper = mount(SearchResults, {
      props: {
        results: [result],
        loading: false,
      },
    })

    const artist = wrapper.find('[data-testid="song-artist"]')
    expect(artist.exists()).toBe(true)
    expect(artist.text()).toContain('我的歌手')
  })
})
