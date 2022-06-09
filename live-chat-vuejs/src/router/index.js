import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../views/WelcomePage'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
