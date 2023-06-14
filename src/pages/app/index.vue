<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui'

definePage({
  name: 'Home',
})

const { copy } = useClipboard()

const { data, loading } = useRequest(async () => {
  const res = await axios.get('/voucher')
  return res.data.results
})

const message = useMessage()

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
    title: 'Created at',
    // Truncate to 10 characters
    render: row => row.created_at.slice(0, 10),
  },
  {
    key: 'expiry_date',
    title: 'Expiration Date',
  },
  {
    key: 'status',
    title: 'Status',
    render: row => <n-tag type={row.status === 'active' && 'success'}>{row.status}</n-tag>,
  },
  {
    key: 'service_reference',
    title: 'Service Reference',
  },
]

const pagination: PaginationProps = {
  pageSize: 10,
}

const selection = ref([])
</script>

<template>
  <div class="w-full p-4">
    <n-card title="Vouchers">
      <n-scrollbar x-scrollable>
        <n-data-table v-bind="{ data, loading, columns, pagination }" :checked-row-keys="selection" class="min-w-max" :row-key="row => row.voucher_code" @update:checked-row-keys="keys => selection = keys" />
      </n-scrollbar>
    </n-card>
  </div>
</template>
