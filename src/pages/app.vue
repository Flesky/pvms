<script setup lang="tsx">
definePage({
  path: '/',
})
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header bordered class="flex h-14 items-center !bg-primary px-4">
      <img class="w-24 object-contain" src="/pivotel-logo.png">
      <app-menu class="ml-2" />
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
