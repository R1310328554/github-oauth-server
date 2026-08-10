<template>
  <section class="login page-shell">
    <div class="stage fade-up">
      <p class="brand-line">Nexus Auth</p>
      <h1>用你熟悉的账号，安全进入</h1>
      <p class="sub">支持国内外主流社交平台登录，也可使用本地账号。WhatsApp 使用手机号验证码。</p>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

      <WhatsAppOtpPanel
        v-if="showWhatsApp"
        :state="whatsappState"
        mode="login"
        @success="onWhatsAppSuccess"
        @cancel="showWhatsApp = false"
      />

      <template v-else>
        <ProviderGrid
          class="fade-up-delay"
          :providers="providers"
          :busy="busyProvider"
          @select="onProvider"
        />

        <div class="divider"><span>或使用本地账号</span></div>

        <form class="local glass" @submit.prevent="onSubmit">
          <label>
            <span>用户名</span>
            <input v-model.trim="form.username" autocomplete="username" required />
          </label>
          <label>
            <span>密码</span>
            <input v-model="form.password" type="password" autocomplete="current-password" required minlength="8" />
          </label>
          <div class="row">
            <button class="primary" type="submit" :disabled="loading">
              {{ mode === 'login' ? '登录' : '注册并登录' }}
            </button>
            <button class="link" type="button" @click="toggleMode">
              {{ mode === 'login' ? '没有账号？注册' : '已有账号？登录' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProviderGrid from '../components/ProviderGrid.vue'
import WhatsAppOtpPanel from '../components/WhatsAppOtpPanel.vue'
import { getProviders, loginSelf, registerSelf, startOAuth } from '../api/user'
import { useSession } from '../composables/useSession'

const route = useRoute()
const router = useRouter()
const { refresh } = useSession()

const providers = ref([])
const busyProvider = ref('')
const loading = ref(false)
const mode = ref('login')
const errorMsg = ref('')
const showWhatsApp = ref(false)
const whatsappState = ref('')
const form = reactive({
  username: '',
  password: ''
})

onMounted(async () => {
  if (route.query.error) {
    errorMsg.value = String(route.query.error)
  }
  if (route.query.provider === 'whatsapp') {
    showWhatsApp.value = true
    whatsappState.value = String(route.query.state || '')
  }
  try {
    const res = await getProviders()
    providers.value = res.data.providers || []
  } catch (e) {
    providers.value = []
  }
})

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}

function onProvider(item) {
  if (!item.enabled) {
    ElMessage.warning(`${item.name} 尚未配置，请在服务端 .env 中填写密钥`)
    return
  }
  if (item.authType === 'otp' || item.id === 'whatsapp') {
    showWhatsApp.value = true
    whatsappState.value = ''
    return
  }
  busyProvider.value = item.id
  startOAuth(item.id, {
    mode: 'login',
    returnTo: `${window.location.origin}/#/`
  })
}

async function onWhatsAppSuccess() {
  await refresh()
  router.push('/')
}

async function onSubmit() {
  loading.value = true
  errorMsg.value = ''
  try {
    if (mode.value === 'login') {
      await loginSelf(form)
    } else {
      await registerSelf(form)
    }
    await refresh()
    ElMessage.success(mode.value === 'login' ? '登录成功' : '注册成功')
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  padding: 24px 0 60px;
}

.stage {
  width: min(860px, 100%);
  margin: 0 auto;
}

.brand-line {
  margin: 0;
  font-family: var(--font-display);
  color: var(--accent);
  font-size: 1.4rem;
}

h1 {
  margin: 8px 0 10px;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.1;
  max-width: 14ch;
}

.sub {
  color: var(--ink-muted);
  margin: 0 0 24px;
  max-width: 40rem;
}

.error {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.35);
  color: #ffd7d7;
}

.divider {
  display: grid;
  place-items: center;
  margin: 28px 0 18px;
  color: var(--ink-muted);
  position: relative;
}

.divider::before {
  content: "";
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: var(--line);
}

.divider span {
  position: relative;
  padding: 0 12px;
  background: transparent;
  backdrop-filter: blur(8px);
}

.local {
  border-radius: var(--radius);
  padding: 18px;
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  color: var(--ink-muted);
  font-size: 0.92rem;
}

input {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.22);
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
}

input:focus {
  border-color: color-mix(in srgb, var(--accent) 60%, white);
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.primary {
  border: 0;
  background: var(--accent);
  color: #1a1a12;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 700;
  cursor: pointer;
}

.link {
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  cursor: pointer;
}
</style>
