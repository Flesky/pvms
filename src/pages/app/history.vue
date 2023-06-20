<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'

definePage({
  name: 'History',
})

const data = [
  {
    id: '488700001229',
    description: 'Added voucher IRYU27SG2BOGP4LA',
    user: 'Jonathan Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '100001231',
    description: 'Redeemed voucher IRYU27SG2BOGP4LA',
    user: 'John Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '488700001232',
    description: 'Added voucher 7VX083EGT59NUGFP',
    user: 'Jonathan Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '100001232',
    description: 'Redeemed voucher IRYU27SG2BOGP4LA',
    user: 'John Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '488700001233',
    description: 'Added voucher 7VX083EGT59NUGFP',
    user: 'Jonathan Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '100001233',
    description: 'Redeemed voucher IRYU27SG2BOGP4LA',
    user: 'John Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '488700001234',
    description: 'Added voucher 7VX083EGT59NUGFP',
    user: 'Jonathan Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '100001234',
    description: 'Redeemed voucher IRYU27SG2BOGP4LA',
    user: 'John Doe',
    date: '2021-10-01 12:00:00',
  },
  {
    id: '488700001235',
    description: 'Added voucher 7VX083EGT59NUGFP',
    user: 'Jonathan Doe',
    date: '2021-10-01 12:00:00',
  },
]

const columns: DataTableColumns = [
  {
    type: 'selection',
  },
  {
    key: 'id',
    title: 'ID',
  },
  {
    key: 'description',
    title: 'Description',
  },
  {
    key: 'user',
    title: 'Concerned User',
  },
  {
    key: 'date',
    title: 'Date',
  },
]

const selection = ref([])
</script>

<template>
  <div class="w-full p-4">
    <n-card title="History">
      <n-scrollbar x-scrollable>
        <n-data-table v-bind="{ data, columns }" :checked-row-keys="selection" class="min-w-max" :row-key="row => row.id" @update:checked-row-keys="keys => selection = keys" />
      </n-scrollbar>
    </n-card>
  </div>
</template>
