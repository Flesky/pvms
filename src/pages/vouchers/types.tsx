import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Checkbox, Group, Modal, Select, TextInput } from '@mantine/core'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import { type InferType, number, object, string } from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import type { HTTPError } from 'ky'
import * as yup from 'yup'
import api, { transformErrors } from '@/utils/api.ts'
import type { GetAllResponse, GetResponse, Result } from '@/types'
import AppHeader from '@/components/AppHeader.tsx'
import useModal from '@/hooks/useModal.ts'
import type { Product } from '@/pages/products.tsx'
import { replaceNullWithEmptyString } from '@/utils/functions.ts'
import AppNewTable from '@/components/AppNewTable.tsx'

export interface VoucherType extends Result {
  id: number
  product_id: number
  voucher_code: string
  voucher_name: string
  status: 0 | 1
}

const schema = object({
  product_id: number().required().label('Product ID'),
  voucher_code: string().trim().required().label('Voucher code'),
  voucher_name: string().trim().required().label('Voucher name'),
  status: yup.boolean(),
})

export default function VoucherTypes() {
  const { open, close, id, modalProps } = useModal<string>()
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      product_id: 0,
      voucher_code: '',
      voucher_name: '',
      status: true,
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    transformValues: values => ({
      ...values,
      status: Number(values.status),
    }),
  })

  const { data, isPending } = useQueries({
    queries: [
      {
        queryKey: ['product'],
        queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
      },
      {
        queryKey: ['voucherType'],
        queryFn: async () => (await api.get('voucherType').json<GetAllResponse<VoucherType>>()).results,
      },
    ],
    combine: (results) => {
      return {
        data: {
          products: results[0].data,
          voucherTypes: results[1].data,
        },
        isPending: results.some(result => result.isPending),
      }
    },
  })

  const { mutate: save, isPending: saveIsPending, reset: saveReset, error, variables: saveVariables } = useMutation({
    mutationFn: async ({ values, id }: { values: InferType<typeof schema>, id?: string }) =>
      (!id
        ? await api.post('voucherType', { json: values }).json()
        : await api.put(`voucherType/${id}`, { json: values }).json()) as GetResponse<VoucherType>,
    onSuccess: (data: GetResponse<VoucherType>) => {
      queryClient.invalidateQueries({ queryKey: ['voucherType'] })
      notifications.show({ message: `Successfully saved voucher type: ${data.results.voucher_name}`, color: 'green' })
      close()
    },
    onError: async (error: HTTPError) => {
      const errors = (await error.response?.json())?.errors
      if (errors)
        form.setErrors(transformErrors(errors))
      notifications.show({ message: 'Failed to save voucher type.', color: 'red' })
    },
  })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id }))}>
          <TextInput disabled={!!id} required label="Voucher code" {...form.getInputProps('voucher_code')} />
          <Select
            mt="sm"
            label="Product reference"
            searchable
            required
            clearable
            {...form.getInputProps('product_id')}
            data={data?.products?.filter(
              ({ status }) => status,
            ).map(({ id, product_name }) => ({
              label: product_name,
              value: String(id),
            }))}
          />
          <TextInput mt="sm" required label="Voucher name" {...form.getInputProps('voucher_name')} />
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

      <AppHeader title="Voucher Types">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            saveReset()
            open('Add voucher type')
          }}
        >
          Add voucher type
        </Button>
      </AppHeader>

      <AppNewTable
        data={data?.voucherTypes}
        isLoading={isPending}
        columns={[
          { accessorKey: 'product_name', header: 'Product' },
          { accessorKey: 'voucher_code', header: 'Voucher Code' },
          { accessorKey: 'voucher_name', header: 'Voucher Name' },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ cell }) => cell.getValue() ? <Badge>Active</Badge> : <Badge color="gray">Inactive</Badge>,
          },
          {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    saveReset()
                    form.setValues({ ...replaceNullWithEmptyString(row.original), product_id: String(row.original.product_id), status: !!row.original.status })
                    open(`Edit ${row.original.voucher_name}`, row.original.voucher_code)
                  }}
                >
                  Edit
                </Button>
              </>
            ),
          },
        ]}
      >
      </AppNewTable>

    </>
  )
}
