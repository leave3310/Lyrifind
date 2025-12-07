import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 設定 TanStack Query Client
app.use(VueQueryPlugin)

// 設定 Vue Router
app.use(router)

app.mount('#app')
