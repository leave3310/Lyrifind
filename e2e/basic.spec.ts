import { test, expect } from '@playwright/test'
import { setupAPIMocks } from './fixtures'

test.describe('基本測試', () => {
  test('搜尋頁面可以載入', async ({ page }) => {
    await setupAPIMocks(page)
    await page.goto('/search')
    
    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('歌詞搜尋')
    
    // 驗證搜尋輸入框存在
    await expect(page.locator('input[placeholder*="搜尋"]')).toBeVisible()
  })

  test('搜尋功能可以執行', async ({ page }) => {
    await setupAPIMocks(page)
    await page.goto('/search')
    
    // 輸入搜尋關鍵字
    await page.fill('input[placeholder*="搜尋"]', '海闊天空')
    await page.press('input[placeholder*="搜尋"]', 'Enter')
    
    // 等待一下讓請求完成
    await page.waitForTimeout(1000)
    
    // 檢查是否有結果區域
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })
})
