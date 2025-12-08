import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 分鐘
        gcTime: 10 * 60 * 1000, // 10 分鐘
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  },
})

app.use(router)

app.mount('#app')
