import { describe, it, expect } from 'vitest'
import { escapeRegex } from '../utils/escape-regex'

describe('escapeRegex()', () => {
  it('應回傳普通字串不做修改', () => {
    expect(escapeRegex('hello')).toBe('hello')
    expect(escapeRegex('你好世界')).toBe('你好世界')
  })

  it('應跳脫正則表達式特殊字元 .', () => {
    expect(escapeRegex('a.b')).toBe('a\\.b')
  })

  it('應跳脫正則表達式特殊字元 *', () => {
    expect(escapeRegex('a*b')).toBe('a\\*b')
  })

  it('應跳脫正則表達式特殊字元 +', () => {
    expect(escapeRegex('a+b')).toBe('a\\+b')
  })

  it('應跳脫正則表達式特殊字元 ?', () => {
    expect(escapeRegex('a?b')).toBe('a\\?b')
  })

  it('應跳脫正則表達式特殊字元 ^', () => {
    expect(escapeRegex('^abc')).toBe('\\^abc')
  })

  it('應跳脫正則表達式特殊字元 $', () => {
    expect(escapeRegex('abc$')).toBe('abc\\$')
  })

  it('應跳脫正則表達式特殊字元括號 {}', () => {
    expect(escapeRegex('{a}')).toBe('\\{a\\}')
  })

  it('應跳脫正則表達式特殊字元括號 ()', () => {
    expect(escapeRegex('(a)')).toBe('\\(a\\)')
  })

  it('應跳脫正則表達式特殊字元括號 []', () => {
    expect(escapeRegex('[a]')).toBe('\\[a\\]')
  })

  it('應跳脫正則表達式特殊字元 |', () => {
    expect(escapeRegex('a|b')).toBe('a\\|b')
  })

  it('應跳脫反斜線', () => {
    expect(escapeRegex('a\\b')).toBe('a\\\\b')
  })

  it('應同時跳脫多個特殊字元', () => {
    const result = escapeRegex('(test.case)+')
    expect(result).toBe('\\(test\\.case\\)\\+')
  })

  it('應跳脫後可安全用於 new RegExp()', () => {
    const text = 'hello (world) + test'
    const keyword = '(world) + test'
    const escaped = escapeRegex(keyword)
    const regex = new RegExp(escaped, 'gi')
    expect(text.match(regex)).toBeTruthy()
  })
})
