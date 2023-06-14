import { createRouter, createWebHistory } from 'vue-router/auto'
import { useCookies } from '@vueuse/integrations/useCookies'

const router = createRouter({
  history: createWebHistory(),
})

router.beforeEach((to, from, next) => {
  const { get } = useCookies(['access_token'])
  if (to.meta.requiresAuth && get('access_token') === undefined)
    next({ path: '/login' })
  else
    next()
})

export default router
