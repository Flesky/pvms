<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#87179d',
    primaryColorPressed: '#5b0f6a',
    primaryColorHover: '#a24ab2',
    primaryColorSuppl: '#a24ab2',
  },
}
</script>

<template>
  <n-config-provider v-bind="{ themeOverrides }">
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
