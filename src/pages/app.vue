<script setup lang="tsx">
definePage({
  path: '/',
  meta: {
    requiresAuth: true,
  },
})

const router = useRouter()
const message = useMessage()
const collapsed = useLocalStorage('collapsed', false)

axios.interceptors.response.use(
  response => response,
  (error) => {
    switch (error.response.status) {
      case 400:
      case 422:
        Object.values(error.response.data.errors).forEach(errors => errors.forEach(error => message.error(error)))
        break
      case 401:
        localStorage.removeItem('access_token')
        router.push('/login')
        break
    }

    return Promise.reject(error)
  },
)

function handleLogout() {
  localStorage.removeItem('access_token')
  router.push('/login')
}
</script>

<template>
  <n-layout class="inset-0 h-full" position="absolute">
    <n-layout-header bordered class="flex h-14 items-center justify-between !bg-primary" inverted>
      <div class="flex h-full items-center">
        <app-header-item @click="collapsed = !collapsed">
          <i-menu-2 v-if="collapsed" class="h-6 w-6" />
          <i-x v-else class="h-6 w-6" />
        </app-header-item>
        <img class="ml-2 w-24 object-contain" src="/pivotel-logo.png">
      </div>
      <n-button class="!mr-4" color="ffffff" quaternary>
        Log out
      </n-button>
    </n-layout-header>
    <n-layout class="!mt-14" has-sider position="absolute">
      <app-sider v-bind="{ collapsed }" />
      <n-layout class="@container" embedded>
        <router-view v-slot="{ Component }">
          <transition name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout>
    </n-layout>
  </n-layout>
<!--  <n-layout position="absolute"> -->
<!--    <n-layout-header bordered class="flex h-14 items-center justify-between !bg-primary px-4"> -->
<!--      <div class="flex"> -->
<!--        <img class="w-24 object-contain" src="/pivotel-logo.png"> -->
<!--        <app-menu class="ml-2" /> -->
<!--      </div> -->
<!--      <app-header-item -->
<!--        class="text-white" -->
<!--        @click="handleLogout" -->
<!--      > -->
<!--        Log out -->
<!--      </app-header-item> -->
<!--    </n-layout-header> -->
<!--    <n-layout class="@container !top-14" embedded position="absolute"> -->
<!--      <router-view v-slot="{ Component }"> -->
<!--        <transition name="fade"> -->
<!--          <component :is="Component" /> -->
<!--        </transition> -->
<!--      </router-view> -->
<!--    </n-layout> -->
<!--  </n-layout> -->
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  @apply transition duration-300 absolute;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0
}

.fade-enter-from {
  @apply translate-x-8
}

.fade-leave-to {
  @apply -translate-x-8
}
</style>
