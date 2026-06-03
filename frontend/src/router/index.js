import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Auctions from '../views/Auctions.vue'
import AuctionDetail from '../views/AuctionDetail.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UserDashboard from '../views/UserDashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/auctions', name: 'Auctions', component: Auctions },
  { path: '/auction/:id', name: 'AuctionDetail', component: AuctionDetail },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/profile', name: 'UserDashboard', component: UserDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
