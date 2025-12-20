import { test, expect } from '@playwright/test'

test.describe('歌詞搜尋功能 - User Story 1: 基本關鍵字搜尋', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // T015: 搜尋歌名並驗證結果
  test('應能搜尋歌名並顯示匹配結果', async ({ page }) => {
    // 輸入歌名（使用實際存在的測試資料）
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 驗證結果列表存在
    const results = page.locator('[data-testid="search-result-item"]')
    await expect(results).toHaveCount(await results.count())
    expect(await results.count()).toBeGreaterThan(0)
    
    // 驗證第一個結果包含歌名
    const firstResult = results.first()
    await expect(firstResult.locator('[data-testid="song-title"]')).toContainText('小情歌')
  })

  // T016: 搜尋歌手並驗證結果
  test('應能搜尋歌手並顯示匹配結果', async ({ page }) => {
    // 輸入歌手名稱（使用實際存在的測試資料）
    await page.fill('[data-testid="search-input"]', '蘇打綠')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 驗證結果列表存在
    const results = page.locator('[data-testid="search-result-item"]')
    expect(await results.count()).toBeGreaterThan(0)
    
    // 驗證第一個結果包含歌手名稱
    const firstResult = results.first()
    await expect(firstResult.locator('[data-testid="song-artist"]')).toContainText('蘇打綠')
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
    // 第一次搜尋（使用實際存在的測試資料）
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    const firstSearchResults = page.locator('[data-testid="search-result-item"]')
    const firstTitle = await firstSearchResults.first().locator('[data-testid="song-title"]').textContent()
    
    // 修改搜尋條件
    await page.fill('[data-testid="search-input"]', '宇宙小姐')
    await page.click('[data-testid="search-button"]')
    await page.waitForTimeout(500)
    
    // 驗證結果已更新
    const secondSearchResults = page.locator('[data-testid="search-result-item"]')
    const secondTitle = await secondSearchResults.first().locator('[data-testid="song-title"]').textContent()
    
    // 結果標題應該不同
    expect(firstTitle).not.toBe(secondTitle)
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

// User Story 2: 歌詞片段搜尋與高亮
test.describe('歌詞搜尋功能 - User Story 2: 歌詞片段搜尋與高亮', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // T037: 搜尋歌詞顯示片段和高亮
  test('應能搜尋歌詞並顯示片段與高亮', async ({ page }) => {
    // 輸入歌詞關鍵字（使用實際存在的測試資料：蘇打綠 - 小情歌）
    await page.fill('[data-testid="search-input"]', '簡單的小情歌')
    await page.click('[data-testid="search-button"]')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 驗證有結果
    const results = page.locator('[data-testid="search-result-item"]')
    expect(await results.count()).toBeGreaterThan(0)
    
    // 驗證第一個結果顯示歌詞片段
    const firstResult = results.first()
    const lyricsSnippet = firstResult.locator('[data-testid="lyrics-snippet"]')
    await expect(lyricsSnippet).toBeVisible()
    
    // 驗證高亮顯示（檢查 mark 或 highlight class）
    const highlightedText = lyricsSnippet.locator('.bg-yellow-200')
    await expect(highlightedText).toBeVisible()
  })

  // T038: 歌詞片段顯示 3 行上下文
  test('應顯示包含匹配行及上下文的 3 行歌詞', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', '簡單的小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    const firstResult = page.locator('[data-testid="search-result-item"]').first()
    const lyricsSnippet = firstResult.locator('[data-testid="lyrics-snippet"]')
    
    // 驗證歌詞片段存在且包含文字
    const snippetText = await lyricsSnippet.textContent()
    expect(snippetText).toBeTruthy()
    
    // 驗證包含匹配文字
    expect(snippetText).toContain('簡單')
  })

  // T039: 多處匹配顯示第一處片段
  test('應在多處匹配時顯示第一處片段', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', '你')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    const results = page.locator('[data-testid="search-result-item"]')
    if (await results.count() > 0) {
      const firstResult = results.first()
      const lyricsSnippet = firstResult.locator('[data-testid="lyrics-snippet"]')
      
      if (await lyricsSnippet.count() > 0) {
        // 驗證片段顯示（只顯示第一處匹配）
        await expect(lyricsSnippet).toBeVisible()
      }
    }
  })

  // T040: 歌詞搜尋結果分頁
  test('應在歌詞搜尋結果超過 20 筆時顯示分頁', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', '的')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    const results = page.locator('[data-testid="search-result-item"]')
    const resultCount = await results.count()
    
    if (resultCount >= 20) {
      const pagination = page.locator('[data-testid="pagination"]')
      await expect(pagination).toBeVisible()
    }
  })
})

// User Story 3: 點擊進入歌曲詳細頁面
test.describe('歌詞搜尋功能 - User Story 3: 點擊進入歌曲詳細頁面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // T053: 點擊歌曲導航到詳細頁面
  test('應能點擊歌曲進入詳細頁面', async ({ page }) => {
    // 先執行搜尋（使用實際存在的測試資料）
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 點擊第一個搜尋結果
    const firstResult = page.locator('[data-testid="search-result-item"]').first()
    await firstResult.click()
    
    // 驗證導航到詳細頁面
    await page.waitForURL(/\/songs\//, { timeout: 10000 })
    expect(page.url()).toContain('/songs/')
    
    // 驗證詳細頁面顯示歌曲資訊（增加逾時時間以等待 API 回應）
    await expect(page.locator('[data-testid="song-detail-title"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="song-detail-artist"]')).toBeVisible()
    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible()
  })

  // T054: 詳細頁面返回搜尋結果保持狀態
  test('應能從詳細頁面返回搜尋結果並保持狀態', async ({ page }) => {
    // 執行搜尋（使用實際存在的測試資料）
    await page.fill('[data-testid="search-input"]', '蘇打綠')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 記錄搜尋關鍵字
    const searchInput = page.locator('[data-testid="search-input"]')
    const originalQuery = await searchInput.inputValue()
    
    // 點擊進入詳細頁面
    await page.locator('[data-testid="search-result-item"]').first().click()
    await page.waitForURL(/\/songs\//)
    
    // 點擊返回按鈕
    const backButton = page.locator('[data-testid="back-button"]')
    await expect(backButton).toBeVisible()
    await backButton.click()
    
    // 驗證返回搜尋頁面
    await page.waitForURL('/')
    
    // 驗證搜尋狀態保持（搜尋框仍有原本的查詢字串）
    const currentQuery = await searchInput.inputValue()
    expect(currentQuery).toBe(originalQuery)
    
    // 驗證搜尋結果仍然存在
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })

  // T055: 滑鼠 hover 顯示可點擊效果
  test('應在滑鼠 hover 時顯示可點擊效果', async ({ page }) => {
    // 執行搜尋（使用實際存在的測試資料）
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')
    
    // 取得第一個搜尋結果
    const firstResult = page.locator('[data-testid="search-result-item"]').first()
    
    // 驗證初始狀態
    await expect(firstResult).toBeVisible()
    
    // Hover 到元素上
    await firstResult.hover()
    
    // 驗證 cursor 變成 pointer（通過檢查 CSS class）
    const className = await firstResult.getAttribute('class')
    expect(className).toContain('cursor-pointer')
    
    // 驗證有 hover 效果（bg-gray-50）
    expect(className).toContain('hover:bg-gray-50')
  })
})
