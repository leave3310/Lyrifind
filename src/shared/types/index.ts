/**
 * 共用型別定義
 */

export interface AppError {
  message: string
  code?: string
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
