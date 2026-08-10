<template>
  <div class="grid">
    <button
      v-for="item in providers"
      :key="item.id"
      class="provider"
      :class="{ disabled: !item.enabled }"
      :disabled="!item.enabled || busy === item.id"
      :style="{ '--p': item.color }"
      @click="$emit('select', item)"
    >
      <span class="dot" aria-hidden="true"></span>
      <span class="meta">
        <strong>{{ item.name }}</strong>
        <small>{{ item.enabled ? item.description : '未配置 Client ID / Secret' }}</small>
      </span>
      <span class="badge">{{ badgeText(item) }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  providers: { type: Array, default: () => [] },
  busy: { type: String, default: '' }
})
defineEmits(['select'])

function badgeText(item) {
  if (!item.enabled) return '待配置'
  if (item.authType === 'otp') return 'OTP'
  if (item.authType === 'telegram') return 'Widget'
  return item.region === 'cn' ? '国内' : '国际'
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.provider {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
  color: var(--ink);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.provider:hover:not(:disabled) {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  border-color: color-mix(in srgb, var(--p) 55%, white);
}

.provider.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--p);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--p) 25%, transparent);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.meta strong {
  font-size: 0.98rem;
}

.meta small {
  color: var(--ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  font-size: 0.72rem;
  color: var(--ink-muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 8px;
}
</style>
