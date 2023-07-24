<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import type { RowKey } from 'naive-ui/lib/data-table/src/interface'
import type { FormSchema } from '@/components/app/form/types'
import type { Product } from '@/pages/app/products.vue'

definePage({
  name: 'Vouchers',
})

export interface Voucher {
  id: number
  voucher_code: string
  value: number
  product_code: string
  expiry_date: string
  status: string
  service_reference?: string
  IMEI?: string
  PCN?: string
  sim_number?: string
  IMSI?: string
  PUK?: string
  created_by: number
  created_at: string
  updated_at: string
}

const { copy } = useClipboard()
const formValue = ref<Record<string, any>>({})
const message = useMessage()
const selected = reactive({
  voucher_code: '',
  show: false,
  title: '',
})
const selection = ref<RowKey[]>([])

const schema = ref<FormSchema>({
  value: {
    type: 'select',
    label: 'Value',
    custom: true,
    options: ['100', '200', '300', '400', '500', '1000'].map(value => ({ label: value, value })),
  },
  expiry_date: {
    type: 'date',
    label: 'Expiration Date',
  },
  product_code_reference: {
    type: 'select',
    label: 'Product Code',
    options: [],
  },
  service_reference: {
    type: 'number',
    label: 'Service Reference',
  },
  IMEI: {
    type: 'input',
    label: 'IMEI',
  },
  PCN: {
    type: 'input',
    label: 'PCN',
  },
  sim_number: {
    type: 'input',
    label: 'SIM Number',
  },
  IMSI: {
    type: 'input',
    label: 'IMSI',
  },
  PUK: {
    type: 'input',
    label: 'PUK',
  },
})

const { data, loading, refresh } = useRequest<Voucher[]>(async () => {
  // const res = await axios.get('/voucher')
  // await axios.get('/product')
  const res = await Promise.all([
    axios.get('/voucher'),
    axios.get('/product'),
  ])

  // Assign product_code options
  schema.value.product_code_reference.options = (res[1].data.results as Product[]).map((product: any) => ({
    label: product.product_code,
    value: product.product_code,
  }))

  return res[0].data.results.sort((a: Voucher, b: Voucher) => String(b.created_at).localeCompare(String(a.created_at)))
})

const { loading: editing, run: edit } = useRequest(async () => {
  return axios.put(`/voucher/${selected.voucher_code}`, formValue.value)
}, {
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
    sorter: (a, b) => a.value - b.value,
  },
  {
    key: 'product_code',
    title: 'Product Code',
  },
  {
    key: 'created_at',
    title: 'Creation Date',
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
    render: row => <n-tag type={row.status === 'active' ? 'success' : 'default'}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</n-tag>,
  },
  {
    key: 'service_reference',
    title: 'Service Reference',
    render: row => row.service_reference || 'N/A',
  },
  {
    key: 'IMEI',
    title: 'IMEI',
    render: row => row.IMEI || 'N/A',
  },
  {
    key: 'PCN',
    title: 'PCN',
    render: row => row.PCN || 'N/A',
  },
  {
    key: 'sim_number',
    title: 'SIM Number',
    render: row => row.sim_number || 'N/A',
  },
  {
    key: 'IMSI',
    title: 'IMSI',
    render: row => row.IMSI || 'N/A',
  },
  {
    key: 'PUK',
    title: 'PUK',
    render: row => row.PUK || 'N/A',
  },
  {
    key: 'action',
    title: 'Action',
    sorter: false,
    titleAlign: 'center',
    render: (row) => {
      const url = `/voucher-set-${row.status === 'active' ? 'inactive' : 'active'}/${row.voucher_code}`
      return <n-space>
        {(row.status === 'active' || row.status === 'inactive') && <n-button class="!w-24" disabled={!!selection.value.length}
            onClick={() => {
              axios.patch(url).then(() => {
                message.success(`Voucher ${row.status === 'active' ? 'deactivated' : 'activated'}`)
                refresh()
              })
            }}>{row.status === 'active' ? 'Deactivate' : 'Activate'}</n-button>}

        <n-button disabled={!!selection.value.length} onClick={() => {
          selected.voucher_code = row.voucher_code
          selected.show = true
          selected.title = `Edit voucher - ${row.voucher_code}`
          formValue.value = row
        }}>Edit</n-button>
      </n-space>
    },
  },
]
</script>

<template>
  {{ data }}
  <div class="w-full p-4">
    <app-data-table id="vouchers" v-bind="{ data, columns, loading, refresh }" v-model:selection="selection" :row-key="row => row.voucher_code" title="Vouchers">
      <template #selectionAction="{ selection }">
        <n-space>
          <n-button :disabled="!selection.length" :loading="batchActivating" @click="batchActivate">
            Activate
          </n-button>
          <n-button :disabled="!selection.length" :loading="batchDeactivating" @click="batchDeactivate">
            Deactivate
          </n-button>
        </n-space>
      </template>
    </app-data-table>

    <app-modal id="voucher" v-model:show="selected.show" :title="selected.title">
      <app-form :label-width="150" :model="formValue">
        <app-form-items v-model="formValue" :schema="schema" />
      </app-form>

      <template #action>
        <div class="flex justify-end">
          <n-button :loading="editing" type="primary" @click="edit">
            Save
          </n-button>
        </div>
      </template>
    </app-modal>
  </div>
</template>
