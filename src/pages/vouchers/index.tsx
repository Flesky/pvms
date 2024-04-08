import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useForm, yupResolver } from '@mantine/form'
import { object } from 'yup'
import type { InferType } from 'yup'

import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import * as yup from 'yup'
import type { HTTPError } from 'ky'
import { useState } from 'react'
import AppHeader from '@/components/AppHeader.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'
import type { Product } from '@/pages/products.tsx'
import type { GetAllResponse, GetResponse, Result } from '@/types'
import api from '@/utils/api.ts'
import useModal from '@/hooks/useModal.ts'
import { replaceNullWithEmptyString } from '@/utils/functions.ts'

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
  batch_id?: number
}

export interface BatchOrder extends Result {
  id: number
  batch_id: number
  product_id: number
  batch_count: number
  voucher: Voucher
}

const schema = object().shape({
  serial: yup.string().required(),
  value: yup.number().min(0),
  product_code: yup.string().required(),
  product_id: yup.number().nullable(),
  expire_date: yup.string().nullable(),
  IMEI: yup.string().nullable(),
  SIMNarrative: yup.string().nullable(),
  SIMNo: yup.string().nullable(),
  PCN: yup.string().nullable(),
  PUK: yup.string().required(),
  IMSI: yup.string().nullable(),
  service_reference: yup.string().nullable(),
  business_unit: yup.string().nullable(),
})

export default function Vouchers() {
  const { open, close, id, modalProps } = useModal()
  const queryClient = useQueryClient()
  const [batchId, setBatchId] = useState<string>()

  const { data, isPending } = useQuery({
    queryKey: ['voucher'],
    queryFn: async () => {
      const [vouchers, products, batchOrders] = await Promise.all([
        api.get('getAllVouchers').json() as Promise<GetAllResponse<Voucher>>,
        api.get('product').json() as Promise<GetAllResponse<Product>>,
        api.get('batchOrder').json() as Promise<GetAllResponse<BatchOrder>>,
      ])
      // eslint-disable-next-line ts/no-use-before-define
      saveReset()
      // eslint-disable-next-line ts/no-use-before-define
      toggleReset()

      return {
        vouchers: vouchers.results,
        products: products.results,
        batchOrders: batchOrders.results,
      }
    },
  })

  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      product_code: '',
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
  })

  const { mutate: saveMutate, isPending: saveIsPending, variables: saveVariables, reset: saveReset, error: saveError } = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: InferType<typeof schema> }) => {
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
                {...form.getInputProps('product_code')}
                data={data?.products?.map(({ product_code, product_name }) => ({ label: product_name, value: product_code }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                disabled
                label="Product ID"
                value={form.values.product_id
                || data?.products?.find(({ product_code }) => product_code === form.values.product_code)?.product_id || ''}
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

      <AppHeader title="View all">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            saveReset()
            open('Add voucher')
          }}
        >
          Add voucher
        </Button>
      </AppHeader>

      <Stack gap={0} h="100%">
        <Box px="md" py="sm" className="border-b">
          <Group>
            <Select
              aria-label="View"
              value={batchId}
              onChange={setBatchId}
              clearable
              placeholder="Select view"
              searchable
              data={data?.batchOrders?.map(({ batch_id }) => String(batch_id)) || []}
            />
          </Group>
        </Box>

        <AppClientTable
          id="vouchers"
          tableProps={{
            records: data?.vouchers,
            fetching: isPending,
            columns: [
              {
                accessor: 'batch_id',
                title: 'Batch ID',
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
                        form.setValues({ ...replaceNullWithEmptyString(row), expire_date: row.expire_date ? new Date(`${row.expire_date}T00:00:00`) as unknown as string : '' })
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
        </AppClientTable>
      </Stack>
    </>
  )
}
