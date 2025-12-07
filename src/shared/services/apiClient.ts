/**
 * ts-rest API Client
 * 
 * 基於 API Contract 產生的型別安全客戶端
 */

import { initClient } from '@ts-rest/core'
import { lyricsContract } from '@/shared/contracts/lyrics.contract'
import { http } from './http'

export const apiClient = initClient(lyricsContract, {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
  fetch: http.request,
})
