<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui'

definePage({
  name: 'Home',
})

const { copy } = useClipboard()

const { data, loading, refresh } = useRequest(async () => {
  const res = await axios.get('/voucher')
  return res.data.results.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)),
  )
})

const message = useMessage()
const selected = reactive({
  voucher_code: null,
  show: false,
  title: '',
})

const columns: DataTableColumns = [
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
    render: row => <n-tag>{row.status}</n-tag>,
  },
  {
    key: 'service_reference',
    title: 'Service Reference',
    render: row => row.service_reference || 'N/A',
  },
  {
    key: 'action',
    title: 'Action',
    render: row => <n-button type="primary"
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

const selection = ref([])

const formValue = ref({})
const valueOptions = [
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
]

const query = ref('')
const filteredData = computed(() => data.value?.filter(row => Object.values(row).some(value => String(value).includes(query.value))))

const { loading: editing, run: edit } = useRequest(async () => {
  const res = await axios.put(`/voucher/${selected.voucher_code}`, formValue.value)
  return res.data
}, {
  manual: true,
  onSuccess: () => {
    message.success('Voucher updated')
    refresh()
    selected.show = false
  },
})
</script>

<template>
  <div class="w-full p-4">
    <n-card title="Vouchers">
      <template #header-extra>
        <n-input v-model:value="query" placeholder="Search" />
      </template>
      <n-scrollbar x-scrollable>
        <n-data-table v-bind="{ data: filteredData, loading, columns, pagination }" :checked-row-keys="selection" class="min-w-max" :row-key="row => row.voucher_code" @update:checked-row-keys="keys => selection = keys" />
      </n-scrollbar>
    </n-card>
    <n-modal v-model:show="selected.show" class="max-w-screen-sm" preset="card" size="small" :title="selected.title">
      <n-form :label-width="150">
        <n-form-item label="Value">
          <n-select v-model:value="formValue.value" filterable :options="valueOptions" placeholder="" tag />
        </n-form-item>
        <n-form-item label="Expiry date">
          <n-date-picker v-model:formatted-value="formValue.expiry_date" placeholder="" type="date" value-format="yyyy-MM-dd" />
        </n-form-item>
        <div class="flex justify-end">
          <n-button :loading="editing" type="primary" @click="edit">
            Save
          </n-button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>
