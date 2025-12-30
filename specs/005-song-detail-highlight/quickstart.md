# Quickstart Guide: 歌曲詳細頁與歌詞高亮顯示

**Feature**: 005-song-detail-highlight  
**Date**: 2025-12-28  
**Target Audience**: 開發者

本指南提供快速實作本功能的步驟，包含開發環境設定、測試優先流程和關鍵實作要點。

---

## 📋 前置需求

1. ✅ 已完成 `004-lyrics-search` 功能（搜尋結果頁面已實作）
2. ✅ 已安裝專案相依套件：
   ```bash
   pnpm install
   ```
3. ✅ 已理解 Feature-Based 架構（參考 Constitution VI）
4. ✅ 已閱讀以下文件：
   - [spec.md](./spec.md) - 功能規格
   - [data-model.md](./data-model.md) - 資料模型
   - [research.md](./research.md) - 技術研究

---

## 🚀 開發流程概覽（測試優先）

```
Step 1: 撰寫 E2E 測試（Playwright）🔴
   ↓
Step 2: 執行測試確認失敗 🔴
   ↓
Step 3: 撰寫單元測試（Vitest）🔴
   ↓
Step 4: 執行測試確認失敗 🔴
   ↓
Step 5: 實作功能程式碼 ✍️
   ↓
Step 6: 執行測試確認通過 🟢
   ↓
Step 7: 重構與優化 ♻️
   ↓
Step 8: 提交 Pull Request 📤
```

---

## Step 1: 建立功能目錄結構與設定環境變數

```bash
# 建立歌曲詳細頁功能目錄
mkdir -p src/features/song-detail/{components,composables,services,utils,types,__tests__}

# 建立 E2E 測試檔案
touch e2e/song-detail.spec.ts
```

**目錄結構**：
```
src/features/song-detail/
├── components/
│   ├── SongHeader.vue          # 待建立
│   ├── LyricsContent.vue       # 待建立
│   └── BackButton.vue          # 待建立
├── composables/
│   ├── useSongDetail.ts        # 待建立（含 API 呼叫）
│   ├── useLyricsHighlight.ts   # 待建立
│   └── useAutoScroll.ts        # 待建立
├── services/
│   └── songService.ts          # 待建立（Google Apps Script API 整合）
├── utils/
│   ├── highlightText.ts        # 待建立
│   └── escapeRegex.ts          # 待建立
├── types/
│   └── song-detail.types.ts    # 待建立
├── __tests__/
│   ├── SongDetailPage.spec.ts         # 待建立
│   ├── useLyricsHighlight.spec.ts     # 待建立
│   ├── useSongDetail.spec.ts          # 待建立
│   └── highlightText.spec.ts          # 待建立
└── SongDetailPage.vue          # 待建立
```

**設定環境變數**（`.env.local`）：
```bash
# Google Apps Script Web App URL（與 004-lyrics-search 共用）
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec
```

**取得 SCRIPT_ID**：
1. 開啟 Google Sheets → 工具 → 指令碼編輯器
2. 部署 → 管理部署 → 複製「網頁應用程式網址」
3. 貼到 `.env.local` 檔案

**驗證 API 可用性**：
```bash
# 測試 getSong API（應返回歌曲 JSON）
curl "https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec?action=getSong&id=song-001"
```

---

## Step 1.5: 建立 API Service（先實作再測試）

**檔案**: `src/features/song-detail/services/songService.ts`

```typescript
import type { Song } from '@/shared/types/common.types'

/**
 * 歌曲 API 服務
 * 負責與 Google Apps Script 後端通訊
 */
export class SongService {
  private readonly baseUrl: string
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_APPS_SCRIPT_URL
    
    if (!this.baseUrl) {
      throw new Error('VITE_APPS_SCRIPT_URL 環境變數未設定')
    }
  }
  
  /**
   * 根據 ID 取得歌曲詳情
   * @param id - 歌曲 ID
   * @returns 歌曲物件，若不存在則回傳 null
   */
  async getSongById(id: string): Promise<Song | null> {
    const params = new URLSearchParams({
      action: 'getSong',
      id: id
    })
    
    const url = `${this.baseUrl}?${params.toString()}`
    
    try {
      const response = await fetch(url)
      
      if (response.status === 404) {
        return null // 歌曲不存在
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || '取得歌曲失敗')
      }
      
      return response.json()
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`載入歌曲失敗：${error.message}`)
      }
      throw new Error('載入歌曲失敗，請稍後再試')
    }
  }
  
  validateSongId(id: string): boolean {
    return /^song-\d+$/.test(id)
  }
}

export const songService = new SongService()
```

**參考文件**：完整 API 整合指南請見 [contracts/api-integration.md](./contracts/api-integration.md)

---

## Step 2: 撰寫 E2E 測試（User Story 1 - P1）

**檔案**: `e2e/song-detail.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('歌曲詳細頁功能', () => {
  test('應能從搜尋結果進入歌曲詳細頁', async ({ page }) => {
    // 前往搜尋頁面
    await page.goto('/')
    
    // 搜尋歌曲
    await page.fill('[data-testid="search-input"]', '青花瓷')
    
    // 等待搜尋結果載入
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 點擊第一個搜尋結果
    await page.click('[data-testid="search-result-item"]:first-child')
    
    // 驗證已導航到詳細頁
    await expect(page).toHaveURL(/\/song\/[^/]+/)
    
    // 驗證顯示歌曲資訊
    await expect(page.locator('[data-testid="song-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="song-artist"]')).toBeVisible()
    await expect(page.locator('[data-testid="song-lyrics"]')).toBeVisible()
  })
  
  test('應提供返回按鈕並保持搜尋狀態', async ({ page }) => {
    // ... (實作返回功能測試)
  })
})
```

**執行測試（應失敗 🔴）**：
```bash
pnpm run test:e2e
```

---

## Step 3: 撰寫單元測試（歌詞高亮工具函式）

**檔案**: `src/features/song-detail/__tests__/highlightText.spec.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { highlightText, escapeRegex } from '../utils/highlightText'

describe('highlightText', () => {
  it('應高亮所有匹配的關鍵字', () => {
    const text = '我愛你，你愛我'
    const keyword = '愛'
    const result = highlightText(text, keyword)
    
    expect(result).toContain('<mark class="bg-yellow-200 font-bold">愛</mark>')
    // 驗證兩個「愛」字都被高亮
    const matches = result.match(/<mark class="bg-yellow-200 font-bold">愛<\/mark>/g)
    expect(matches).toHaveLength(2)
  })
  
  it('應正確處理特殊字元', () => {
    const text = '問號? 星號*'
    const keyword = '?'
    const result = highlightText(text, keyword)
    
    expect(result).toContain('<mark class="bg-yellow-200 font-bold">?</mark>')
  })
  
  it('應不區分大小寫（若支援英文）', () => {
    const text = 'Love love LOVE'
    const keyword = 'love'
    const result = highlightText(text, keyword)
    
    const matches = result.match(/<mark class="bg-yellow-200 font-bold">[Ll][Oo][Vv][Ee]<\/mark>/g)
    expect(matches).toHaveLength(3)
  })
})

describe('escapeRegex', () => {
  it('應轉義正則特殊字元', () => {
    expect(escapeRegex('.*+?^${}()|[]')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]')
  })
})
```

**執行測試（應失敗 🔴）**：
```bash
pnpm run test
```

---

## Step 4: 實作工具函式（使測試通過 🟢）

**檔案**: `src/features/song-detail/utils/highlightText.ts`

```typescript
/**
 * 轉義正則表達式特殊字元
 * @param text - 要轉義的文字
 * @returns 轉義後的文字
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 在文字中高亮所有匹配關鍵字
 * @param text - 原始文字
 * @param keyword - 要高亮的關鍵字
 * @returns 包含 <mark> 標籤的 HTML 字串
 */
export function highlightText(text: string, keyword: string): string {
  const escapedKeyword = escapeRegex(keyword)
  const regex = new RegExp(escapedKeyword, 'gi')
  
  return text.replace(regex, (match) => {
    return `<mark class="bg-yellow-200 font-bold">${match}</mark>`
  })
}
```

**執行測試確認通過 🟢**：
```bash
pnpm run test
```

---

## Step 5: 實作 Composable（useLyricsHighlight）

**檔案**: `src/features/song-detail/__tests__/useLyricsHighlight.spec.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useLyricsHighlight } from '../composables/useLyricsHighlight'

describe('useLyricsHighlight', () => {
  it('應在有高亮關鍵字時返回高亮歌詞', () => {
    const lyrics = ref('我愛你')
    const keyword = ref('愛')
    
    const { highlightedLyrics, hasHighlight } = useLyricsHighlight(lyrics, keyword)
    
    expect(hasHighlight.value).toBe(true)
    expect(highlightedLyrics.value).toContain('<mark class="bg-yellow-200 font-bold">愛</mark>')
  })
  
  it('應在無高亮關鍵字時返回原始歌詞', () => {
    const lyrics = ref('我愛你')
    const keyword = ref(null)
    
    const { highlightedLyrics, hasHighlight } = useLyricsHighlight(lyrics, keyword)
    
    expect(hasHighlight.value).toBe(false)
    expect(highlightedLyrics.value).toBe('我愛你')
  })
})
```

**實作**：`src/features/song-detail/composables/useLyricsHighlight.ts`

```typescript
import { computed, type Ref, type ComputedRef } from 'vue'
import { highlightText } from '../utils/highlightText'

export interface UseLyricsHighlightReturn {
  highlightedLyrics: ComputedRef<string>
  hasHighlight: ComputedRef<boolean>
}

export function useLyricsHighlight(
  lyrics: Ref<string>,
  keyword: Ref<string | null>
): UseLyricsHighlightReturn {
  const hasHighlight = computed(() => keyword.value !== null && keyword.value.length > 0)
  
  const highlightedLyrics = computed(() => {
    if (!hasHighlight.value || !keyword.value) {
      return lyrics.value
    }
    
    return highlightText(lyrics.value, keyword.value)
  })
  
  return {
    highlightedLyrics,
    hasHighlight
  }
}
```

---

## Step 6: 新增 Vue Router 路由

**檔案**: `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ... 現有路由
    {
      path: '/song/:id',
      name: 'song-detail',
      component: () => import('@/features/song-detail/SongDetailPage.vue'),
      props: (route) => ({
        id: route.params.id,
        highlightKeyword: route.query.highlight || null
      })
    }
  ]
})

export default router
```

---

## Step 7: 實作主元件（SongDetailPage.vue）

**檔案**: `src/features/song-detail/SongDetailPage.vue`

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTitle } from '@vueuse/core'
import { useSongDetail } from './composables/useSongDetail'
import { useLyricsHighlight } from './composables/useLyricsHighlight'
import { useAutoScroll } from './composables/useAutoScroll'
import SongHeader from './components/SongHeader.vue'
import LyricsContent from './components/LyricsContent.vue'
import BackButton from './components/BackButton.vue'

const route = useRoute()
const router = useRouter()

const songId = computed(() => route.params.id as string)
const highlightKeyword = computed(() => {
  const keyword = route.query.highlight
  return typeof keyword === 'string' ? keyword : null
})

const { song, isLoading, error } = useSongDetail(songId)
const { highlightedLyrics, hasHighlight } = useLyricsHighlight(
  computed(() => song.value?.lyrics || ''),
  highlightKeyword
)

useAutoScroll(hasHighlight)

// 動態頁面標題
useTitle(computed(() => 
  song.value ? `${song.value.title} - ${song.value.artist}` : 'LyriFind'
))

function goBack() {
  router.back()
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <BackButton @click="goBack" />
    
    <div v-if="isLoading" class="text-center py-12">
      載入中...
    </div>
    
    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>
    
    <div v-else-if="song">
      <SongHeader :title="song.title" :artist="song.artist" />
      <LyricsContent 
        :lyrics="highlightedLyrics" 
        :has-highlight="hasHighlight" 
      />
    </div>
  </div>
</template>
```

---

## Step 8: 執行完整測試

```bash
# 執行單元測試
pnpm run test

# 執行 E2E 測試
pnpm run test:e2e

# 執行程式碼檢查
pnpm run lint
```

**確認所有測試通過 🟢**

---

## 🎯 關鍵實作重點

### 1. 型別定義位置

```typescript
// src/shared/types/common.types.ts - Song 型別（共用）
export interface Song { /* ... */ }

// src/features/song-detail/types/song-detail.types.ts - 本功能型別
export interface SongDetailView { /* ... */ }
```

### 2. URL 狀態管理

```typescript
// 從搜尋結果跳轉（SearchResultItem.vue）
router.push({
  name: 'song-detail',
  params: { id: song.id },
  query: { highlight: searchQuery }  // 傳遞高亮關鍵字
})

// 在詳細頁讀取（SongDetailPage.vue）
const highlightKeyword = computed(() => {
  const keyword = route.query.highlight
  return typeof keyword === 'string' ? keyword : null
})
```

### 3. 高亮樣式（Tailwind CSS）

```html
<mark class="bg-yellow-200 font-bold">匹配文字</mark>
```

### 4. 自動捲動（useAutoScroll）

```typescript
import { onMounted, nextTick } from 'vue'

export function useAutoScroll(hasHighlight: Ref<boolean>) {
  onMounted(async () => {
    if (!hasHighlight.value) return
    
    await nextTick()  // 等待 DOM 渲染
    
    const firstMark = document.querySelector('mark')
    if (firstMark) {
      firstMark.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}
```

---

## 📦 Git Commit 規範

遵循 Conventional Commits v1.0.0（Constitution VII）：

```bash
# 範例 commits
git commit -m "test(song-detail): 新增歌詞高亮 E2E 測試"
git commit -m "feat(song-detail): 實作 highlightText 工具函式"
git commit -m "feat(song-detail): 實作 useLyricsHighlight composable"
git commit -m "feat(song-detail): 新增歌曲詳細頁元件"
git commit -m "feat(router): 新增 /song/:id 路由"
```

---

## 🐛 常見問題排解

### 問題 1：測試中找不到型別定義

**解決方案**：確認 `tsconfig.json` 包含正確的路徑別名：
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 問題 2：E2E 測試無法找到 data-testid

**解決方案**：確保所有可測試元素都有 `data-testid` 屬性：
```vue
<div data-testid="song-title">{{ title }}</div>
```

### 問題 3：高亮顯示不生效

**解決方案**：
1. 確認使用 `v-html` 渲染高亮歌詞
2. 檢查 Tailwind CSS 的 `bg-yellow-200` 類別是否正確載入

---

## 📚 延伸閱讀

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue Router 4](https://router.vuejs.org/)
- [VueUse](https://vueuse.org/)
- [Playwright Testing](https://playwright.dev/)
- [Vitest](https://vitest.dev/)
- [Constitution](/.specify/memory/constitution.md) - 專案憲章

---

## ✅ Checklist

開發前確認：
- [ ] 已閱讀 spec.md, data-model.md, research.md
- [ ] 已理解 Feature-Based 架構
- [ ] 已設定開發環境

開發中確認（測試優先）：
- [ ] E2E 測試已撰寫且失敗 🔴
- [ ] 單元測試已撰寫且失敗 🔴
- [ ] 功能程式碼已實作且測試通過 🟢
- [ ] 程式碼符合 Constitution 規範
- [ ] 所有註解使用正體中文

開發後確認：
- [ ] 所有測試通過（單元測試 + E2E 測試）
- [ ] OxLint 檢查通過（零錯誤、零警告）
- [ ] 已提交 Pull Request 並等待審查
