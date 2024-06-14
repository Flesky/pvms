import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useForm, yupResolver } from '@mantine/form'
import type { InferType } from 'yup'
import * as yup from 'yup'
import { object } from 'yup'
import { Alert, Button, Grid, Group, Modal, Select, TextInput, Textarea } from '@mantine/core'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import type { HTTPError } from 'ky'
import { useSearchParams } from 'react-router-dom'
import AppHeader from '@/components/AppHeader.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'
import type { Product } from '@/pages/products.tsx'
import type { GetAllResponse, GetResponse, Result } from '@/types'

import api from '@/utils/api.ts'
import useModal from '@/hooks/useModal.ts'
import { replaceNullWithEmptyString } from '@/utils/functions.ts'
import type { BatchOrder } from '@/pages/vouchers/batch-order.tsx'
import { router } from '@/utils/router.tsx'
import type { VoucherType } from '@/pages/vouchers/types.tsx'

export interface Voucher extends Result {
  serial: string
  deplete_date?: any
  product_id: number
  voucher_code: string
  voucher_type_id: number
  SIM: any
  PUK: string
  IMSI: any
  MSISDN: any
  available: number
  service_reference: any
  business_unit: any
  batch_id: string
  note: any
}

const schema = object({
  serial: yup.string().trim().required().label('Serial'),
  product_id: yup.number().nullable().label('Product ID'),
  voucher_type_id: yup.number().nullable().label('Voucher type ID'),
  PUK: yup.string().trim().required().label('PUK'),
  SIM: yup.string().trim().nullable().label('SIM number'),
  IMSI: yup.string().trim().nullable().label('IMSI'),
  MSISDN: yup.string().trim().nullable().label('MSISDN'),
  service_reference: yup.string().trim().nullable().label('Service reference'),
  business_unit: yup.string().trim().nullable().label('Business unit'),
  note: yup.string().trim().nullable().label('Note'),
})

export default function Vouchers() {
  const { open, close, id, modalProps } = useModal<string>()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data, isPending } = useQueries({
    queries: [
      {
        queryKey: ['voucher'],
        queryFn: async () => {
          const vouchers = (await api.get('getAllVouchers').json<GetAllResponse<Voucher>>()).results
          // eslint-disable-next-line ts/no-use-before-define
          saveReset()
          // eslint-disable-next-line ts/no-use-before-define
          toggleReset()
          return vouchers
        },
      },
      {
        queryKey: ['product'],
        queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
      },
      {
        queryKey: ['batchOrder'],
        queryFn: async () => (await api.get('batchOrder').json<GetAllResponse<BatchOrder>>()).results,
      },
      {
        queryKey: ['voucherType'],
        queryFn: async () => (await api.get('voucherType').json<GetAllResponse<VoucherType>>()).results,
      },
    ],
    combine: (results) => {
      return {
        data: {
          vouchers: results[0].data,
          products: results[1].data,
          batchOrders: results[2].data,
          voucherTypes: results[3].data,
        },
        isPending: results.some(result => result.isPending),
      }
    },
  })

  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      serial: '',
      product_id: null,
      voucher_type_id: null,
      PUK: '',
      SIM: null,
      IMSI: null,
      MSISDN: null,
      service_reference: null,
      business_unit: null,
      note: null,
    },
    transformValues: (values) => {
      return {
        ...values,
      }
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
  })

  const { mutate: saveMutate, isPending: saveIsPending, variables: saveVariables, reset: saveReset, error: saveError } = useMutation({
    mutationFn: async ({ id, values }: { id?: string, values: InferType<typeof schema> }) => {
      return !id
        ? await api.post('createVoucher', { json: values }).json() as GetResponse<Voucher>
        : await api.put(`editVoucher/${id}`, { json: values }).json() as GetResponse<Voucher>
    },
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      // @ts-expect-error Inconsistent typing from API
      notifications.show({ message: `Successfully saved voucher: ${data.results.serial || data.results[0].serial}`, color: 'green' })
      close()
    },
    onError: async (error: HTTPError) => {
      const errors = (await error.response?.json())?.errors
      if (errors)
        form.setErrors(errors)
      notifications.show({ message: 'Failed to save voucher.', color: 'red' })
    },
  })

  const { mutate: toggleMutate, variables: toggleVariables, reset: toggleReset } = useMutation({
    mutationFn: async (values: Voucher) => await api.patch(`set${values.available ? 'Inactive' : 'Active'}/${values.serial}`).json() as GetResponse<Voucher>,
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully ${data.results.available ? 'activated' : 'deactivated'} voucher: ${data.results.serial}`, color: 'green' })
      close()
    },
    onError: () => {
      notifications.show({ message: 'Failed to toggle voucher.', color: 'red' })
      toggleReset()
    },
  })

  return (
    <>
      <Modal size="lg" {...modalProps}>
        <form onSubmit={form.onSubmit(values => saveMutate({ id, values }))}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput required disabled label="Serial number" {...form.getInputProps('serial')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="PUK" {...form.getInputProps('PUK')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Product reference"
                searchable
                required
                clearable
                disabled
                {...form.getInputProps('product_id')}
                data={data?.products?.map(({ id, product_name }) => ({
                  label: product_name,
                  value: String(id),
                }))}
              />
            </Grid.Col>
            {/* <Grid.Col span={6}> */}
            {/*  <TextInput */}
            {/*    disabled */}
            {/*    label="Product ID" */}
            {/*    value={form.values.product_id */}
            {/*    || data?.products?.find(({ id }) => id === form.values.product_id)?.id || ''} */}
            {/*  /> */}
            {/* </Grid.Col> */}
            <Grid.Col span={6}>
              <Select
                label="Voucher type"
                searchable
                required
                clearable
                disabled
                data={data?.voucherTypes?.filter(({ product_id }) => product_id === Number(form.values.product_id))
                  .map(({ id, voucher_code, voucher_name }) => ({ label: `${voucher_code}: ${voucher_name}`, value: String(id) }))}
                {...form.getInputProps('voucher_type_id')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Service reference" {...form.getInputProps('service_reference')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Business unit" {...form.getInputProps('business_unit')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="IMSI" {...form.getInputProps('IMSI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="SIM number" {...form.getInputProps('SIM')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="MSISDN" {...form.getInputProps('MSISDN')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea label="Note" {...form.getInputProps('note')} />
            </Grid.Col>
            {saveError && (
              <Grid.Col span={12}>
                <Alert title="Form validation failed" color="red" icon={<IconAlertCircle />}>
                  Please check the form for errors and try again.
                </Alert>
              </Grid.Col>
            )}
            <Grid.Col span={12}>
              <Group mt="md" justify="end">
                <Button loading={saveIsPending} type="submit">Save</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>

      <AppHeader title="Vouchers">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            // form.reset()
            // saveReset()
            // open('Add voucher')
            router.navigate('/vouchers/batch-upload')
          }}
        >
          Add voucher
        </Button>
      </AppHeader>

      <AppClientTable
        id="vouchers"
        defaultQuery={searchParams.get('q')}
        tableProps={{
          records: searchParams.get('batchId') ? data?.vouchers?.filter(({ batch_id }) => batch_id === searchParams.get('batchId')) : data?.vouchers,
          fetching: isPending,
          columns: [
            {
              accessor: 'batch_id',
              title: 'Batch ID',
              hidden: !!searchParams.get('batchId'),
            },
            { accessor: 'serial',
              // render: ({ voucher_code }) => (
              //   <Group wrap="nowrap">
              //     <IconChevronRight size={16} />
              //     <span>{voucher_code}</span>
              //   </Group>
              // )
            },
            {
              accessor: 'product_name',
              title: 'Product',
            },
            {
              accessor: 'voucher_code',
              title: 'Voucher code',
            },
            {
              accessor: 'voucher_name',
              title: 'Voucher type',
            },
            { accessor: 'depleted', render: ({ available, deplete_date }) => available ? 'No' : deplete_date || 'Yes' },
            { accessor: 'service_reference', title: 'Service reference' },
            { accessor: 'business_unit' },
            { accessor: 'SIM', title: 'SIM' },
            { accessor: 'IMSI', title: 'IMSI' },
            { accessor: 'PUK', title: 'PUK' },
            { accessor: 'MSISDN', title: 'MSISDN' },
            { accessor: 'note', title: 'Note' },
            { accessor: 'available', title: 'Status', render: ({ available }) => (available ? 'Active' : 'Inactive') },
            { accessor: 'created_at', render: ({ created_at }) => new Date(created_at).toLocaleString() },
            { accessor: 'created_by' },
            { accessor: 'updated_at', render: ({ created_at, updated_at }) => (created_at === updated_at) ? '' : new Date(updated_at).toLocaleString() },
            { accessor: 'updated_by' },
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
                    loading={saveIsPending && saveVariables?.values.serial === row.serial}
                    disabled={saveIsPending && !!saveVariables}
                    onClick={(e) => {
                      e.stopPropagation()
                      saveReset()
                      form.setValues({ ...replaceNullWithEmptyString(row), product_id: String(row.product_id), voucher_type_id: String(row.voucher_type_id), expire_date: row.expire_date ? new Date(`${row.expire_date}T00:00:00`) as unknown as string : '' })
                      open(`Edit ${row.serial}`, row.serial)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    loading={toggleVariables?.serial === row.serial}
                    disabled={!!toggleVariables}
                    color={row.available ? 'red' : 'green'}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMutate(row)
                    }}
                  >
                    <span className="w-16">
                      {row.available ? 'Deactivate' : 'Activate'}
                    </span>
                  </Button>
                </Group>
              )
              ,
            },
          ],
        }}
      >
        <Select
          aria-label="View"
          value={String(searchParams.get('batchId') || '')}
          onChange={batchId => !batchId ? setSearchParams('') : setSearchParams({ batchId })}
          clearable
          placeholder="Select batch ID"
          searchable
          data={data?.batchOrders?.map(({ batch_id }) => String(batch_id)) || []}
        />
      </AppClientTable>
    </>
  )
}
