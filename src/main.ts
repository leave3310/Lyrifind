/**
 * 應用程式入口點
 * @description 初始化 Vue 應用程式與所有外掛
 */
import { createApp } from 'vue'

import { createHead } from '@unhead/vue/client'

import router from '@/router'

import App from './App.vue'
import './style.css'

/** 建立 Vue 應用程式實例 */
const app = createApp(App)

/** 建立 Unhead 實例（SEO 管理） */
const head = createHead()

/** 註冊外掛 */
app.use(router)
app.use(head)

/** 掛載應用程式 */
app.mount('#app')
