<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui'

definePage({
  name: 'Home',
})

const { copy } = useClipboard()

// Generate 50 entries with 1.5 second timeout
const mockData = new Promise((resolve) => {
  setTimeout(() => {
    resolve(Array.from({ length: 50 }, (_, i) => ({
      // Random 12 alphanumeric characters
      voucher_code: Math.random().toString(36).substring(2, 14).toUpperCase(),
      value: [100, 200, 300, 400, 500, 1000][Math.floor(Math.random() * 6)],
      expiry_date: '2024-12-31',
      status: i % 4,
    })))
  }, 1500)
})
const { data, loading, error } = useRequest(() => mockData)

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
    key: 'expiry_date',
    title: 'Expiration Date',
  },
  {
    key: 'status',
    title: 'Status',
    render: row => row.status ? <n-tag type="success">Active</n-tag> : <n-tag>Inactive</n-tag>,
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
      <n-data-table v-bind="{ data, loading, columns, pagination }" :checked-row-keys="selection" :row-key="row => row.voucher_code" @update:checked-row-keys="keys => selection = keys" />
    </n-card>
  </div>
</template>
