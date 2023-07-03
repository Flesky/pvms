<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import type { FormValidateMessages } from 'naive-ui/lib/form/src/interface'

defineProps<{
  model: Record<string, any>
}>()

const validateMessages: FormValidateMessages = {
  required: 'This field is required',
}

const form = ref<FormInst | null>(null)
defineExpose({ form })
</script>

<template>
  <n-form ref="form" label-align="left" label-placement="left" label-width="auto" v-bind="{ model, validateMessages }">
    <slot />
  </n-form>
</template>
