<script setup lang="tsx">
definePage({
  path: '/',
  meta: {
    requiresAuth: true,
  },
})

const router = useRouter()

axios.interceptors.response.use(
  response => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('access_token')
      router.push('/login')
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
    <n-layout-header bordered class="flex h-14 items-center justify-between !bg-primary px-4 font-medium">
      <div class="flex gap-4">
        <img class="w-24 object-contain" src="/pivotel-logo.png">
        <app-menu />
      </div>
      <n-button
        type="tertiary"
        @click="handleLogout"
      >
        Log out
      </n-button>
    </n-layout-header>
    <n-layout class="!top-14 h-full" embedded position="absolute">
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
