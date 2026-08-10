import { ref } from 'vue'
import Cookies from 'js-cookie'
import { getUserInfo, logout as apiLogout } from '../api/user'

const user = ref(null)
const loading = ref(false)
const ready = ref(false)

export function useSession() {
  async function refresh() {
    loading.value = true
    try {
      // Auth cookie is httpOnly — always probe the API instead of reading document.cookie.
      const res = await getUserInfo()
      user.value = res.data
      return user.value
    } catch (error) {
      user.value = null
      return null
    } finally {
      loading.value = false
      ready.value = true
    }
  }

  async function logout() {
    try {
      await apiLogout()
    } catch (e) {
      // ignore network errors during logout
    }
    Cookies.remove('nexus_auth_token')
    Cookies.remove('aimee-test-token')
    Cookies.remove('thirdType')
    user.value = null
  }

  return {
    user,
    loading,
    ready,
    refresh,
    logout
  }
}
