<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import type { RowKey } from 'naive-ui/lib/data-table/src/interface'

definePage({
  name: 'Home',
})

export interface Voucher {
  id: number
  voucher_code: string
  value: number
  expiry_date: string
  status: string
  service_reference?: string
  created_by: number
  created_at: string
  updated_at: string
}

const { copy } = useClipboard()

const { data, loading, refresh } = useRequest<Voucher[]>(async () => {
  const res = await axios.get('/voucher')
  return res.data.results.sort((a: Voucher, b: Voucher) => String(b.created_at).localeCompare(String(a.created_at)),
  )
})

const message = useMessage()
const selected = reactive({
  voucher_code: '',
  show: false,
  title: '',
})

const selection = ref<RowKey[]>([])
const formValue = ref<Record<string, any>>({})

const { loading: editing, run: edit } = useRequest(() =>
  axios.put(`/voucher/${selected.voucher_code}`, formValue.value), {
  manual: true,
  onSuccess: () => {
    message.success('Voucher updated')
    refresh()
    selected.show = false
  },
})

const { loading: batchActivating, run: batchActivate } = useRequest(() =>
  axios.post('/voucher-mass-active', { voucher_code: selection.value }), {
  manual: true,
  onSuccess: () => {
    selection.value = []
    message.success('Voucher/s activated')
    refresh()
  },
})

// Mass deactivate
const { loading: batchDeactivating, run: batchDeactivate } = useRequest(() =>
  axios.post('/voucher-mass-inactive', { voucher_code: selection.value }), {
  manual: true,
  onSuccess: () => {
    selection.value = []
    message.success('Voucher/s deactivated')
    refresh()
  },
})

const columns: DataTableColumns<Voucher> = [
  {
    type: 'selection',
  },
  {
    key: 'voucher_code',
    title: 'Code',
    render: row => <div class="cursor-pointer" onClick={() => {
      copy(row.voucher_code)
      message.success(`Copied ${row.voucher_code}`)
    }}>{row.voucher_code}</div>,
  },
  {
    key: 'value',
    title: 'Value',
  },
  {
    key: 'created_at',
    title: 'Creation Date',
    // Truncate to 10 characters
    render: row => dayjs(row.created_at).format('YYYY-MM-DD h:mm A'),
  },
  {
    key: 'expiry_date',
    title: 'Expiration Date',
    render: row => row.expiry_date || 'No Expiry',
  },
  {
    key: 'status',
    title: 'Status',
    // render: row => <n-tag>{row.status}</n-tag>,
    // Capitalize first letter
    render: row => <n-tag>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</n-tag>,
  },
  {
    key: 'service_reference',
    title: 'Service Reference',
    render: row => row.service_reference || 'N/A',
  },
  {
    key: 'action',
    title: 'Action',
    render: (row) => {
      return (row.status === 'active' || row.status === 'inactive')
      && <n-button
          onClick={() => {
            const url = row.status === 'active' ? `/voucher-set-inactive/${row.voucher_code}` : `/voucher-set-active/${row.voucher_code}`
            axios.put(url).then(() => {
              message.success('Voucher deactivated')
              refresh()
            })
          }}>{row.status === 'active' ? 'Deactivate' : 'Activate'}</n-button>
    },
  },
  {
    key: 'edit',
    title: 'Edit',
    render: row =>
        <n-button
            onClick={() => {
              selected.voucher_code = row.voucher_code
              selected.show = true
              selected.title = `Edit voucher - ${row.voucher_code}`
              formValue.value = row
            }}>Edit</n-button>,
  },
]

const pagination: PaginationProps = {
  pageSize: 10,
}
const valueOptions = [
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
]

const query = ref('')
const filteredData = computed(() => data.value?.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(query.value.toLowerCase()))))
</script>

<template>
  <div class="w-full p-4">
    <n-card title="Vouchers">
      <template #header-extra>
        <n-input v-model:value="query" placeholder="Search" />
      </template>
      <n-card class="mb-2" size="small">
        <template #action>
          <div class="flex items-center justify-between">
            <div>{{ selection.length }} voucher{{ selection.length !== 1 ? 's' : undefined }} selected</div>

            <n-space>
              <n-button :disabled="!selection.length" :loading="batchActivating" @click="batchActivate">
                Activate
              </n-button>
              <n-button :disabled="!selection.length" :loading="batchDeactivating" @click="batchDeactivate">
                Deactivate
              </n-button>
            </n-space>
          </div>
        </template>
      </n-card>
      <n-scrollbar x-scrollable>
        <n-data-table v-bind="{ data: filteredData, loading, columns, pagination }" :checked-row-keys="selection" class="min-w-max" :row-key="row => row.voucher_code" @update:checked-row-keys="keys => selection = keys" />
      </n-scrollbar>
    </n-card>
    <n-modal v-model:show="selected.show" class="max-w-screen-sm" preset="card" segmented size="small" :title="selected.title">
      <n-form :label-width="150">
        <n-form-item label="Value">
          <n-select v-model:value="formValue.value" filterable :options="valueOptions" placeholder="" tag />
        </n-form-item>
        <n-form-item label="Expiry date">
          <n-date-picker v-model:formatted-value="formValue.expiry_date" placeholder="" type="date" value-format="yyyy-MM-dd" />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex justify-end">
          <n-button :loading="editing" type="primary" @click="edit">
            Save
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
