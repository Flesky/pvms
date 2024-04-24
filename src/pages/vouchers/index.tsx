import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useForm, yupResolver } from '@mantine/form'
import type { InferType } from 'yup'
import * as yup from 'yup'
import { object } from 'yup'
import { Alert, Button, Grid, Group, Modal, NumberInput, Select, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
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

export interface Voucher extends Result {
  serial: string
  value: number
  expire_date: string
  product_code: string
  product_id: number
  IMEI: string
  SIMNarrative: string
  PCN: string
  SIMNo: string
  PUK: string
  IMSI: string
  service_reference: string
  business_unit: string
  deplete_date?: string
  available?: number
  batch_id?: string
}

const schema = object().shape({
  serial: yup.string().trim().required().label('Serial'),
  value: yup.number().min(0).label('Value'),
  product_id: yup.number().nullable().label('Product ID'),
  expire_date: yup.string().trim().nullable().label('Expiry date'),
  IMEI: yup.string().trim().nullable().label('IMEI'),
  SIMNarrative: yup.string().trim().nullable().label('SIM narrative'),
  SIMNo: yup.string().trim().nullable().label('SIM number'),
  PCN: yup.string().trim().nullable(),
  PUK: yup.string().trim().required(),
  IMSI: yup.string().trim().nullable(),
  service_reference: yup.string().trim().nullable().label('Service reference'),
  business_unit: yup.string().trim().nullable().label('Business unit'),
})

export default function Vouchers() {
  const { open, close, id, modalProps } = useModal<string>()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  // const { data, isPending } = useQuery({
  //   queryKey: ['voucher'],
  //   queryFn: async () => {
  //     const [vouchers, products, batchOrders] = await Promise.all([
  //       api.get('getAllVouchers').json() as Promise<GetAllResponse<Voucher>>,
  //       api.get('product').json() as Promise<GetAllResponse<Product>>,
  //       api.get('batchOrder').json() as Promise<GetAllResponse<BatchOrder>>,
  //     ])
  //     // eslint-disable-next-line ts/no-use-before-define
  //     saveReset()
  //     // eslint-disable-next-line ts/no-use-before-define
  //     toggleReset()
  //
  //     return {
  //       vouchers: vouchers.results,
  //       products: products.results,
  //       batchOrders: batchOrders.results,
  //     }
  //   },
  // })

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
    ],
    combine: (results) => {
      return {
        data: {
          vouchers: results[0].data,
          products: results[1].data,
          batchOrders: results[2].data,
        },
        isPending: results.some(result => result.isPending),
      }
    },
  })

  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      product_id: 0,
      value: 0,
      serial: '',
      expire_date: '',

      service_reference: '',
      business_unit: '',
      PCN: '',
      IMEI: '',
      SIMNarrative: '',
      SIMNo: '',
      IMSI: '',
      PUK: '',
    },
    transformValues: (values) => {
      return {
        ...values,
        expire_date: values.expire_date ? (values.expire_date as unknown as Date).toISOString().split('T')[0] : null,
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
              <TextInput required label="Serial number" {...form.getInputProps('serial')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput min={0} label="Value" {...form.getInputProps('value')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                searchable
                required
                clearable
                label="Product reference"
                {...form.getInputProps('product_id')}
                data={data?.products?.map(({ product_id, product_name }) => ({ label: product_name, value: String(product_id) }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                disabled
                label="Product ID"
                value={form.values.product_id
                || data?.products?.find(({ product_id }) => product_id === form.values.product_id)?.product_id || ''}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Service reference" {...form.getInputProps('service_reference')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <DateInput clearable label="Expiry date" {...form.getInputProps('expire_date')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Business unit" {...form.getInputProps('business_unit')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="IMEI" {...form.getInputProps('IMEI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="IMSI" {...form.getInputProps('IMSI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="SIM narrative" {...form.getInputProps('SIMNarrative')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="SIM number" {...form.getInputProps('SIMNo')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput required label="PUK" {...form.getInputProps('PUK')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput label="PCN" {...form.getInputProps('PCN')} />
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
              accessor: 'product_code',
            },
            {
              accessor: 'product_id',
              title: 'Product ID',
            },
            { accessor: 'expire_date' },
            { accessor: 'depleted', render: ({ available, deplete_date }) => available ? 'No' : deplete_date || 'Yes' },
            { accessor: 'value' },
            { accessor: 'service_reference', title: 'Service reference' },
            { accessor: 'business_unit' },
            { accessor: 'IMEI', title: 'IMEI' },
            { accessor: 'SIMNarrative', title: 'Narrative' },
            { accessor: 'SIMNo', title: 'SIM number' },
            { accessor: 'IMSI', title: 'IMSI' },
            { accessor: 'PUK', title: 'PUK' },
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
                      form.setValues({ ...replaceNullWithEmptyString(row), product_id: String(row.product_id), expire_date: row.expire_date ? new Date(`${row.expire_date}T00:00:00`) as unknown as string : '' })
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
