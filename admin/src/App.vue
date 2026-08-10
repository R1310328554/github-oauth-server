<template>
  <div class="app">
    <AppHeader />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import { useSession } from './composables/useSession'

const { refresh } = useSession()
onMounted(() => {
  refresh()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding-bottom: 48px;
}
</style>
