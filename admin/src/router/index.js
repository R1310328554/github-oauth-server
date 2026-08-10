import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/profile', name: 'Profile', component: Profile, meta: { auth: true } },
  { path: '/admin', name: 'Admin', component: Admin, meta: { auth: true, admin: true } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
