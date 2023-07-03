<script setup lang="tsx">
definePage({
  path: '/',
  meta: {
    requiresAuth: true,
  },
})

const router = useRouter()
const message = useMessage()

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
  <n-layout position="absolute">
    <n-layout-header bordered class="flex h-14 items-center justify-between !bg-primary px-4">
      <div class="flex">
        <img class="w-24 object-contain" src="/pivotel-logo.png">
        <app-menu class="ml-2" />
      </div>
      <app-header-item
        class="text-white"
        @click="handleLogout"
      >
        Log out
      </app-header-item>
    </n-layout-header>
    <n-layout class="!top-14" embedded position="absolute">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </n-layout>
  </n-layout>
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
