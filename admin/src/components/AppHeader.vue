<template>
  <header class="header page-shell">
    <router-link to="/" class="brand">
      <span class="mark" aria-hidden="true"></span>
      <span class="name">Nexus Auth</span>
    </router-link>
    <nav class="nav">
      <router-link to="/">首页</router-link>
      <router-link v-if="user" to="/profile">账户</router-link>
      <router-link v-if="isAdmin" to="/admin">管理</router-link>
      <router-link v-if="!user" to="/login" class="cta">登录</router-link>
      <button v-else class="ghost" @click="onLogout">退出</button>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../composables/useSession'

const router = useRouter()
const { user, logout } = useSession()
const isAdmin = computed(() => [1, 2].includes(Number(user.value?.status)))

async function onLogout() {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 8px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background:
    radial-gradient(circle at 30% 30%, #f2c14e, transparent 55%),
    linear-gradient(145deg, #155e63, #071a1b);
  box-shadow: 0 0 0 1px rgba(242, 193, 78, 0.35);
  animation: pulseGlow 4s ease-in-out infinite;
}

.name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--ink-muted);
}

.nav a:hover,
.nav a.router-link-active {
  color: var(--ink);
}

.cta {
  color: #132;
  background: var(--accent);
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
}

.ghost {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

@media (max-width: 640px) {
  .nav {
    gap: 10px;
    font-size: 0.92rem;
  }
  .name {
    font-size: 1.15rem;
  }
}
</style>
