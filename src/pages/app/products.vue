<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import type { FormSchema } from '@/components/app/form/types'

export interface Product {
  id: number
  product_code: string
  product_type?: string
  product_name: string
  created_by: number
  created_at: string
  updated_at: string
}

const formValue = ref({})
const form = ref()
const modal = ref({
  show: false,
  title: '',
  id: 0,
})
const message = useMessage()

const { data, loading, refresh } = useRequest<Product[]>(async () => {
  const res = await axios.get('/product')
  return res.data.results
})

const { loading: posting, run: post } = useRequest(async () => {
  await axios.post('/product', formValue.value)
}, {
  manual: true,
  onSuccess: () => {
    message.success('Product added successfully')
    modal.value.show = false
    refresh()
  },
})

const { loading: putting, run: put } = useRequest(async (id) => {
  await axios.put(`/product/${id}`, formValue.value)
}, {
  manual: true,
  onSuccess: () => {
    message.success('Product edited successfully')
    modal.value.show = false
    refresh()
  },
})

const columns: DataTableColumns<Product> = [
  {
    key: 'product_code',
    title: 'Product Code',
  },
  {
    key: 'product_type',
    title: 'Product Type',
  },
  {
    key: 'product_name',
    title: 'Product Name',
  },
  {
    key: 'created_at',
    title: 'Creation Date',
    render: row => dayjs(row.created_at).format('YYYY-MM-DD h:mm A'),
  },
  {
    key: 'action',
    title: 'Action',
    render: row =>
        <n-space>
          <n-button tertiary onClick={() => {
            modal.value.show = true
            modal.value.title = 'Edit product'
            modal.value.id = row.id
            formValue.value = row
          }}>Edit</n-button>
          <n-popconfirm onPositiveClick={() => {
            axios.delete(`/product/${row.id}`).then(() => {
              message.success('Product deleted successfully')
              refresh()
            })
          }}>
            {{
              trigger: () => <n-button type="error" tertiary>Delete</n-button>,
              default: () => <span>Are you sure you want to delete this product?</span>,
            }}
          </n-popconfirm>
          </n-space>,
  },
]

const schema: FormSchema = {
  product_name: {
    type: 'input',
    label: 'Product Name',
    required: true,
  },
  product_code: {
    type: 'input',
    label: 'Product Code',
    required: true,
  },
  product_type: {
    type: 'input',
    label: 'Product Type',
  },
}
</script>

<template>
  <div class="w-full p-4">
    <app-data-table id="products" v-bind="{ data, columns, loading }" title="Products">
      <template #action>
        <n-button
          round type="primary" @click="modal = {
            show: true,
            title: 'Add product',
            id: 0,
          }"
        >
          Add product
        </n-button>
      </template>
    </app-data-table>

    <app-modal id="new-product" v-model:show="modal.show" :title="modal.title">
      <app-form ref="form" :model="formValue">
        <app-form-items v-model="formValue" :schema="schema" />
      </app-form>

      <template #action>
        <n-space justify="end">
          <n-button v-if="!modal.id" :loading="posting" type="primary" @click="post">
            Save
          </n-button>
          <n-button v-else :loading="putting" type="primary" @click="put(modal.id)">
            Save
          </n-button>
        </n-space>
      </template>
    </app-modal>
  </div>
</template>
