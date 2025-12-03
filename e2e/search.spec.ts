/**
 * 搜尋功能 E2E 測試
 * @description 測試搜尋輸入、結果顯示、空結果處理
 */
import { type Page, expect, test } from '@playwright/test'

import { TEST_CONSTANTS, mockSongs } from './fixtures'

/** 模擬 Apps Script API 回應 */
async function mockAppsScriptApi(page: Page) {
  await page.route('**/script.google.com/**', async (route) => {
    const mockResponse = mockSongs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      lyrics: song.lyrics,
    }))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    })
  })
}

test.describe('搜尋功能', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppsScriptApi(page)
  })

  test('應該顯示搜尋輸入框', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 驗證搜尋輸入框存在
    const searchInput = page.getByTestId('search-input')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('placeholder')
  })

  test('應該顯示搜尋按鈕', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 驗證搜尋按鈕存在
    const searchButton = page.getByTestId('search-button')
    await expect(searchButton).toBeVisible()
  })

  test('輸入歌名並搜尋應顯示結果', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 輸入搜尋關鍵字
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('小幸運')

    // 點擊搜尋按鈕
    const searchButton = page.getByTestId('search-button')
    await searchButton.click()

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 驗證搜尋結果存在
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    // 驗證至少有一筆結果
    const resultItems = page.getByTestId('search-result-item')
    await expect(resultItems.first()).toBeVisible()
  })

  test('按下 Enter 鍵應觸發搜尋', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 輸入搜尋關鍵字並按 Enter
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('告白氣球')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 驗證搜尋結果存在
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()
  })

  test('搜尋無結果時應顯示提示訊息', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 輸入不存在的關鍵字
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('不存在的歌曲名稱測試')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 驗證顯示無結果訊息
    const emptyMessage = page.getByTestId('empty-results')
    await expect(emptyMessage).toBeVisible()
    await expect(emptyMessage).toContainText('找不到')
  })

  test('搜尋關鍵字過短應顯示錯誤訊息', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 輸入過短的關鍵字
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('a')

    // 點擊搜尋按鈕
    const searchButton = page.getByTestId('search-button')
    await searchButton.click()

    // 驗證顯示錯誤訊息
    const errorMessage = page.getByTestId('validation-error')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('至少')
  })

  test('搜尋關鍵字為空時應顯示錯誤訊息', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 不輸入任何內容直接點擊搜尋
    const searchButton = page.getByTestId('search-button')
    await searchButton.click()

    // 驗證顯示錯誤訊息
    const errorMessage = page.getByTestId('validation-error')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('輸入')
  })

  test('搜尋結果應顯示歌曲名稱和歌手名稱', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋周杰倫
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('周杰倫')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 驗證結果項目包含歌曲名稱和歌手名稱
    const firstResult = page.getByTestId('search-result-item').first()
    await expect(firstResult).toBeVisible()

    const songTitle = firstResult.getByTestId('song-title')
    const songArtist = firstResult.getByTestId('song-artist')
    await expect(songTitle).toBeVisible()
    await expect(songArtist).toBeVisible()
  })

  test('搜尋過程中應顯示載入狀態', async ({ page }) => {
    // 設置延遲的 API 回應
    await page.route('**/script.google.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockResponse = mockSongs.map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        lyrics: song.lyrics,
      }))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      })
    })

    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 輸入搜尋關鍵字並搜尋
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('周杰倫')
    await searchInput.press('Enter')

    // 驗證載入狀態顯示
    const loadingSpinner = page.getByTestId('loading-spinner')
    await expect(loadingSpinner).toBeVisible()

    // 等待載入完成
    await expect(loadingSpinner).toBeHidden({ timeout: 5000 })
  })

  test('搜尋應不分大小寫', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 使用小寫搜尋
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('jay')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 應該能找到結果（如果有英文歌曲資料）
    // 此處主要測試功能不會因大小寫而失敗
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()
  })
})

// ============================================================
// User Story 2: 歌手名稱搜尋
// ============================================================

test.describe('歌手名稱搜尋 (US2)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppsScriptApi(page)
  })

  test('輸入歌手名稱應顯示該歌手的所有歌曲', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌手名稱「周杰倫」
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('周杰倫')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 驗證搜尋結果存在
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    // 驗證結果數量（周杰倫有 2 首歌：告白氣球、稻香）
    const resultItems = page.getByTestId('search-result-item')
    await expect(resultItems).toHaveCount(2)
  })

  test('歌手搜尋結果應清楚顯示歌手名稱', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌手名稱
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('田馥甄')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證結果項目中顯示歌手名稱
    const firstResult = page.getByTestId('search-result-item').first()
    const artistName = firstResult.getByTestId('song-artist')
    await expect(artistName).toBeVisible()
    await expect(artistName).toContainText('田馥甄')
  })

  test('歌手搜尋應支援部分匹配', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 只輸入部分歌手名稱
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('周杰')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 應該能找到周杰倫的歌曲
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    const resultItems = page.getByTestId('search-result-item')
    await expect(resultItems.first()).toBeVisible()
  })

  test('歌手搜尋結果應顯示匹配類型標籤', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌手名稱
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('王心凌')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證結果顯示「歌手匹配」標籤
    const matchBadge = page.getByTestId('match-type-badge').first()
    await expect(matchBadge).toBeVisible()
    await expect(matchBadge).toContainText('歌手')
  })

  test('搜尋不存在的歌手應顯示無結果訊息', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋不存在的歌手
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('不存在的歌手名字')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證顯示無結果訊息
    const emptyResults = page.getByTestId('empty-results')
    await expect(emptyResults).toBeVisible()
    await expect(emptyResults).toContainText('找不到')
  })

  test('歌手搜尋結果點擊應導航至歌詞詳情頁', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌手名稱
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('周杰倫')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 點擊第一個結果
    const firstResult = page.getByTestId('search-result-item').first()
    await firstResult.click()

    // 驗證導航至歌詞詳情頁
    await expect(page).toHaveURL(/\/lyrics\//)
  })
})

// ============================================================
// User Story 3: 歌詞片段搜尋
// ============================================================

test.describe('歌詞片段搜尋 (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppsScriptApi(page)
  })

  test('輸入歌詞片段應找到對應歌曲', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌詞片段
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('雨滴落在青青草地')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 驗證搜尋結果存在
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    // 驗證找到小幸運
    const resultItems = page.getByTestId('search-result-item')
    await expect(resultItems.first()).toBeVisible()
  })

  test('歌詞搜尋結果應顯示匹配的歌詞片段', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌詞片段
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('塞納河畔')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證結果項目中顯示歌詞片段
    const firstResult = page.getByTestId('search-result-item').first()
    const lyricsSnippet = firstResult.getByTestId('result-lyrics-snippet')
    await expect(lyricsSnippet).toBeVisible()
  })

  test('歌詞搜尋結果應高亮顯示關鍵字', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌詞片段
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('雨滴')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證歌詞片段中包含高亮標記
    const lyricsSnippet = page.getByTestId('result-lyrics-snippet').first()
    await expect(lyricsSnippet).toBeVisible()

    // 驗證高亮標記存在
    const highlightMark = lyricsSnippet.locator('mark')
    await expect(highlightMark).toBeVisible()
  })

  test('歌詞搜尋結果應顯示「歌詞匹配」標籤', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌詞片段
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('茫茫人海')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證結果顯示「歌詞匹配」標籤
    const matchBadge = page.getByTestId('match-type-badge').first()
    await expect(matchBadge).toBeVisible()
    await expect(matchBadge).toContainText('歌詞')
  })

  test('歌詞搜尋應支援部分匹配', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 只輸入部分歌詞
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('咖啡')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 應該能找到告白氣球
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    const resultItems = page.getByTestId('search-result-item')
    await expect(resultItems.first()).toBeVisible()
  })

  test('搜尋不存在的歌詞應顯示無結果訊息', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋不存在的歌詞
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('這段歌詞絕對不存在xyz')
    await searchInput.press('Enter')

    // 等待導航
    await page.waitForURL(/\/search\?q=/)

    // 驗證顯示無結果訊息
    const emptyResults = page.getByTestId('empty-results')
    await expect(emptyResults).toBeVisible()
    await expect(emptyResults).toContainText('找不到')
  })

  test('歌詞搜尋結果點擊應導航至歌詞詳情頁', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌詞片段
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('雨滴')
    await searchInput.press('Enter')

    // 等待導航至搜尋結果頁
    await page.waitForURL(/\/search\?q=/)

    // 點擊第一個結果
    const firstResult = page.getByTestId('search-result-item').first()
    await firstResult.click()

    // 驗證導航至歌詞詳情頁
    await expect(page).toHaveURL(/\/lyrics\//)
  })

  test('歌詞詳情頁應顯示完整歌詞', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋並導航至歌詞詳情頁
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('雨滴')
    await searchInput.press('Enter')
    await page.waitForURL(/\/search\?q=/)

    const firstResult = page.getByTestId('search-result-item').first()
    await firstResult.click()
    await page.waitForURL(/\/lyrics\//)

    // 驗證歌詞內容存在
    const lyricsContent = page.getByTestId('lyrics-content')
    await expect(lyricsContent).toBeVisible()
  })
})
