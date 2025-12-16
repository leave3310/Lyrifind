import { test, expect } from '@playwright/test'

test.describe('歌詞搜尋功能 - User Story 1: 基本關鍵字搜尋', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // T015: 搜尋歌名並驗證結果
  test('應能搜尋歌名並顯示匹配結果', async ({ page }) => {
    // 輸入歌名
    await page.fill('[data-testid="search-input"]', '青花瓷')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 驗證結果列表存在
    const results = page.locator('[data-testid="search-result-item"]')
    await expect(results).toHaveCount(await results.count())
    expect(await results.count()).toBeGreaterThan(0)
    
    // 驗證第一個結果包含歌名
    const firstResult = results.first()
    await expect(firstResult.locator('[data-testid="song-title"]')).toContainText('青花瓷')
  })

  // T016: 搜尋歌手並驗證結果
  test('應能搜尋歌手並顯示匹配結果', async ({ page }) => {
    // 輸入歌手名稱
    await page.fill('[data-testid="search-input"]', '周杰倫')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 驗證結果列表存在
    const results = page.locator('[data-testid="search-result-item"]')
    expect(await results.count()).toBeGreaterThan(0)
    
    // 驗證第一個結果包含歌手名稱
    const firstResult = results.first()
    await expect(firstResult.locator('[data-testid="song-artist"]')).toContainText('周杰倫')
  })

  // T017: 搜尋不存在關鍵字顯示空結果
  test('應在搜尋不存在關鍵字時顯示空結果訊息', async ({ page }) => {
    // 輸入不存在的關鍵字
    await page.fill('[data-testid="search-input"]', 'xyzabc123不存在的歌曲')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForTimeout(1000)
    
    // 驗證顯示空狀態訊息
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('查無結果')
  })

  // T018: 修改搜尋條件更新結果
  test('應在修改搜尋條件時更新結果', async ({ page }) => {
    // 第一次搜尋
    await page.fill('[data-testid="search-input"]', '青花瓷')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    const firstSearchResults = page.locator('[data-testid="search-result-item"]')
    const firstCount = await firstSearchResults.count()
    
    // 修改搜尋條件
    await page.fill('[data-testid="search-input"]', '倒帶')
    await page.click('[data-testid="search-button"]')
    await page.waitForTimeout(500)
    
    // 驗證結果已更新
    const secondSearchResults = page.locator('[data-testid="search-result-item"]')
    const secondCount = await secondSearchResults.count()
    
    // 結果應該不同（假設測試資料中這兩首歌的搜尋結果不同）
    expect(firstCount).not.toBe(secondCount)
  })

  // T019: 超過 20 筆結果顯示分頁
  test('應在結果超過 20 筆時顯示分頁', async ({ page }) => {
    // 使用廣泛的搜尋詞以獲得多筆結果（假設測試資料足夠）
    await page.fill('[data-testid="search-input"]', '愛')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 檢查是否顯示分頁元件
    const pagination = page.locator('[data-testid="pagination"]')
    
    // 如果結果超過 20 筆，應該顯示分頁
    const results = page.locator('[data-testid="search-result-item"]')
    const resultCount = await results.count()
    
    if (resultCount >= 20) {
      await expect(pagination).toBeVisible()
      
      // 驗證顯示下一頁按鈕
      await expect(pagination.locator('[data-testid="next-page"]')).toBeVisible()
    }
  })
})
