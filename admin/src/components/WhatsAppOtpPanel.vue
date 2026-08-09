<template>
  <form class="otp glass" @submit.prevent="onVerify">
    <h3>WhatsApp 验证码登录</h3>
    <p class="hint">输入国际格式手机号（含国家码，如 8613812345678）</p>
    <label>
      <span>手机号</span>
      <input v-model.trim="phone" inputmode="tel" placeholder="8613812345678" required />
    </label>
    <label>
      <span>验证码</span>
      <div class="code-row">
        <input v-model.trim="code" inputmode="numeric" maxlength="6" placeholder="6 位验证码" required />
        <button type="button" class="ghost" :disabled="sending || countdown > 0" @click="onSend">
          {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
        </button>
      </div>
    </label>
    <p v-if="devCode" class="dev">开发环境验证码：{{ devCode }}</p>
    <div class="actions">
      <button class="primary" type="submit" :disabled="verifying">验证并登录</button>
      <button class="link" type="button" @click="$emit('cancel')">返回</button>
    </div>
  </form>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sendWhatsAppOtp, verifyWhatsAppOtp } from '../api/user'

const props = defineProps({
  state: { type: String, default: '' },
  mode: { type: String, default: 'login' }
})
const emit = defineEmits(['success', 'cancel'])

const phone = ref('')
const code = ref('')
const state = ref(props.state || '')
const sending = ref(false)
const verifying = ref(false)
const countdown = ref(0)
const devCode = ref('')
let timer = null

function startCountdown() {
  countdown.value = 60
  clearInterval(timer)
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function onSend() {
  sending.value = true
  try {
    const res = await sendWhatsAppOtp({
      phone: phone.value,
      state: state.value,
      mode: props.mode,
      return_to: `${window.location.origin}/#/`
    })
    state.value = res.data.state
    devCode.value = res.data.devCode || ''
    startCountdown()
    ElMessage.success('验证码已发送')
  } finally {
    sending.value = false
  }
}

async function onVerify() {
  verifying.value = true
  try {
    const res = await verifyWhatsAppOtp({
      phone: phone.value,
      code: code.value,
      state: state.value
    })
    ElMessage.success('登录成功')
    emit('success', res.data)
  } finally {
    verifying.value = false
  }
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.otp {
  margin-top: 18px;
  border-radius: var(--radius);
  padding: 18px;
  display: grid;
  gap: 12px;
}

h3 {
  margin: 0;
  font-family: var(--font-display);
}

.hint, .dev {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.dev {
  color: var(--accent);
}

label {
  display: grid;
  gap: 6px;
  color: var(--ink-muted);
}

input {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.22);
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 14px;
}

.code-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.primary, .ghost, .link {
  border-radius: 999px;
  cursor: pointer;
}

.primary {
  border: 0;
  background: var(--accent);
  color: #1a1a12;
  padding: 11px 18px;
  font-weight: 700;
}

.ghost {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  padding: 0 14px;
}

.link {
  border: 0;
  background: transparent;
  color: var(--ink-muted);
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
