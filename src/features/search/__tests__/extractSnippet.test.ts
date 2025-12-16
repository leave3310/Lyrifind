// T041: 單元測試 - 歌詞片段擷取邏輯
import { describe, it, expect } from 'vitest'
import { extractSnippet } from '../utils/extractSnippet'

describe('extractSnippet', () => {
  it('應擷取包含匹配行及前後各 1 行的片段', () => {
    const lyrics = '第一行\n第二行匹配\n第三行'
    const query = '匹配'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).not.toBeNull()
    expect(result?.lines).toEqual(['第一行', '第二行匹配', '第三行'])
    expect(result?.matchIndex).toBe(1)
  })

  it('應在匹配行為第一行時只顯示前 2 行', () => {
    const lyrics = '第一行匹配\n第二行\n第三行'
    const query = '匹配'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).not.toBeNull()
    expect(result?.lines).toEqual(['第一行匹配', '第二行'])
    expect(result?.matchIndex).toBe(0)
  })

  it('應在匹配行為最後一行時只顯示後 2 行', () => {
    const lyrics = '第一行\n第二行\n第三行匹配'
    const query = '匹配'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).not.toBeNull()
    expect(result?.lines).toEqual(['第二行', '第三行匹配'])
    expect(result?.matchIndex).toBe(1)
  })

  it('應在歌詞少於 3 行時顯示全部歌詞', () => {
    const lyrics = '第一行匹配\n第二行'
    const query = '匹配'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).not.toBeNull()
    expect(result?.lines).toEqual(['第一行匹配', '第二行'])
    expect(result?.matchIndex).toBe(0)
  })

  it('應在找不到匹配時返回 null', () => {
    const lyrics = '第一行\n第二行\n第三行'
    const query = '不存在'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).toBeNull()
  })

  it('應進行不區分大小寫的匹配', () => {
    const lyrics = '第一行\nABC匹配\n第三行'
    const query = 'abc'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).not.toBeNull()
    expect(result?.matchIndex).toBe(1)
  })

  it('應在多處匹配時返回第一處片段', () => {
    const lyrics = '第一行\n第二行匹配\n第三行\n第四行匹配\n第五行'
    const query = '匹配'
    
    const result = extractSnippet(lyrics, query)
    
    expect(result).not.toBeNull()
    expect(result?.lines).toEqual(['第一行', '第二行匹配', '第三行'])
    expect(result?.matchIndex).toBe(1)
  })
})
