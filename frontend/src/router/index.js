import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Auctions from '../views/Auctions.vue'
import AuctionDetail from '../views/AuctionDetail.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UserDashboard from '../views/UserDashboard.vue'
import SellWithUs from '../views/SellWithUs.vue'
import Calendar from '../views/Calendar.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },
  { path: '/auctions', name: 'Auctions', component: Auctions },
  { path: '/auction/:id', name: 'AuctionDetail', component: AuctionDetail },
  { path: '/calendario', name: 'Calendar', component: Calendar },
  {
    path: '/vender',
    name: 'SellWithUs',
    component: SellWithUs,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ---------------------------------------------------------------------------
// Navigation Guards
// ---------------------------------------------------------------------------
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  let userRole = null
  if (token) {
    try {
      // Role is cached in localStorage by authStore on every login/fetchUser.
      // We do not decode the JWT here because the token payload only holds { id, iat, exp }.
      userRole = localStorage.getItem('userRole')
    } catch {
      // Corrupted storage — treat as unauthenticated
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    }
  }

  const isAuthenticated = !!token
  const isAdmin = userRole === 'admin'

  // 1. Guest-only routes (login / register) — redirect to home if already logged in
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'Home' })
  }

  // 2. Routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 3. Admin-only routes — redirect regular users to home
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
