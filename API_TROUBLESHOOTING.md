# API 故障排查報告

**日期**: 2025-12-19  
**問題**: Google Apps Script API 返回 400 Bad Request 錯誤

---

## 🔴 問題描述

執行 E2E 測試時，所有搜尋測試都失敗（33/42 failed）。診斷發現 API 端點返回 400 錯誤。

### API 端點
```
https://script.google.com/macros/s/AKfycbzB7ejDEI57KtPDCwvBjElV3RO4g7FDkqH0bbZvD7Yk2QrU3xYVzmmU3VnCow99wDmBfg/exec
```

### 測試結果
```bash
curl "https://script.google.com/macros/s/AKfycbzB7ejDEI57KtPDCwvBjElV3RO4g7FDkqH0bbZvD7Yk2QrU3xYVzmmU3VnCow99wDmBfg/exec?action=search&query=愛"
# 返回：400 Bad Request (HTML error page)
```

---

## 可能原因

### 1. 部署過期或未更新
- Google Apps Script Web App 部署可能已過期
- 部署 URL 可能已變更
- 部署權限可能已變更

### 2. Apps Script 程式碼問題
- Apps Script 可能有語法錯誤
- `doGet()` 函式可能未正確處理請求參數
- CORS 設定可能有問題

### 3. Google Sheets 資料問題
- 工作表名稱可能不符合預期（需要是 "Songs"）
- 欄位名稱可能不正確（需要：id, artist, title, lyrics）
- 資料可能未正確填入

### 4. 權限問題
- Apps Script 執行權限可能需要重新授權
- 部署權限設定為「僅自己」而非「所有人」

---

## 📋 故障排查步驟

### 步驟 1: 檢查 Google Sheets
1. 開啟 Google Sheets
2. 確認工作表名稱為 "Songs"（區分大小寫）
3. 確認欄位順序：A=id, B=artist, C=title, D=lyrics
4. 確認有至少 50 筆資料
5. 確認資料格式正確（無特殊字元問題）

### 步驟 2: 檢查 Apps Script 程式碼
1. 開啟 Google Apps Script 編輯器
2. 確認 `doGet(e)` 函式存在
3. 確認程式碼沒有語法錯誤（紅色底線）
4. 執行測試函式驗證程式碼可運行

### 步驟 3: 重新部署 Web App
1. 在 Apps Script 中：點擊「部署」→「管理部署」
2. 檢查當前部署設定：
   - 執行身分：您
   - 存取權限：**任何人** （不是「僅限組織內的使用者」）
3. 如果設定錯誤，建立新版本部署
4. 複製新的 Web App URL
5. 更新 `.env.local` 中的 `VITE_APPS_SCRIPT_URL`

### 步驟 4: 測試 API
使用以下命令測試 API（替換為新的 URL）：

```bash
# 測試 search endpoint
curl "YOUR_NEW_URL?action=search&query=愛"

# 測試 getSong endpoint
curl "YOUR_NEW_URL?action=getSong&id=1"

# 應該返回 JSON 格式，而不是 HTML 錯誤頁面
```

### 步驟 5: 更新環境變數
```bash
# 編輯 .env.local
echo 'VITE_APPS_SCRIPT_URL=YOUR_NEW_URL' > .env.local

# 重新啟動開發伺服器
pnpm run dev
```

---

## 🔧 正確的 Apps Script 程式碼範例

參考 `specs/004-lyrics-search/contracts/search.contract.md` 中的完整程式碼。

### 核心檢查點

```javascript
function doGet(e) {
  // 必須處理 CORS
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  // 必須檢查 action 參數
  const action = e.parameter.action;
  
  if (action === 'search') {
    const query = e.parameter.query || '';
    // ... 搜尋邏輯
  } else if (action === 'getSong') {
    const id = e.parameter.id || '';
    // ... 取得歌曲邏輯
  }
  
  return response;
}
```

---

## ✅ 驗證清單

完成以下檢查後，API 應該能正常運作：

- [ ] Google Sheets 有 "Songs" 工作表
- [ ] 工作表有正確的欄位（id, artist, title, lyrics）
- [ ] 工作表有至少 50 筆測試資料
- [ ] Apps Script 程式碼無語法錯誤
- [ ] Apps Script 已成功儲存
- [ ] Web App 已部署（存取權限：任何人）
- [ ] 已取得新的 Web App URL
- [ ] `.env.local` 已更新為新 URL
- [ ] 手動測試 API 返回 JSON（非 HTML 錯誤）
- [ ] 開發伺服器已重新啟動

---

## 📝 完成後的下一步

API 修復後，執行以下步驟：

1. **重新執行 E2E 測試**
   ```bash
   pnpm run test:e2e
   ```

2. **手動測試**
   - 啟動開發伺服器：`pnpm run dev`
   - 開啟 http://localhost:5173
   - 執行 `manual-test-us1.md` 中的所有測試

3. **更新任務狀態**
   - 標記 T050 為完成（E2E tests pass）
   - 標記 T036, T052, T064, T066 為完成（手動測試）

---

## 🆘 如果問題持續

如果上述步驟都完成但仍有問題：

1. **檢查 Google Apps Script 日誌**
   - 在 Apps Script 編輯器：執行 → 查看執行紀錄
   - 查看是否有錯誤訊息

2. **測試簡單的 doGet**
   ```javascript
   function doGet(e) {
     return ContentService.createTextOutput(JSON.stringify({test: "ok"}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **檢查瀏覽器 Console**
   - 開啟 DevTools
   - 查看 Network tab 中的 API 請求
   - 檢查是否有 CORS 錯誤

4. **聯繫管理員**
   - 可能是 Google Workspace 組織政策限制
   - 可能需要組織管理員調整權限

---

**最後更新**: 2025-12-19  
**狀態**: 🔴 待修復
