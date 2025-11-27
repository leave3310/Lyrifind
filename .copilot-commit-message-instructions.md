**規範**：
- 所有 Git commit 訊息 MUST 遵循 [Conventional Commits v1.0.0](https://www.conventionalcommits.org/zh-hant/v1.0.0/) 規範
- Commit 訊息格式 MUST 為：`<type>[optional scope]: <description>`
- Commit 訊息的 description MUST 使用正體中文撰寫
- 允許的 type 類型：
  - `feat`：新增功能
  - `fix`：修復錯誤
  - `docs`：文件變更
  - `style`：程式碼格式調整（不影響程式邏輯）
  - `refactor`：重構程式碼（不新增功能也不修復錯誤）
  - `perf`：效能改善
  - `test`：新增或修改測試
  - `build`：建構系統或外部相依套件變更
  - `ci`：CI 設定變更
  - `chore`：其他不影響原始碼的變更
  - `revert`：還原先前的 commit
- 包含破壞性變更 (BREAKING CHANGE) MUST 在 footer 中說明，或在 type 後加上 `!`
- Scope（可選）SHOULD 使用功能模組名稱（如 `feat(search):`、`fix(lyrics):`）
- 每個 commit SHOULD 只包含單一邏輯變更

**範例**：
```
feat(search): 新增歌詞搜尋功能

fix(lyrics): 修正歌詞同步顯示時間偏移問題

docs: 更新 README 安裝說明

feat!: 重新設計 API 回應格式

BREAKING CHANGE: API 回應結構已變更，需更新前端對應程式碼
```

**理由**：Conventional Commits 提供一致且機器可讀的 commit 歷史，便於自動化產生 CHANGELOG、語意化版本遞增和團隊協作。