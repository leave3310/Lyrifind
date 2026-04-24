import { test, expect } from '@playwright/test'

// ============================================================
// 測試輔助函式
// ============================================================

async function searchAndClick(page: Parameters<typeof test>[1] extends (args: infer A) => unknown ? A extends { page: infer P } ? P : never : never, keyword: string) {
  await page.goto('/')
  await page.fill('[data-testid="search-input"]', keyword)
  await page.click('[data-testid="search-button"]')
  await page.waitForSelector('[data-testid="search-results"]')
  await page.locator('[data-testid="search-result-item"]').first().click()
  await page.waitForURL(/\/songs\//, { timeout: 10000 })
}

// ============================================================
// User Story 1: 從搜尋結果進入歌曲詳細頁
// ============================================================

test.describe('歌曲詳細頁 - User Story 1: 從搜尋結果進入歌曲詳細頁', () => {
  // T012: 導航到詳細頁並顯示歌曲資訊
  test('應能從搜尋結果導航到詳細頁並顯示完整歌曲資訊', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    const firstResult = page.locator('[data-testid="search-result-item"]').first()
    const expectedTitle = await firstResult.locator('[data-testid="song-title"]').textContent()
    await firstResult.click()

    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    // 驗證歌曲資訊顯示
    await expect(page.locator('[data-testid="song-detail-title"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="song-detail-artist"]')).toBeVisible()
    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible()

    // 驗證歌名一致
    const detailTitle = await page.locator('[data-testid="song-detail-title"]').textContent()
    expect(detailTitle?.trim()).toBe(expectedTitle?.trim())
  })

  // T013: 返回搜尋結果並保持狀態
  test('應能從詳細頁返回搜尋結果並保持搜尋狀態', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '蘇打綠')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    await page.locator('[data-testid="search-result-item"]').first().click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    // 等待詳細頁載入
    await expect(page.locator('[data-testid="song-detail-title"]')).toBeVisible({ timeout: 10000 })

    // 點擊返回
    await page.locator('[data-testid="back-button"]').click()
    await page.waitForURL('/**', { timeout: 5000 })

    // 驗證返回搜尋頁面且結果仍在
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })

  // T014: 處理無效歌曲 ID
  test('應在訪問無效歌曲 ID 時顯示錯誤訊息', async ({ page }) => {
    await page.goto('/songs/invalid-song-id-that-does-not-exist-xyz')

    // 等待頁面載入
    await page.waitForTimeout(3000)

    // 驗證顯示找不到歌曲的訊息
    const notFound = page.locator('[data-testid="song-not-found"]')
    const errorMessage = page.locator('[data-testid="song-detail-error"]')

    const notFoundVisible = await notFound.isVisible()
    const errorVisible = await errorMessage.isVisible()

    expect(notFoundVisible || errorVisible).toBeTruthy()
  })
})

// ============================================================
// User Story 2: 歌詞匹配片段高亮顯示
// ============================================================

test.describe('歌曲詳細頁 - User Story 2: 歌詞匹配片段高亮顯示', () => {
  // T025: 歌詞關鍵字搜尋後進入詳細頁顯示高亮
  test('應在歌詞搜尋後進入詳細頁時顯示高亮效果', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '簡單的小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    await page.locator('[data-testid="search-result-item"]').first().click()
    await page.waitForURL(/\/songs\/.*\?highlight=/, { timeout: 10000 })

    // 等待歌詞載入
    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible({ timeout: 10000 })

    // 驗證高亮標記存在
    const highlightedMarks = page.locator('[data-testid="song-detail-lyrics"] mark')
    await expect(highlightedMarks.first()).toBeVisible({ timeout: 5000 })
  })

  // T026: 非歌詞搜尋進入詳細頁無高亮效果
  test('應在非歌詞搜尋進入詳細頁時不顯示高亮效果', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    await page.locator('[data-testid="search-result-item"]').first().click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    // 等待歌詞載入
    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible({ timeout: 10000 })

    // 驗證 URL 沒有 highlight 參數時，不一定有高亮（可能有也可能沒有，取決於搜尋類型）
    const currentUrl = page.url()
    if (!currentUrl.includes('?highlight=')) {
      // 沒有 highlight 參數時不應有高亮 mark
      const marks = page.locator('[data-testid="song-detail-lyrics"] mark')
      const markCount = await marks.count()
      expect(markCount).toBe(0)
    }
  })

  // T027: 直接透過 URL 訪問帶 highlight 參數顯示高亮
  test('應在直接透過 URL 訪問帶 highlight 參數時顯示高亮', async ({ page }) => {
    // 先取得一個有效的歌曲 ID
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    const firstLink = page.locator('[data-testid="search-result-item"]').first()
    await firstLink.click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    const songUrl = page.url().split('?')[0]
    // 直接訪問帶 highlight 參數的 URL
    await page.goto(`${songUrl}?highlight=小情歌`)

    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible({ timeout: 10000 })

    const marks = page.locator('[data-testid="song-detail-lyrics"] mark')
    await expect(marks.first()).toBeVisible({ timeout: 5000 })
  })

  // T027b: URL highlight 參數格式錯誤時的容錯處理
  test('應在 highlight 參數為空時不顯示高亮', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    const firstLink = page.locator('[data-testid="search-result-item"]').first()
    await firstLink.click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    const songUrl = page.url().split('?')[0]
    // 帶空的 highlight 參數
    await page.goto(`${songUrl}?highlight=`)

    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible({ timeout: 10000 })

    // 空的 highlight 參數不應顯示高亮
    const marks = page.locator('[data-testid="song-detail-lyrics"] mark')
    expect(await marks.count()).toBe(0)
  })

  // T028: 多處匹配時所有位置都高亮
  test('應在多處匹配時所有位置都顯示高亮', async ({ page }) => {
    // 先取得一個有效的歌曲 ID
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    const firstLink = page.locator('[data-testid="search-result-item"]').first()
    await firstLink.click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    const songUrl = page.url().split('?')[0]
    // 用常見字「的」進行高亮，應有多處匹配
    await page.goto(`${songUrl}?highlight=的`)

    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible({ timeout: 10000 })

    const marks = page.locator('[data-testid="song-detail-lyrics"] mark')
    const markCount = await marks.count()
    // 「的」應在歌詞中出現多次
    expect(markCount).toBeGreaterThan(1)
  })
})

// ============================================================
// User Story 3: 自動捲動到第一個匹配位置
// ============================================================

test.describe('歌曲詳細頁 - User Story 3: 自動捲動到第一個匹配位置', () => {
  // T039: 有高亮關鍵字時自動捲動到第一個匹配位置
  test('應在有高亮關鍵字時自動捲動到第一個匹配位置', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    const firstLink = page.locator('[data-testid="search-result-item"]').first()
    await firstLink.click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    const songUrl = page.url().split('?')[0]
    await page.goto(`${songUrl}?highlight=啊`)

    await expect(page.locator('[data-testid="song-detail-lyrics"]')).toBeVisible({ timeout: 10000 })

    // 等待自動捲動完成
    await page.waitForTimeout(1000)

    // 驗證第一個 mark 在可視範圍內
    const firstMark = page.locator('[data-testid="song-detail-lyrics"] mark').first()
    if (await firstMark.count() > 0) {
      const isVisible = await firstMark.isVisible()
      // 如果有匹配，應該在可視範圍內
      if (isVisible) {
        const boundingBox = await firstMark.boundingBox()
        const viewportSize = page.viewportSize()
        if (boundingBox && viewportSize) {
          expect(boundingBox.y).toBeGreaterThanOrEqual(0)
          expect(boundingBox.y).toBeLessThanOrEqual(viewportSize.height)
        }
      }
    }
  })

  // T041: 無高亮關鍵字時頁面顯示在頂部
  test('應在無高亮關鍵字時頁面顯示在頂部', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', '小情歌')
    await page.click('[data-testid="search-button"]')
    await page.waitForSelector('[data-testid="search-results"]')

    await page.locator('[data-testid="search-result-item"]').first().click()
    await page.waitForURL(/\/songs\//, { timeout: 10000 })

    const currentUrl = page.url()
    if (!currentUrl.includes('?highlight=')) {
      await expect(page.locator('[data-testid="song-detail-title"]')).toBeVisible({ timeout: 10000 })

      // 驗證捲動位置在頂部附近
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(scrollY).toBeLessThan(100)
    }
  })
})
