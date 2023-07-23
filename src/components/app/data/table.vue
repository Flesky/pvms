<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { RowKey } from 'naive-ui/lib/data-table/src/interface'
import type { DataFilters } from '@/components/app/data/wrapper.vue'

const props = defineProps<{
  id: string
  title?: string

  data?: Record<string, any>[]
  columns: DataTableColumns<any>
  loading?: boolean
  refresh?: () => void

  filterOptions?: DataFilters

  rowKey?: (row: Record<string, any>) => string

  totalPage?: number
}>()

const current = defineModel<number>('current')
const pageSize = defineModel<number>('pageSize')
const filters = defineModel<Record<string, any>>('filters')
const selection = defineModel<RowKey[]>('selection', { local: true, default: [] })

// Filter out non-data columns.
const columnOptions = props.columns.filter(column => !('type' in column)).map((column) => {
  return {
    // @ts-expect-error Non-data columns are already filtered out
    label: column.title,
    // @ts-expect-error Non-data columns are already filtered out
    value: column.key,
  }
})

// Save shown columns to local storage.
const shownColumns = useLocalStorage<Array<string | number>>(`${props.id}-shown-columns`, columnOptions.map(column => column.value))

// Apply default sorter.
// Add "sorter: false" to disable, particularly for action columns.
const columns = computed(() => {
  return props.columns.filter(column => 'type' in column || shownColumns.value.includes(column.key)).map(column => 'type' in column
    ? column
    : {
        sorter: 'default',
        ...column,
      },
  )
})
</script>

<template>
  <app-data-wrapper v-model:current="current" v-model:filters="filters" v-model:page-size="pageSize" v-bind="{ id, title, data, loading, refresh, filterOptions, totalPage }" size-picker>
    <template #action>
      <slot name="action" />
    </template>

    <template #default="{ processedData }">
      <n-collapse-transition class="mb-3" :show="!!selection.length">
        <n-alert :show-icon="false" type="info">
          <n-space align="center" justify="space-between">
            <n-space align="center">
              <div>{{ selection.length }} selected</div>
              <n-button text type="info" @click="selection = []">
                Clear
              </n-button>
            </n-space>
            <slot name="selectionAction" :selection="selection" />
          </n-space>
        </n-alert>
      </n-collapse-transition>

      <n-scrollbar x-scrollable>
        <n-data-table
          v-bind="{ data: processedData, columns, rowKey }" :checked-row-keys="selection" class="min-w-max"
          @update:checked-row-keys="keys => selection = keys"
        />
      </n-scrollbar>
    </template>

    <template #footer>
      <n-popselect
        v-model:value="shownColumns" multiple :options="columnOptions" trigger="click"
        @update:value="() => {
          if (shownColumns.length === 0) {
            shownColumns = columnOptions.map(column => column.value)
          }
        }"
      >
        <n-button size="small">
          <template #icon>
            <n-icon>
              <i-columns-3 />
            </n-icon>
          </template>
          {{ shownColumns.length }} column{{ shownColumns.length === 1 ? '' : 's' }}
        </n-button>
      </n-popselect>
    </template>
  </app-data-wrapper>
</template>
