<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  id: string
  loading?: boolean

  defaultTab?: string
  title: string
}>()

const show = defineModel<boolean>('show')
const activeTab = ref((localStorage.getItem(`modal-${props.id}-tab`) ?? props.defaultTab) || undefined)
watch(activeTab, (value) => {
  localStorage.setItem(`modal-${props.id}-tab`, value!)
})
</script>

<template>
  <n-modal v-model:show="show" class="max-w-screen-sm" header-style="text-align: center;" preset="card" segmented size="small" v-bind="{ title }">
    <n-spin :show="loading">
      <template v-if="defaultTab">
        <n-tabs v-model:value="activeTab" class="-mt-2" pane-class="mt-2" type="line">
          <slot />
        </n-tabs>
      </template>
      <template v-else>
        <slot />
      </template>
    </n-spin>

    <template #action>
      <slot v-if="defaultTab" name="action" :tab="activeTab" />
      <slot v-else name="action" />
    </template>
  </n-modal>
</template>
