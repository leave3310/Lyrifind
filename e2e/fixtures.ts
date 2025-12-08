/**
 * E2E 測試的 Mock 資料與輔助函式
 */

import { Page } from '@playwright/test'

// Mock 搜尋結果資料
export const mockSearchResults = {
  海闊天空: {
    data: [
      { id: '1', artist: 'Beyond', title: '海闊天空' },
      { id: '2', artist: 'Beyond', title: '海闊天空 (Live)' },
    ],
    total: 2,
  },
  Beyond: {
    data: [
      { id: '1', artist: 'Beyond', title: '海闊天空' },
      { id: '3', artist: 'Beyond', title: '光輝歲月' },
      { id: '4', artist: 'Beyond', title: '真的愛你' },
    ],
    total: 3,
  },
  原諒我這一生不羈放縱愛自由: {
    data: [
      { id: '1', artist: 'Beyond', title: '海闊天空' },
    ],
    total: 1,
  },
  測試: {
    data: [
      { id: '1', artist: 'Beyond', title: '海闊天空' },
    ],
    total: 1,
  },
}

// Mock 歌詞詳情資料
export const mockLyricsData: Record<string, any> = {
  '1': {
    id: '1',
    artist: 'Beyond',
    title: '海闊天空',
    lyrics: `今天我 寒夜裡看雪飄過
懷著冷卻了的心窩漂遠方
風雨裡追趕 霧裡分不清影蹤
天空海闊你與我 可會變(誰沒在變)

多少次 迎著冷眼與嘲笑
從沒有放棄過心中的理想
一剎那恍惚 若有所失的感覺
不知不覺已變淡 心裡愛(誰明白我)

原諒我這一生不羈放縱愛自由
也會怕有一天會跌倒 oh no
背棄了理想 誰人都可以
哪會怕有一天只你共我`,
  },
  '2': {
    id: '2',
    artist: 'Beyond',
    title: '海闊天空 (Live)',
    lyrics: '(Live 版本歌詞)',
  },
  '3': {
    id: '3',
    artist: 'Beyond',
    title: '光輝歲月',
    lyrics: '鐘聲響起歸家的訊號...',
  },
}

/**
 * 設定搜尋 API 的 mock
 */
export async function mockSearchAPI(page: Page) {
  // 使用回調函式來精確判斷是否為 API 請求
  await page.route(url => {
    const urlString = typeof url === 'string' ? url : url.toString()
    const isAPIRequest = urlString.includes('/api') && (urlString.includes('action=search') || urlString.includes('action=get'))
    return isAPIRequest
  }, async (route) => {
    const url = new URL(route.request().url())
    const action = url.searchParams.get('action')
    
    if (action === 'search') {
      const query = url.searchParams.get('q') || ''
      
      // 根據查詢關鍵字返回對應的 mock 資料
      let responseData = { data: [], total: 0 }
      
      for (const [key, value] of Object.entries(mockSearchResults)) {
        if (query.includes(key)) {
          responseData = value
          break
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      })
    } else if (action === 'get') {
      const id = url.searchParams.get('id') || ''
      
      const songData = mockLyricsData[id]
      
      if (songData) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(songData),
        })
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: '找不到此歌曲' }),
        })
      }
    }
  })
}

/**
 * 設定歌詞詳情 API 的 mock
 */
export async function mockLyricsAPI(_page: Page) {
  // 已整合至 mockSearchAPI
}

/**
 * 設定所有 API mocks
 */
export async function setupAPIMocks(page: Page) {
  await mockSearchAPI(page)
}
