<script setup lang="ts">
import type { RowKey } from 'naive-ui/lib/data-table/src/interface'
import type { DataTableColumns, PaginationProps } from 'naive-ui'

const props = withDefaults(defineProps<{
  columns: DataTableColumns<any>
  data?: Record<string, any>[]
  loading?: boolean
  rowKey?: string
  paginateSinglePage?: boolean
  //
  title?: string
  cardSize?: 'small' | 'medium' | 'large'
}>(), {
  paginateSinglePage: true,
  title: ' ',
  cardSize: 'medium',
})

const pagination: PaginationProps = {
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
}

const selection = defineModel<RowKey[]>('selection')

const filterQuery = ref('')
const filteredData = computed(() => {
  if (!filterQuery.value)
    return props.data
  return props.data?.filter((row: Record<string, any>) => {
    return Object.values(row).some((value) => {
      return String(value).toLowerCase().includes(filterQuery.value.toLowerCase())
    })
  })
})

const columns = props.columns.map((column) => {
  if (column.type === 'selection' || column.type === 'expand')
    return column
  return {
    sorter: 'default',
    ...column,
  }
})
</script>

<template>
  <n-card v-bind="{ title, size: cardSize }">
    <template #header-extra>
      <n-input v-model:value="filterQuery" placeholder="Search...">
        <template #suffix>
          <n-icon>
            <i-search />
          </n-icon>
        </template>
      </n-input>
    </template>

    <slot />

    <n-scrollbar x-scrollable>
      <n-data-table v-bind="{ columns, data: filteredData, loading, paginateSinglePage, pagination }" :checked-row-keys="selection" class="min-w-max" :row-key="rowKey ? row => row[rowKey!] : undefined" @update:checked-row-keys="keys => selection = keys" />
    </n-scrollbar>
  </n-card>
</template>
