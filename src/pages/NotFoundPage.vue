<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p class="text-2xl text-gray-600 mb-8">找不到此頁面</p>
      <router-link
        to="/search"
        class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        返回搜尋
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Not Found 頁面
</script>
