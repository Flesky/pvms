<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'

definePage({
  name: 'History',
})

const { data, loading } = useRequest(async () => {
  const res = await axios.get('/voucher-history')
  return res.data.results.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
})

const nestedColumns: DataTableColumns = [
  {
    key: 'voucher_code',
    title: 'Voucher Code',
  },
  {
    key: 'value',
    title: 'Value',
  },
  {
    key: 'expiry_date',
    title: 'Expiry Date',
    render: row => dayjs(row.expiry_date).format('YYYY-MM-DD'),
  },
  {
    key: 'status',
    title: 'Status',
    render: row => <n-tag>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</n-tag>,
  },
  {
    key: 'service_reference',
    title: 'Service Reference',
    render: row => row.service_reference || 'N/A',
  },
  {
    key: 'created_by',
    title: 'Created By',
  },
  {
    key: 'created_at',
    title: 'Created At',
    render: row => dayjs(row.created_at).format('YYYY-MM-DD h:mm A'),
  },
]

const columns: DataTableColumns = [
  {
    type: 'expand',
    renderExpand: (row) => {
      return <app-data-table title="Data" columns={nestedColumns} data={JSON.parse(row.voucher_new_data)}></app-data-table>
    },
  },
  {
    key: 'user_id',
    title: 'User ID',
  },
  {
    key: 'transaction',
    title: 'Transaction',
  },
  {
    key: 'created_at',
    title: 'Date',
    render: row => dayjs(row.created_at).format('YYYY-MM-DD h:mm A'),
  },
]

const selection = ref([])
</script>

<template>
  <div class="w-full p-4">
    <n-card title="History">
      <n-scrollbar x-scrollable>
        <n-data-table v-bind="{ data, columns, loading }" :checked-row-keys="selection" class="min-w-max" :row-key="row => row.id" @update:checked-row-keys="keys => selection = keys" />
      </n-scrollbar>
    </n-card>
  </div>
</template>
