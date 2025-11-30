/// <reference types="vite/client" />

/**
 * 環境變數類型宣告
 * @description 讓 TypeScript 識別 Vite 環境變數
 */
interface ImportMetaEnv {
  /**
   * Google Apps Script Web App API 端點
   * @example 'https://script.google.com/macros/s/xxxx/exec'
   */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
