<script setup lang="tsx">
import type { FormSchema } from '@/components/app/form/types'

export interface DataFilters {
  schema: FormSchema
  validator: (row: Record<string, any>, filters: Record<string, any>) => boolean
}

interface Props {
  id: string
  title?: string

  data?: Record<string, any>[]
  loading?: boolean
  refresh?: () => void

  filterOptions?: DataFilters

  total?: number
  totalPage?: number

  sizePicker?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: ' ',
  data: () => [],
  sizePicker: true,
})

function isServerPaginated() {
  return !!props.totalPage
}
// Server-side pagination
// Variable names matched to usePagination API
const page = defineModel<number>('current', { local: true, default: 1 })
const pageSize = defineModel<number>('pageSize', { local: true, default: 10 })

const defaultFilters = Object.fromEntries(Object.keys(props.filterOptions?.schema || {}).map(key => [key, null]))
const filters = defineModel<Record<string, any>>('filters', { local: true, default: {} })
const filtersValue = ref({ ...defaultFilters })
const showFilters = ref(false)
function resetFilters() {
  filters.value = { ...defaultFilters }
  filtersValue.value = { ...defaultFilters }
}

const searchQuery = ref('')
const filteredData = computed(() => {
  let { data } = props
  const query = searchQuery.value.trim()

  if (!isServerPaginated() && Object.values(filters.value).some(value => !!value))
    data = data.filter(row => props.filterOptions!.validator(row, filters.value))
  if (query.length)
    data = data.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(query.toLowerCase())))
  return data
})

// Used for client-side pagination. Simply returns current data if server-side
const paginatedData = computed(() => {
  const data = filteredData.value
  if (isServerPaginated())
    return data

  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

// Page size picker
const pageSizeOptions = props.sizePicker
  ? [10, 20, 50, 100].map(size => ({
      label: `${size} / page`,
      value: size,
    }))
  : []

// Download as CSV function
function downloadCSV() {
  const csv = Papa.unparse(paginatedData.value)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.id} ${dayjs().format('YYYY-MM-DD h:mm A')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <n-card v-bind="{ title }">
    <template #header-extra>
      <slot name="action" />
    </template>

    <n-space class="mb-3" justify="space-between">
      <n-space size="small">
        <n-input v-model:value="searchQuery" class="!w-56" clearable placeholder="Search...">
          <template #suffix>
            <n-icon>
              <i-search />
            </n-icon>
          </template>
        </n-input>
        <n-button v-if="filterOptions" @click="showFilters = !showFilters">
          <template #icon>
            <n-icon>
              <i-filter />
            </n-icon>
          </template>
          Filters
        </n-button>
      </n-space>
      <n-space size="small">
        <n-button v-if="refresh" :loading="loading" @click="refresh()">
          <template #icon>
            <n-icon>
              <i-reload />
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </n-space>

    <n-collapse-transition v-if="filterOptions" class="mb-3" :show="showFilters">
      <n-card size="small" title="Filters">
        <app-form :model="filtersValue" :show-feedback="false">
          <app-form-items v-model="filtersValue" :schema="filterOptions.schema" />
        </app-form>
        <template #action>
          <n-space justify="end">
            <n-button quaternary @click="resetFilters">
              Reset
            </n-button>
            <n-button type="primary" @click="filters = { ...filtersValue }">
              Apply
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-collapse-transition>

    <n-spin :show="loading">
      <slot :processed-data="paginatedData" />
    </n-spin>

    <template #footer>
      <div class="@3xl:grid flex flex-col items-center gap-2">
        <div v-if="filteredData.length" class="col-start-1 row-start-1">
          {{ (page - 1) * pageSize + 1 }} — {{ (page - 1) * pageSize + paginatedData.length }} of {{ total || filteredData.length }}
        </div>

        <n-pagination v-model:page="page" v-model:page-size="pageSize" class="col-start-1 row-start-1 justify-self-center" :page-count="totalPage || Math.ceil(filteredData.length / pageSize)" simple />

        <n-space class="col-start-1 row-start-1 justify-self-end" justify="center" size="small">
          <n-popselect v-model:value="pageSize" :options="pageSizeOptions" trigger="click">
            <n-button size="small">
              <template #icon>
                <n-icon>
                  <i-list />
                </n-icon>
              </template>
              {{ pageSize }} items
            </n-button>
          </n-popselect>

          <slot name="footer" :processed-data="paginatedData" />

          <n-button size="small" @click="downloadCSV">
            <template #icon>
              <n-icon>
                <i-download />
              </n-icon>
            </template>
            CSV
          </n-button>
        </n-space>
      </div>
    </template>
  </n-card>
</template>
