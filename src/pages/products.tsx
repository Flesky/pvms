import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Group, Modal, NumberInput, Text, TextInput } from '@mantine/core'
import * as yup from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import type { HTTPError } from 'ky'
import type { InferType } from 'yup'
import api, { transformErrors } from '../utils/api.ts'
import AppHeader from '../components/AppHeader.tsx'
import AppClientTable from '../components/AppClientTable.tsx'
import useModal from '../hooks/useModal.ts'
import type { GetAllResponse, GetResponse, Result } from '@/types'

export interface Product extends Result {
  product_code: string
  product_id: number
  product_name: string
  supplier: string
}

const schema = yup.object().shape({
  product_code: yup.string().trim().required().label('Product code'),
  product_id: yup.string().required().label('Product ID'),
  product_name: yup.string().trim().required().label('Product name'),
  supplier: yup.string().trim().required().label('Supplier'),
})

export default function Products() {
  const { open, close, id, modalProps } = useModal<string>()
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      product_code: '',
      product_id: '',
      product_name: '',
      supplier: '',
    },
    transformValues: (values) => {
      return {
        ...values,
        product_id: Number.parseInt(values.product_id),
      }
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
  })

  const { data: records, isPending } = useQuery({
    queryKey: ['product'],
    queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
  })

  const { mutate: save, isPending: saveIsPending, variables: saveVariables, reset: saveReset, error } = useMutation({
    mutationFn: async ({ values, id }: { values: InferType<typeof schema>, id?: string }) =>
      !id
        ? await api.post('product', { json: values }).json() as GetResponse<Product>
        : await api.put(`product/${id}`, { json: values }).json() as GetResponse<Product>,
    onSuccess: (data: GetResponse<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['product'] })
      notifications.show({ message: `Successfully saved product: ${data.results.product_code}`, color: 'green' })
      close()
    },
    onError: async (error: HTTPError) => {
      const errors = (await error.response?.json())?.errors
      if (errors)
        form.setErrors(transformErrors(errors))
      notifications.show({ message: 'Failed to save product.', color: 'red' })
    },
  })

  const { mutate: remove, variables } = useMutation({
    mutationFn: async (id: string) => await api.delete(`product/${id}`).json() as GetResponse<Product>,
    onSuccess: (data: GetResponse<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['product'] })
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully deleted product: ${data.results.product_code}`, color: 'green' })
      close()
    },
    onError: () => notifications.show({ message: 'Failed to delete product.', color: 'red' }),
  })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id }))}>
          <TextInput required data-autofocus label="Product code" {...form.getInputProps('product_code')} />
          <NumberInput hideControls required mt="sm" label="Product ID" {...form.getInputProps('product_id')} />
          <TextInput required mt="sm" label="Product name" {...form.getInputProps('product_name')} />
          <TextInput required mt="sm" label="Supplier" {...form.getInputProps('supplier')} />
          {error && (
            <Alert mt="md" title="Form validation failed" color="red" icon={<IconAlertCircle />}>
              Please check the form for errors and try again.
            </Alert>
          )}
          <Group mt="md" justify="end">
            <Button loading={saveIsPending} type="submit">Save</Button>
          </Group>
        </form>
      </Modal>

      <AppHeader title="Products">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            saveReset()
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
                    loading={saveIsPending && saveVariables?.values.product_id === row.product_id}
                    disabled={saveIsPending && !!saveVariables}
                    onClick={() => {
                      // @ts-expect-error ID can be cast
                      form.setValues(row)
                      saveReset()
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
