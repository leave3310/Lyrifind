// 跨功能共用型別定義
// 本檔案包含多個 feature 共用的核心實體型別

/**
 * 歌曲實體
 * 代表一首完整的歌曲資訊
 * 來源：Google Sheets（欄位順序：id, artist, title, lyrics）
 */
export interface Song {
  /** 歌曲唯一識別碼 */
  id: string

  /** 歌手名稱 */
  artist: string

  /** 歌曲名稱 */
  title: string

  /** 完整歌詞內容（包含換行符號 \n） */
  lyrics: string
}
