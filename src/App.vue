<script setup lang="ts">
/**
 * 應用程式根元件
 * @description 提供全域佈局與路由出口
 */
import { computed } from 'vue'

import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/AppHeader.vue'

const router = useRouter()

function handleBack() {
  router.back()
}

const showBack = computed(() => {
  return router.currentRoute.value.name !== 'Home'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader :show-back="showBack" @back="handleBack" />
    <main class="mx-auto max-w-4xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
