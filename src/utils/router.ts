import { createRouter, createWebHistory } from 'vue-router/auto'
import auth from '@/utils/auth'

const router = createRouter({
  extendRoutes: (routes) => {
    routes.map((route) => {
      route.meta.authName = 'main'
    })
    return routes
  },
  history: createWebHistory(),
})

auth.useRouter(router)

export default router
