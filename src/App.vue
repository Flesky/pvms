<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'

import { useCookies } from '@vueuse/integrations/useCookies'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#87179d',
    primaryColorPressed: '#5b0f6a',
    primaryColorHover: '#a24ab2',
    primaryColorSuppl: '#a24ab2',
  },
}

axios.defaults.baseURL = import.meta.env.VITE_API_URL
const { get, addChangeListener } = useCookies(['access_token'])
axios.defaults.headers.common.Authorization = `Bearer ${get('access_token')}`
</script>

<template>
  <n-config-provider abstract v-bind="{ themeOverrides }">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
html, body, #app {
  @apply h-full
}
</style>
