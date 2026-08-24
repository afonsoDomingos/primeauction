import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { guestOnly: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPassword.vue'), meta: { guestOnly: true } },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('../views/ResetPassword.vue'), meta: { guestOnly: true } },
  { path: '/auctions', name: 'Auctions', component: () => import('../views/Auctions.vue') },
  { path: '/auction/:id', name: 'AuctionDetail', component: () => import('../views/AuctionDetail.vue') },
  { path: '/calendario', name: 'Calendar', component: () => import('../views/Calendar.vue') },
  {
    path: '/vender',
    name: 'SellWithUs',
    component: () => import('../views/SellWithUs.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/analytics',
    name: 'AnalyticsDashboard',
    component: () => import('../views/AnalyticsDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'UserDashboard',
    component: () => import('../views/UserDashboard.vue'),
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
