<template>
  <section class="hero page-shell">
    <div class="copy fade-up">
      <p class="eyebrow">统一身份 · 多平台接入</p>
      <h1>Nexus Auth</h1>
      <p class="lead">
        一套安全的 OAuth2 登录中枢，覆盖微博、微信、抖音、B站、GitHub、Google、Meta 等主流社交账号。
      </p>
      <div class="actions">
        <router-link v-if="!user" class="primary" to="/login">开始登录</router-link>
        <router-link v-else class="primary" to="/profile">查看账户</router-link>
        <router-link class="secondary" to="/admin">管理后台</router-link>
      </div>
    </div>
    <div class="visual fade-up-delay" aria-hidden="true">
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
      <div class="panel glass">
        <div class="row" v-for="p in preview" :key="p">
          <span class="chip"></span>
          <span>{{ p }}</span>
        </div>
      </div>
    </div>
  </section>

  <section v-if="user" class="welcome page-shell glass fade-up">
    <img v-if="user.avatar" :src="user.avatar" alt="" class="avatar" />
    <div>
      <h2>你好，{{ user.nickname || user.username }}</h2>
      <p>已绑定 {{ user.providers?.length || 0 }} 个第三方账号 · 最近登录 {{ formatDate(user.lastLoginDate) }}</p>
    </div>
  </section>
</template>

<script setup>
import { useSession } from '../composables/useSession'

const { user } = useSession()
const preview = ['GitHub', '微信', '飞书', '钉钉', 'QQ', 'X', 'Telegram', 'WhatsApp']

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}
</script>

<style scoped>
.hero {
  min-height: calc(100vh - 120px);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
  padding-top: 28px;
}

.eyebrow {
  color: var(--accent);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.78rem;
  margin: 0 0 12px;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5.4rem);
  line-height: 0.95;
  margin: 0 0 18px;
}

.lead {
  color: var(--ink-muted);
  font-size: 1.12rem;
  max-width: 34rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.primary,
.secondary {
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 600;
}

.primary {
  background: var(--accent);
  color: #1a1a12;
}

.secondary {
  border: 1px solid var(--line);
  color: var(--ink);
}

.visual {
  position: relative;
  min-height: 360px;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  animation: drift 6s ease-in-out infinite;
}

.orb-a {
  width: 220px;
  height: 220px;
  right: 10%;
  top: 8%;
  background: rgba(242, 193, 78, 0.28);
}

.orb-b {
  width: 180px;
  height: 180px;
  left: 8%;
  bottom: 8%;
  background: rgba(61, 207, 142, 0.22);
  animation-delay: 0.8s;
}

.panel {
  position: absolute;
  inset: 18% 12%;
  border-radius: var(--radius);
  padding: 22px;
  display: grid;
  gap: 12px;
  align-content: center;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
}

.chip {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
}

.welcome {
  margin-top: 8px;
  border-radius: var(--radius);
  padding: 20px 22px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
}

.welcome h2 {
  margin: 0 0 6px;
  font-family: var(--font-display);
}

.welcome p {
  margin: 0;
  color: var(--ink-muted);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-bottom: 40px;
  }
  .visual {
    min-height: 280px;
  }
}
</style>
