<script setup lang="tsx">
definePage({
  path: '/',
})

const collapsed = useLocalStorage('collapsed', false)
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header bordered class="flex h-14 items-center justify-between px-4 font-medium">
      <div class="flex gap-4">
        <img class="w-24" src="/logo.svg">
        <app-menu v-bind="{ collapsed }" />
      </div>
      <app-header-item class="gap-2">
        <n-avatar circle />
        Baron
      </app-header-item>
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
