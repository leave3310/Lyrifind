# 快速入門指南：歌詞搜尋網站

**Feature Branch**: `001-lyrics-search`  
**建立日期**: 2025-11-27

## 前置需求

### 環境需求

| 項目 | 最低版本 | 建議版本 |
|------|----------|----------|
| Node.js | 18.x | 20.x LTS |
| pnpm | 8.x | 9.x |
| 瀏覽器 | Chrome 90+ | Chrome 最新版 |

### 外部服務設定

1. **Google Cloud Console 設定**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 建立新專案或選擇現有專案
   - 啟用 Google Sheets API
   - 建立 API 金鑰（僅限讀取）
   - 設定 API 金鑰限制（HTTP Referrer）

2. **Google Sheets 設定**
   - 建立新的 Google Sheets 文件
   - 設定欄位：`id`、`title`、`artist`、`lyrics`
   - 將試算表權限設為「任何人皆可檢視」
   - 記錄試算表 ID（URL 中的長字串）

---

## 安裝步驟

### 1. 複製專案

```bash
git clone <repository-url>
cd LyriFind
```

### 2. 安裝相依套件

```bash
pnpm install
```

### 3. 設定環境變數

```bash
# 複製環境變數範本
cp .env.example .env
```

編輯 `.env` 檔案：

```env
# Google Sheets API 設定
VITE_GOOGLE_API_KEY=你的_API_金鑰
VITE_GOOGLE_SHEET_ID=你的_試算表_ID
```

### 4. 啟動開發伺服器

```bash
pnpm run dev
```

開啟瀏覽器訪問 `http://localhost:5173`

---

## 測試指令

### 執行單元測試

```bash
# 執行所有單元測試
pnpm run test

# 監視模式（開發時使用）
pnpm run test:watch

# 產生覆蓋率報告
pnpm run test:coverage
```

### 執行 E2E 測試

```bash
# 安裝 Playwright 瀏覽器
pnpm exec playwright install

# 執行所有 E2E 測試
pnpm run test:e2e

# 開啟互動式 UI
pnpm run test:e2e:ui
```

### 執行程式碼檢查

```bash
# 執行 OxLint 檢查
pnpm run lint

# TypeScript 型別檢查
pnpm run type-check
```

---

## 建構與部署

### 建構生產版本

```bash
pnpm run build
```

建構產出位於 `dist/` 目錄。

### 預覽建構結果

```bash
pnpm run preview
```

---

## 專案結構

```
LyriFind/
├── src/
│   ├── features/           # 功能模組
│   │   ├── search/         # 搜尋功能
│   │   └── lyrics/         # 歌詞功能
│   ├── shared/             # 共用程式碼
│   ├── pages/              # 頁面元件
│   ├── router/             # 路由設定
│   ├── App.vue             # 根元件
│   └── main.ts             # 進入點
├── e2e/                    # E2E 測試
├── specs/                  # 功能規格文件
│   └── 001-lyrics-search/
│       ├── spec.md         # 功能規格
│       ├── plan.md         # 實作計畫
│       ├── research.md     # 技術研究
│       ├── data-model.md   # 資料模型
│       └── contracts/      # API 契約
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 常見問題

### Q: API 金鑰應該如何保護？

**A**: 
1. 將 `.env` 加入 `.gitignore`（預設已設定）
2. 在 Google Cloud Console 設定 API 金鑰的 HTTP Referrer 限制
3. 僅授予 Sheets API 讀取權限

### Q: 如何新增歌詞資料？

**A**: 直接在 Google Sheets 中新增資料列，格式為：
- 欄位 A：唯一 ID（例：`song-001`）
- 欄位 B：歌曲名稱
- 欄位 C：歌手名稱
- 欄位 D：完整歌詞

### Q: E2E 測試失敗，顯示瀏覽器未安裝？

**A**: 執行以下指令安裝 Playwright 瀏覽器：
```bash
pnpm exec playwright install
```

### Q: 開發時如何模擬 API 回應？

**A**: 
- E2E 測試使用 `page.route()` 攔截請求
- 單元測試使用 `vi.mock()` 模擬模組
- 模擬資料放置於 `e2e/fixtures/` 目錄

---

## 開發流程

遵循專案憲章的測試優先原則：

1. **撰寫 E2E 測試**
   - 在 `e2e/` 目錄建立測試檔案
   - 定義使用者操作流程
   - 執行測試確認失敗（Red）

2. **撰寫單元測試**
   - 在功能模組的 `__tests__/` 目錄建立測試
   - 測試 composables 和服務
   - 執行測試確認失敗（Red）

3. **實作功能**
   - 實作程式碼使測試通過（Green）
   - 確保所有測試都通過

4. **重構**
   - 優化程式碼結構
   - 保持測試通過（Refactor）

5. **提交程式碼**
   - 執行 `pnpm run lint` 確認無錯誤
   - 使用 Conventional Commits 格式撰寫 commit 訊息

---

## 相關文件

- [功能規格](./spec.md)
- [實作計畫](./plan.md)
- [技術研究](./research.md)
- [資料模型](./data-model.md)
- [API 契約](./contracts/api.md)
- [專案憲章](/.specify/memory/constitution.md)
