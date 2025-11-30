/**
 * SearchBar 元件單元測試
 * @description 測試搜尋輸入框元件的行為
 */
import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

import SearchBar from '../components/SearchBar.vue'

describe('SearchBar', () => {
  it('應該渲染搜尋輸入框', () => {
    const wrapper = mount(SearchBar)

    const input = wrapper.find('[data-testid="search-input"]')
    expect(input.exists()).toBe(true)
  })

  it('應該渲染搜尋按鈕', () => {
    const wrapper = mount(SearchBar)

    const button = wrapper.find('[data-testid="search-button"]')
    expect(button.exists()).toBe(true)
  })

  it('應該顯示 placeholder 文字', () => {
    const wrapper = mount(SearchBar, {
      props: {
        placeholder: '搜尋歌曲、歌手或歌詞...',
      },
    })

    const input = wrapper.find('[data-testid="search-input"]')
    expect(input.attributes('placeholder')).toBe('搜尋歌曲、歌手或歌詞...')
  })

  it('輸入文字時應更新 v-model', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e }),
      },
    })

    const input = wrapper.find('[data-testid="search-input"]')
    await input.setValue('周杰倫')

    expect(wrapper.props('modelValue')).toBe('周杰倫')
  })

  it('點擊搜尋按鈕應觸發 search 事件', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '測試關鍵字',
      },
    })

    const button = wrapper.find('[data-testid="search-button"]')
    await button.trigger('click')

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['測試關鍵字'])
  })

  it('按下 Enter 鍵應觸發 search 事件', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '測試關鍵字',
      },
    })

    const input = wrapper.find('[data-testid="search-input"]')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('空白關鍵字時搜尋按鈕應被禁用', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
      },
    })

    const button = wrapper.find('[data-testid="search-button"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('只有空格的關鍵字時搜尋按鈕應被禁用', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '   ',
      },
    })

    const button = wrapper.find('[data-testid="search-button"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('載入中時應禁用搜尋按鈕', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '測試',
        loading: true,
      },
    })

    const button = wrapper.find('[data-testid="search-button"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('應該支援初始值', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '初始關鍵字',
      },
    })

    const input = wrapper.find('[data-testid="search-input"]')
    expect((input.element as HTMLInputElement).value).toBe('初始關鍵字')
  })

  it('輸入有效關鍵字後搜尋按鈕應啟用', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e }),
      },
    })

    // 空關鍵字時按鈕被禁用
    const button = wrapper.find('[data-testid="search-button"]')
    expect(button.attributes('disabled')).toBeDefined()

    // 輸入有效關鍵字
    const input = wrapper.find('[data-testid="search-input"]')
    await input.setValue('有效關鍵字')

    // 按鈕應該啟用
    expect(button.attributes('disabled')).toBeUndefined()
  })
})
