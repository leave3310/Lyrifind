/**
 * 導航功能 E2E 測試
 * @description 測試搜尋結果點擊導航、返回功能
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

test.describe('導航功能', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppsScriptApi(page)
  })

  test('點擊搜尋結果應導航至歌詞詳細頁', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌曲
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('小幸運')
    await searchInput.press('Enter')

    // 等待搜尋結果
    await page.waitForURL(/\/search\?q=/)
    const resultItem = page.getByTestId('search-result-item').first()
    await expect(resultItem).toBeVisible()

    // 點擊搜尋結果
    await resultItem.click()

    // 驗證導航至歌詞詳細頁
    await expect(page).toHaveURL(/\/lyrics\//)

    // 驗證歌詞頁面內容
    const songTitle = page.getByTestId('lyrics-title')
    await expect(songTitle).toBeVisible()
  })

  test('從歌詞詳細頁返回搜尋結果頁', async ({ page }) => {
    // 先進行搜尋
    await page.goto(TEST_CONSTANTS.HOME_URL)
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('周杰倫')
    await searchInput.press('Enter')

    // 等待搜尋結果並點擊
    await page.waitForURL(/\/search\?q=/)
    const resultItem = page.getByTestId('search-result-item').first()
    await resultItem.click()

    // 等待歌詞頁面載入
    await expect(page).toHaveURL(/\/lyrics\//)

    // 使用瀏覽器返回按鈕
    await page.goBack()

    // 驗證返回搜尋結果頁
    await expect(page).toHaveURL(/\/search\?q=/)
    await expect(page.getByTestId('search-results')).toBeVisible()
  })

  test('從歌詞詳細頁返回首頁', async ({ page }) => {
    // 直接導航至歌詞頁面
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 點擊返回首頁按鈕
    const backButton = page.getByTestId('back-button')
    await backButton.click()

    // 驗證返回首頁
    await expect(page).toHaveURL(TEST_CONSTANTS.HOME_URL)
  })

  test('深層連結應可直接存取搜尋結果頁', async ({ page }) => {
    // 直接訪問搜尋結果 URL
    await page.goto(`${TEST_CONSTANTS.SEARCH_URL}?q=周杰倫`)

    // 驗證搜尋結果顯示
    const searchResults = page.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    // 驗證搜尋輸入框包含關鍵字
    const searchInput = page.getByTestId('search-input')
    await expect(searchInput).toHaveValue('周杰倫')
  })

  test('深層連結應可直接存取歌詞詳細頁', async ({ page }) => {
    // 直接訪問歌詞頁面 URL
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證歌詞頁面顯示
    const lyricsContent = page.getByTestId('lyrics-content')
    await expect(lyricsContent).toBeVisible()
  })

  test('Header 標題應導航至首頁', async ({ page }) => {
    // 導航至搜尋結果頁
    await page.goto(`${TEST_CONSTANTS.SEARCH_URL}?q=test`)

    // 點擊 Header 標題
    const headerTitle = page.getByTestId('header-title')
    await headerTitle.click()

    // 驗證導航至首頁
    await expect(page).toHaveURL(TEST_CONSTANTS.HOME_URL)
  })

  test('搜尋結果頁應保留搜尋關鍵字', async ({ page }) => {
    await page.goto(TEST_CONSTANTS.HOME_URL)

    // 搜尋歌曲
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('田馥甄')
    await searchInput.press('Enter')

    // 等待搜尋結果
    await page.waitForURL(/\/search\?q=/)

    // 驗證 URL 包含關鍵字
    expect(page.url()).toContain('q=%E7%94%B0%E9%A6%A5%E7%94%84') // URL 編碼的 "田馥甄"

    // 驗證搜尋輸入框保留關鍵字
    const currentSearchInput = page.getByTestId('search-input')
    await expect(currentSearchInput).toHaveValue('田馥甄')
  })

  test('在搜尋結果頁重新搜尋應更新結果', async ({ page }) => {
    // 第一次搜尋
    await page.goto(`${TEST_CONSTANTS.SEARCH_URL}?q=周杰倫`)
    await expect(page.getByTestId('search-results')).toBeVisible()

    // 重新搜尋
    const searchInput = page.getByTestId('search-input')
    await searchInput.clear()
    await searchInput.fill('田馥甄')
    await searchInput.press('Enter')

    // 驗證 URL 更新
    await expect(page).toHaveURL(/q=%E7%94%B0%E9%A6%A5%E7%94%84/) // URL 編碼的 "田馥甄"
  })

  test('不存在的路由應顯示 404 頁面', async ({ page }) => {
    await page.goto('/not-exist-page')

    // 驗證 404 頁面顯示
    const notFoundPage = page.getByTestId('not-found-page')
    await expect(notFoundPage).toBeVisible()
  })

  test('404 頁面應提供返回首頁連結', async ({ page }) => {
    await page.goto('/not-exist-page')

    // 點擊返回首頁連結
    const homeLink = page.getByTestId('home-link')
    await homeLink.click()

    // 驗證導航至首頁
    await expect(page).toHaveURL(TEST_CONSTANTS.HOME_URL)
  })
})
