<script setup lang="tsx">
import type { MenuOption } from 'naive-ui'

function renderLink(to: string, label: string) {
  return () => <router-link to={to}>{label}</router-link>
}

const options: MenuOption[] = [
  {
    label: renderLink('/', 'Vouchers'),
    key: 'Vouchers',
    icon: () => <i-ticket />,
  },
  {
    label: renderLink('/add', 'Add Voucher'),
    key: 'Add',
  },
  {
    label: renderLink('/history', 'History'),
    key: 'History',
  },
]
</script>

<template>
  <n-menu
    inverted
    mode="horizontal"
    v-bind="{ options }" :value="$route.name"
  />
</template>

<style>
.n-menu-item-content__icon {
  @apply !mr-3
}

.router-link-exact-active {
  @apply font-bold
}
</style>
