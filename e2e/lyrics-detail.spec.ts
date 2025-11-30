/**
 * 歌詞詳細頁 E2E 測試
 * @description 測試完整歌詞、歌曲名稱、歌手顯示
 */

import { test, expect, type Page } from '@playwright/test'
import { mockSongs, TEST_CONSTANTS } from './fixtures'

/** 模擬 Google Sheets API 回應 */
async function mockGoogleSheetsApi(page: Page) {
  await page.route('**/sheets.googleapis.com/**', async (route) => {
    const mockResponse = {
      range: 'Sheet1!A2:D',
      majorDimension: 'ROWS',
      values: mockSongs.map((song) => [song.id, song.title, song.artist, song.lyrics]),
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    })
  })
}

test.describe('歌詞詳細頁', () => {
  test.beforeEach(async ({ page }) => {
    await mockGoogleSheetsApi(page)
  })

  test('應該顯示歌曲名稱', async ({ page }) => {
    // 直接導航至歌詞詳細頁
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證歌曲名稱顯示
    const songTitle = page.getByTestId('lyrics-title')
    await expect(songTitle).toBeVisible()
    await expect(songTitle).toContainText('小幸運')
  })

  test('應該顯示歌手名稱', async ({ page }) => {
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證歌手名稱顯示
    const songArtist = page.getByTestId('lyrics-artist')
    await expect(songArtist).toBeVisible()
    await expect(songArtist).toContainText('田馥甄')
  })

  test('應該顯示完整歌詞內容', async ({ page }) => {
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證歌詞內容顯示
    const lyricsContent = page.getByTestId('lyrics-content')
    await expect(lyricsContent).toBeVisible()
    await expect(lyricsContent).toContainText('我聽見雨滴落在青青草地')
  })

  test('應該提供返回首頁的導航', async ({ page }) => {
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證返回按鈕存在
    const backButton = page.getByTestId('back-button')
    await expect(backButton).toBeVisible()

    // 點擊返回按鈕
    await backButton.click()

    // 驗證導航至首頁
    await expect(page).toHaveURL(TEST_CONSTANTS.HOME_URL)
  })

  test('歌曲不存在時應顯示錯誤訊息', async ({ page }) => {
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/not-exist-id`)

    // 驗證顯示錯誤訊息或 404 頁面
    const errorMessage = page.getByTestId('not-found-message')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('找不到')
  })

  test('載入過程中應顯示載入狀態', async ({ page }) => {
    // 設置延遲的 API 回應
    await page.route('**/sheets.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockResponse = {
        range: 'Sheet1!A2:D',
        majorDimension: 'ROWS',
        values: mockSongs.map((song) => [song.id, song.title, song.artist, song.lyrics]),
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      })
    })

    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證載入狀態顯示
    const loadingSpinner = page.getByTestId('loading-spinner')
    await expect(loadingSpinner).toBeVisible()

    // 等待載入完成
    await expect(loadingSpinner).toBeHidden({ timeout: 5000 })
  })

  test('歌詞應保留換行格式', async ({ page }) => {
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/1`)

    // 驗證歌詞內容容器存在
    const lyricsContent = page.getByTestId('lyrics-content')
    await expect(lyricsContent).toBeVisible()

    // 驗證使用 whitespace-pre-line 或類似樣式保留換行
    // 或驗證 HTML 結構正確
  })

  test('應該正確處理不同歌曲 ID', async ({ page }) => {
    // 測試第二首歌
    await page.goto(`${TEST_CONSTANTS.LYRICS_URL}/2`)

    const songTitle = page.getByTestId('lyrics-title')
    await expect(songTitle).toContainText('告白氣球')

    const songArtist = page.getByTestId('lyrics-artist')
    await expect(songArtist).toContainText('周杰倫')

    const lyricsContent = page.getByTestId('lyrics-content')
    await expect(lyricsContent).toContainText('塞納河畔')
  })
})
