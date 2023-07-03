<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  loading?: boolean
  tabs?: {
    default: string
    key: string
  }
  title: string
}>()

const show = defineModel<boolean>('show')
const activeTab = ref(props.tabs ? localStorage.getItem(`modal-${props.tabs.key}-tab`) || props.tabs.default : undefined)
watch(activeTab, (value) => {
  localStorage.setItem(`modal-${props.tabs!.key}-tab`, value!)
})
</script>

<template>
  <n-modal v-model:show="show" class="max-w-screen-sm" header-style="text-align: center;" preset="card" segmented size="small" v-bind="{ title }">
    <n-spin :show="loading">
      <template v-if="!!tabs">
        <n-tabs v-model:value="activeTab" class="-mt-2" pane-class="mt-2" type="line">
          <slot />
        </n-tabs>
      </template>
      <template v-else>
        <slot />
      </template>
    </n-spin>

    <template #action>
      <slot v-if="!!tabs" name="action" :tab="activeTab" />
      <slot v-else name="action" />
    </template>
  </n-modal>
</template>
