import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Group, Modal, Text, TextInput } from '@mantine/core'
import * as yup from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlus } from '@tabler/icons-react'
import api from '../utils/api.ts'
import AppHeader from '../components/AppHeader.tsx'
import AppClientTable from '../components/AppClientTable.tsx'
import useModal from '../hooks/useModal.ts'
import type { GetAllResponse, GetResponse, Result } from '../types'

export interface Product extends Result {
  product_code: string
  product_id: number
  product_name: string
  supplier: string
}

const schema = yup.object().shape({
  product_code: yup.string().required(),
  product_id: yup.number().required(),
  product_name: yup.string().required(),
  supplier: yup.string().required(),
})

export default function Products() {
  const { open, close, formId, modalProps } = useModal()
  const queryClient = useQueryClient()

  const { data: records, isPending } = useQuery({
    queryKey: ['product'],
    queryFn: async () => {
      const res = await api.get('product').json() as GetAllResponse<Product>
      return res.results
    },
  })

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async ({ values, id }: { values: Product, id?: string }) =>
      !id
        ? await api.post('product', { json: values }).json() as GetResponse<Product>
        : await api.put(`product/${id}`, { json: values }).json() as GetResponse<Product>,
    onSuccess: (data: GetResponse<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['product'] })
      notifications.show({ message: `Successfully saved product: ${data.results.product_code}` })
      close()
    },
  })

  const { mutate: remove, variables } = useMutation({
    mutationFn: async (id: string) => await api.delete(`product/${id}`).json() as GetResponse<Product>,
    onSuccess: (data: GetResponse<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['product'] })
      notifications.show({ message: `Successfully deleted product: ${data.results.product_code}` })
      close()
    },
  })

  const form = useForm({
    initialValues: {
      product_code: '',
      product_type: '',
      product_name: '',
      supplier: '',
    },
    validate: yupResolver(schema),
  })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id: formId }))}>
          <TextInput required data-autofocus label="Product code" {...form.getInputProps('product_code')} />
          <TextInput required mt="sm" label="Product type" {...form.getInputProps('product_type')} />
          <TextInput required mt="sm" label="Product name" {...form.getInputProps('product_name')} />
          <TextInput required mt="sm" label="Supplier" {...form.getInputProps('supplier')} />
          <Group mt="xl" justify="end">
            <Button loading={isSaving} type="submit">Save</Button>
          </Group>
        </form>
      </Modal>

      <AppHeader title="Products">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            open('Add product')
          }}
        >
          Add product
        </Button>
      </AppHeader>
      <AppClientTable<Product>
        id="products"
        tableProps={{
          records,
          fetching: isPending,
          columns: [
            { accessor: 'product_code' },
            {
              accessor: 'product_id',
              title: 'Product ID',
            },
            { accessor: 'product_name' },
            { accessor: 'supplier' },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: row => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Button
                    size="xs"
                    variant="light"
                    color="gray"
                    onClick={() => {
                      form.setValues(row)
                      open(`Edit ${row.product_code}`, row.product_code)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    loading={variables === row.product_code}
                    onClick={() => modals.openConfirmModal({
                      title: `Delete product`,
                      children: <Text size="sm">
                        Would you like to delete
                        {' '}
                        <Text component="span" fw={700}>{row.product_code}</Text>
                        ? This action is permanent and irreversible.
                        {/* eslint-disable-next-line style/jsx-closing-tag-location */}
                      </Text>,
                      labels: {
                        cancel: 'Cancel',
                        confirm: `Delete product`,
                      },
                      confirmProps: {
                        color: 'red',
                      },
                      onConfirm: () => remove(row.product_code),
                    })}
                  >
                    Delete
                  </Button>
                </Group>
              )
              ,
            },
          ],
        }}
      />
    </>
  )
}
