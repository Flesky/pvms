<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import type { FormValidateMessages } from 'naive-ui/lib/form/src/interface'

interface Props {
  model: Record<string, any>
  showFeedback?: boolean
}

withDefaults(defineProps<Props>(), {
  showFeedback: true,
})

const validateMessages: FormValidateMessages = {
  required: 'This field is required',
}

const form = ref<FormInst | null>(null)
defineExpose({ form })
</script>

<template>
  <div class="@container">
    <n-form ref="form" class="grid grid-cols-6 gap-x-2 @3xl:grid-cols-12" v-bind="{ model, validateMessages, showFeedback }">
      <slot />
    </n-form>
  </div>
</template>
