import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Checkbox, Group, Modal, TextInput } from '@mantine/core'
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

export interface Product extends Result {
  product_code: string
  product_name: string
  supplier: string
  status: 0 | 1
}

const schema = yup.object().shape({
  product_code: yup.string().trim().required().label('Product code'),
  product_name: yup.string().trim().required().label('Product name'),
  supplier: yup.string().trim().required().label('Supplier'),
  status: yup.boolean(),
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
                {/* <Button */}
                {/*  size="xs" */}
                {/*  variant="light" */}
                {/*  color="red" */}
                {/*  loading={variables === row.original.product_code} */}
                {/*  onClick={() => { */}
                {/*    open('Delete product', row.original.product_code) */}
                {/*  }} */}
                {/* > */}
                {/*  Delete */}
                {/* </Button> */}
              </Group>
            ),
          },
        ]}
      >
      </AppNewTable>

      {/* <AppClientTable<Product> */}
      {/*  id="products" */}
      {/*  tableProps={{ */}
      {/*    records, */}
      {/*    fetching: isPending, */}
      {/*    columns: [ */}
      {/*      { accessor: 'product_code' }, */}
      {/*      { accessor: 'product_name' }, */}
      {/*      { accessor: 'supplier' }, */}
      {/*      { accessor: 'created_at', render: ({ created_at }) => new Date(created_at).toLocaleString() }, */}
      {/*      { accessor: 'created_by' }, */}
      {/*      { accessor: 'updated_at', render: ({ created_at, updated_at }) => (created_at === updated_at) ? '' : new Date(updated_at).toLocaleString() }, */}
      {/*      { accessor: 'updated_by' }, */}
      {/*      { */}
      {/*        accessor: 'actions', */}
      {/*        title: 'Actions', */}
      {/*        textAlign: 'right', */}
      {/*        render: row => ( */}
      {/*          <Group gap={4} justify="right" wrap="nowrap"> */}
      {/*            <Button */}
      {/*              size="xs" */}
      {/*              variant="light" */}
      {/*              color="gray" */}
      {/*              loading={saveIsPending && saveVariables?.values.product_code === row.product_code} */}
      {/*              disabled={saveIsPending && !!saveVariables} */}
      {/*              onClick={() => { */}
      {/*                form.setValues(row) */}
      {/*                saveReset() */}
      {/*                open(`Edit ${row.product_code}`, row.product_code) */}
      {/*              }} */}
      {/*            > */}
      {/*              Edit */}
      {/*            </Button> */}
      {/*            <Button */}
      {/*              size="xs" */}
      {/*              variant="light" */}
      {/*              color="red" */}
      {/*              loading={variables === row.product_code} */}
      {/*              onClick={() => modals.openConfirmModal({ */}
      {/*                title: `Delete product`, */}
      {/*                children: <Text size="sm"> */}
      {/*                  Would you like to delete */}
      {/*                  {' '} */}
      {/*                  <Text component="span" fw={700}>{row.product_code}</Text> */}
      {/*                  ? This action is permanent and irreversible. */}
      {/*                  /!* eslint-disable-next-line style/jsx-closing-tag-location *!/ */}
      {/*                </Text>, */}
      {/*                labels: { */}
      {/*                  cancel: 'Cancel', */}
      {/*                  confirm: `Delete product`, */}
      {/*                }, */}
      {/*                confirmProps: { */}
      {/*                  color: 'red', */}
      {/*                }, */}
      {/*                onConfirm: () => remove(row.product_code), */}
      {/*              })} */}
      {/*            > */}
      {/*              Delete */}
      {/*            </Button> */}
      {/*          </Group> */}
      {/*        ) */}
      {/*        , */}
      {/*      }, */}
      {/*    ], */}
      {/*  }} */}
      {/* /> */}
    </>
  )
}
