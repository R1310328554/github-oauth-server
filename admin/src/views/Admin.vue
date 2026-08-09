<template>
  <section class="page page-shell" v-loading="loading">
    <div class="head fade-up">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>用户与登录渠道</h1>
      </div>
      <div class="search">
        <input v-model.trim="q" placeholder="搜索用户名 / 邮箱 / ID" @keyup.enter="loadUsers" />
        <button @click="loadUsers">搜索</button>
      </div>
    </div>

    <div class="stats fade-up-delay">
      <article class="glass">
        <strong>{{ stats.totalUsers || 0 }}</strong>
        <span>注册用户</span>
      </article>
      <article v-for="item in stats.providers || []" :key="item.provider" class="glass">
        <strong>{{ item.count }}</strong>
        <span>{{ item.provider }}</span>
      </article>
    </div>

    <div class="table-wrap glass fade-up">
      <el-table :data="list" style="width: 100%" empty-text="暂无数据或无管理员权限">
        <el-table-column prop="userId" label="User ID" min-width="160" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column label="绑定渠道" min-width="180">
          <template #default="{ row }">
            <span class="tags">
              <em v-for="p in row.providers || []" :key="p.provider">{{ p.provider }}</em>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最近登录" min-width="170">
          <template #default="{ row }">
            {{ formatDate(row.lastLoginDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" />
      </el-table>
      <div class="pager">
        <button :disabled="page <= 1" @click="page--; loadUsers()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 人</span>
        <button :disabled="page * pageSize >= total" @click="page++; loadUsers()">下一页</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUsers, getUserStats } from '../api/user'
import { useSession } from '../composables/useSession'

const router = useRouter()
const { user, refresh } = useSession()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const q = ref('')
const stats = reactive({ totalUsers: 0, providers: [] })

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await getAllUsers({ page: page.value, pageSize, q: q.value })
    list.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await getUserStats()
    stats.totalUsers = res.data.totalUsers
    stats.providers = res.data.providers || []
  } catch (e) {
    // non-admin users will fail here; table may also fail
  }
}

onMounted(async () => {
  const current = await refresh()
  if (!current) {
    router.push('/login')
    return
  }
  await Promise.all([loadUsers(), loadStats()])
})
</script>

<style scoped>
.page {
  padding: 18px 0 40px;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

h1 {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

.search {
  display: flex;
  gap: 8px;
}

search input,
.search button,
.pager button {
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.2);
  color: var(--ink);
  padding: 10px 14px;
}

.search button,
.pager button {
  cursor: pointer;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stats article {
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 6px;
}

.stats strong {
  font-family: var(--font-display);
  font-size: 1.6rem;
}

.stats span {
  color: var(--ink-muted);
  font-size: 0.85rem;
}

.table-wrap {
  border-radius: var(--radius);
  padding: 12px;
  overflow: hidden;
}

.table-wrap :deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 0, 0, 0.18);
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.06);
  --el-table-text-color: var(--ink);
  --el-table-header-text-color: var(--ink-muted);
  --el-table-border-color: var(--line);
  background: transparent;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags em {
  font-style: normal;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 12px 4px 4px;
  color: var(--ink-muted);
}
</style>
