<template>
  <section class="page page-shell" v-loading="loading">
    <div v-if="user" class="layout fade-up">
      <aside class="card glass">
        <img v-if="user.avatar" :src="user.avatar" class="avatar" alt="" />
        <div v-else class="avatar placeholder">{{ initials }}</div>
        <h1>{{ user.nickname || user.username }}</h1>
        <p>{{ user.email || '未绑定邮箱' }}</p>
        <p class="muted">ID · {{ user.userId }}</p>
      </aside>

      <div class="main">
        <section class="card glass">
          <h2>资料</h2>
          <form class="form" @submit.prevent="saveProfile">
            <label>
              <span>昵称</span>
              <input v-model.trim="form.nickname" />
            </label>
            <label>
              <span>简介</span>
              <input v-model.trim="form.bio" />
            </label>
            <label>
              <span>主页</span>
              <input v-model.trim="form.blog" />
            </label>
            <label>
              <span>地区</span>
              <input v-model.trim="form.location" />
            </label>
            <button class="primary" type="submit">保存</button>
          </form>
        </section>

        <section class="card glass">
          <div class="head">
            <h2>已绑定账号</h2>
            <span>{{ user.providers?.length || 0 }} 个</span>
          </div>
          <div v-if="user.providers?.length" class="bound">
            <div v-for="item in user.providers" :key="item.provider" class="bound-item">
              <div>
                <strong>{{ labelOf(item.provider) }}</strong>
                <p>{{ item.nickname || item.username || item.providerUserId }}</p>
              </div>
              <button class="danger" @click="onUnbind(item.provider)">解绑</button>
            </div>
          </div>
          <p v-else class="muted">还没有绑定第三方账号</p>
        </section>

        <section class="card glass">
          <h2>继续绑定</h2>
          <ProviderGrid :providers="bindable" @select="onBind" />
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProviderGrid from '../components/ProviderGrid.vue'
import { useSession } from '../composables/useSession'
import { getProviders, startOAuth, unbindProvider, updateProfile } from '../api/user'

const router = useRouter()
const { user, loading, refresh } = useSession()
const providers = ref([])
const form = reactive({
  nickname: '',
  bio: '',
  blog: '',
  location: ''
})

const initials = computed(() => (user.value?.nickname || user.value?.username || 'N').slice(0, 1).toUpperCase())
const boundIds = computed(() => new Set((user.value?.providers || []).map((item) => item.provider)))
const bindable = computed(() => providers.value.filter((item) => !boundIds.value.has(item.id)))

const labels = {
  github: 'GitHub',
  weibo: '微博',
  wechat: '微信',
  qq: 'QQ',
  feishu: '飞书',
  dingtalk: '钉钉',
  wecom: '企业微信',
  google: 'Google',
  gmail: 'Gmail',
  meta: 'Meta',
  instagram: 'Instagram',
  x: 'X',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  douyin: '抖音',
  bilibili: 'Bilibili',
  kuaishou: '快手',
  xiaohongshu: '小红书'
}

function labelOf(id) {
  return labels[id] || id
}

onMounted(async () => {
  const current = await refresh()
  if (!current) {
    router.push('/login')
    return
  }
  form.nickname = current.nickname || ''
  form.bio = current.bio || ''
  form.blog = current.blog || ''
  form.location = current.location || ''
  const res = await getProviders()
  providers.value = res.data.providers || []
})

async function saveProfile() {
  await updateProfile(form)
  await refresh()
  ElMessage.success('资料已保存')
}

function onBind(item) {
  if (!item.enabled) {
    ElMessage.warning(`${item.name} 尚未配置`)
    return
  }
  if (item.authType === 'otp' || item.id === 'whatsapp') {
    router.push({ path: '/login', query: { provider: 'whatsapp', mode: 'bind' } })
    return
  }
  startOAuth(item.id, {
    mode: 'bind',
    returnTo: `${window.location.origin}/#/profile`
  })
}

async function onUnbind(provider) {
  await ElMessageBox.confirm(`确认解绑 ${labelOf(provider)}？`, '解绑账号', { type: 'warning' })
  await unbindProvider(provider)
  await refresh()
  ElMessage.success('已解绑')
}
</script>

<style scoped>
.page {
  padding: 20px 0 40px;
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
}

.card {
  border-radius: var(--radius);
  padding: 20px;
}

aside {
  text-align: center;
  height: fit-content;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  object-fit: cover;
}

.avatar.placeholder {
  display: grid;
  place-items: center;
  margin: 0 auto;
  background: rgba(242, 193, 78, 0.2);
  font-family: var(--font-display);
  font-size: 2rem;
}

h1, h2 {
  font-family: var(--font-display);
}

h1 {
  margin: 14px 0 6px;
  font-size: 1.6rem;
}

h2 {
  margin: 0 0 14px;
  font-size: 1.3rem;
}

.muted, p {
  color: var(--ink-muted);
}

.main {
  display: grid;
  gap: 18px;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  color: var(--ink-muted);
}

input {
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.2);
  color: var(--ink);
  border-radius: 12px;
  padding: 11px 12px;
}

.primary, .danger {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
}

.primary {
  background: var(--accent);
  color: #1a1a12;
  width: fit-content;
}

.danger {
  background: rgba(255, 107, 107, 0.16);
  color: #ffd7d7;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bound {
  display: grid;
  gap: 10px;
}

.bound-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.16);
}

.bound-item p {
  margin: 4px 0 0;
}

@media (max-width: 900px) {
  .layout,
  .form {
    grid-template-columns: 1fr;
  }
}
</style>
