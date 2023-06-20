import { createRouter, createWebHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(),
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && localStorage.getItem('access_token') === undefined)
    next({ path: '/login' })
  else
    next()
})

export default router
