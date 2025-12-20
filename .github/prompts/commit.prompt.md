---
agent: agent
---

# Conventional Commit v1.0.0 規範

## 格式
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 說明
- **type**（必填）：描述此次提交的類型，例如 `feat`（功能）、`fix`（修復）。
- **scope**（選填）：描述此次提交影響的範圍，例如 `search`、`lyrics`。
- **description**（必填）：簡要描述此次提交的變更內容。
- **body**（選填）：詳細描述此次提交的內容、原因及相關背景資訊。
- **footer(s)**（選填）：用於描述破壞性變更（BREAKING CHANGE）或關聯的 Issue，例如 `Closes #123`。

## type 類型
- `feat`：新增功能。
- `fix`：修復錯誤。
- `docs`：文件變更。
- `style`：程式碼格式調整（不影響邏輯）。
- `refactor`：程式碼重構（不新增功能或修復錯誤）。
- `perf`：效能優化。
- `test`：新增或修改測試。
- `build`：建構系統或外部相依套件變更。
- `ci`：CI 設定變更。
- `chore`：其他不影響程式碼的變更。
- `revert`：還原先前的提交。

## 範例
### 新增功能
```
feat(search): 新增歌詞搜尋功能

- 支援關鍵字搜尋
- 支援歌手名稱搜尋
```

### 修復錯誤
```
fix(lyrics): 修正歌詞顯示錯誤

- 修復因 API 回傳格式變更導致的解析錯誤
- 增加錯誤處理邏輯
```

### 文件更新
```
docs: 更新 README，新增快速開始指南
```

### 破壞性變更
```
feat!: 重構 API 回應格式

BREAKING CHANGE: API 回應結構已變更，需更新前端邏輯
```
