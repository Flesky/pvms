<script setup lang="ts">
import type { FormItemRule } from 'naive-ui'
import { breakpointsTailwind } from '@vueuse/core'
import type { FormFeedback, FormItem, FormSchema } from '@/components/app/form/types'

defineProps<{
  feedback?: FormFeedback
  schema: FormSchema
}>()
const modelValue = defineModel<Record<string, any>>({ required: true })

const isSm = useBreakpoints(breakpointsTailwind).smaller('md')
function getSpan(span?: number) {
  if (isSm && typeof span === 'number' && span > 6)
    return 'grid-column: 1 / -1'

  return `grid-column: span ${span || 6} / span ${span || 6}`
}

function getRules(item: FormItem) {
  const rules = ('rules' in item ? Array.isArray(item.rules) ? item.rules : [item.rules] : []) as FormItemRule[]

  if ('required' in item && item.required)
    rules.push({ required: true })
  if (item.type === 'time') {
    rules.push({
      validator: (rule, value) => {
        if (!value)
          return
        return new Promise<void>((resolve, reject) => {
          if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(value))
            reject(new Error('Invalid time format'))
          else
            resolve()
        })
      },
    })
  }
  return rules
}
</script>

<template>
  <template v-for="[path, item] in Object.entries(schema)" :key="path">
    <n-form-item v-if="item.type !== 'space'" :label="item.label" :path="path" :rule="getRules(item)" :show-label="!!item.label" :style="getSpan(item.span)" :validation-status="feedback && feedback[path] ? 'error' : undefined">
      <template v-if="feedback && feedback[path]" #feedback>
        <div v-for="(message, i) in feedback[path]" :key="i">
          {{ message }}
        </div>
      </template>

      <n-checkbox v-if="item.type === 'checkbox'" v-model:checked="modelValue[path]" :label="item.content" />

      <n-date-picker v-else-if="item.type === 'date'" v-model:formatted-value="modelValue[path]" :clearable="!item.required" :placeholder="item.placeholder || 'YYYY-MM-DD'" value-format="yyyy-MM-dd" />

      <n-input v-else-if="item.type === 'input'" v-model:value="modelValue[path]" :class="item.mono && 'font-mono'" :clearable="!item.required" :placeholder="item.placeholder || ''">
        <template v-if="item.prefix" #prefix>
          {{ item.prefix }}
        </template>
        <template v-if="item.suffix" #suffix>
          {{ item.suffix }}
        </template>
      </n-input>

      <n-input-number v-else-if="item.type === 'number'" v-model:value="modelValue[path]" :clearable="!item.required" :max="item.max" :min="item.min" :placeholder="item.placeholder || ''" :show-button="item.buttons || false">
        <template v-if="item.prefix" #prefix>
          {{ item.prefix }}
        </template>
        <template v-if="item.suffix" #suffix>
          {{ item.suffix }}
        </template>
      </n-input-number>

      <n-radio-group v-else-if="item.type === 'radio'" v-model:value="modelValue[path]">
        <n-space>
          <n-radio v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" />
        </n-space>
      </n-radio-group>

      <n-select v-else-if="item.type === 'select'" v-model:value="modelValue[path]" :clearable="!item.required" filterable :multiple="item.multiple" :options="item.options" :placeholder="item.placeholder || ''" :tag="item.custom" />

      <n-input v-else-if="item.type === 'textarea'" v-model:value="modelValue[path]" :class="item.mono && 'font-mono'" :clearable="!item.required" :placeholder="item.placeholder || ''" type="textarea" />

      <n-input v-else-if="item.type === 'time'" v-model:value="modelValue[path]" :clearable="!item.required" :placeholder="item.placeholder || 'eg. 12:51 PM'" />
    </n-form-item>

    <div v-else :style="getSpan(item.span)" />
  </template>
</template>
