import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Checkbox, Group, Modal, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import type { HTTPError } from 'ky'
import type { InferType } from 'yup'
import * as yup from 'yup'
import api, { transformErrors } from '../utils/api.ts'
import AppHeader from '../components/AppHeader.tsx'
import useModal from '../hooks/useModal.ts'
import type { GetAllResponse, GetResponse, Result } from '@/types'
import AppNewTable from '@/components/AppNewTable.tsx'
import { Can } from '@/components/Can.ts'

export interface Product extends Result {
  product_code: string
  product_name: string
  supplier: string
  status: 0 | 1
  threshold_alert: number
  available_voucher_count: number
}

const schema = yup.object().shape({
  product_code: yup.string().trim().required().label('Product code'),
  product_name: yup.string().trim().required().label('Product name'),
  supplier: yup.string().trim().required().label('Supplier'),
  status: yup.boolean(),
  threshold_alert: yup.number().label('Threshold alert'),
})

export default function Products() {
  const { open, close, id, modalProps } = useModal<string>()
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      product_code: '',
      product_name: '',
      supplier: '',
      status: true,
      threshold_alert: 0,
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    transformValues: values => ({
      ...values,
      status: Number(values.status),
    }),
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
          <TextInput disabled={!!id} required label="Product code" {...form.getInputProps('product_code')} />
          <TextInput required mt="sm" label="Product name" {...form.getInputProps('product_name')} />
          <TextInput required mt="sm" label="Supplier" {...form.getInputProps('supplier')} />
          <NumberInput required mt="sm" label="Threshold alert" description="Notify when the number of vouchers in inventory falls below this number" {...form.getInputProps('threshold_alert')} />
          <Text size="sm" mt="sm">Status</Text>
          <Checkbox mt="sm" disabled={!id} label="Enable product" {...form.getInputProps('status', { type: 'checkbox' })}></Checkbox>
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

      <AppNewTable
        data={records}
        isLoading={isPending}
        columns={[
          {
            accessorKey: 'product_code',
            header: 'Product Code',
          },
          {
            accessorKey: 'product_name',
            header: 'Product Name',
          },
          {
            accessorKey: 'supplier',
            header: 'Supplier',
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ cell }) => cell.getValue() ? <Badge>Active</Badge> : <Badge color="gray">Inactive</Badge>,
          },
          {
            accessorKey: 'available_voucher_count',
            header: 'Available',
          },
          {
            accessorKey: 'threshold_alert',
            header: 'Threshold Alert',
          },
          {
            accessorKey: 'created_at',
            header: 'Created At',
            // render: ({ created_at }) => new Date(created_at).toLocaleString(),
            cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(),
          },
          {
            accessorKey: 'created_by',
            header: 'Created By',
          },
          {
            accessorKey: 'updated_at',
            header: 'Updated At',
            cell: ({ row }) => (row.original.created_at === row.original.updated_at) ? '' : new Date(row.original.updated_at).toLocaleString(),
          },
          {
            accessorKey: 'updated_by',
            header: 'Updated By',
          },
          {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <Can I="update" a="Product">
                  <Button
                    size="xs"
                    variant="light"
                    color="gray"
                    loading={saveIsPending && saveVariables?.values.product_code === row.original.product_code}
                    disabled={saveIsPending && !!saveVariables}
                    onClick={() => {
                      form.setValues({ ...row.original, status: !!row.original.status })
                      saveReset()
                      open(`Edit ${row.original.product_code}`, row.original.product_code)
                    }}
                  >
                    Edit
                  </Button>
                </Can>
              </Group>
            ),
          },
        ]}
      >
      </AppNewTable>
    </>
  )
}
