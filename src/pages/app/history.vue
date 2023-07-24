<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui'

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
    render: row => row.expiry_date ? dayjs(row.expiry_date).format('YYYY-MM-DD') : 'No Expiry',
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
    title: 'Created On',
    render: row => dayjs(row.created_at).format('YYYY-MM-DD h:mm A'),
  },
]
const nestedPagination: PaginationProps = {

}
const nestedDataTableProps = {
  cardSize: 'small',
  columns: nestedColumns,
  title: ' ',
  paginateSinglePage: false,
}

const columns: DataTableColumns = [
  {
    type: 'expand',
    renderExpand: (row) => {
      if (row.voucher_old_data) {
        return <n-tabs class="-mt-2">
          <n-tab-pane name="New data">
            <app-data-table id={String(row.id)} {...nestedDataTableProps} data={JSON.parse(row.voucher_new_data)}/>
          </n-tab-pane>
          <n-tab-pane name="Old data">
            <app-data-table id={String(row.id)} {...nestedDataTableProps} data={JSON.parse(row.voucher_old_data)}/>
          </n-tab-pane>
        </n-tabs>
      }
      else {
        return <app-data-table id={String(row.id)} {...nestedDataTableProps} data={JSON.parse(row.voucher_new_data)}/>
      }
    },
  },
  {
    key: 'transaction',
    title: 'Transaction',
  },
  {
    key: 'user_id',
    title: 'User ID',
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
    <app-data-table id="history" :row-key="row => row.id" title="History" v-bind="{ data, columns, loading }" />
  </div>
</template>
