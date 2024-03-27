import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useForm, yupResolver } from '@mantine/form'
import type { InferType } from 'yup'
import { number, object, string } from 'yup'
import { Button, Grid, Group, Modal, NumberInput, Select, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconPlus } from '@tabler/icons-react'
import AppHeader from '@/components/AppHeader.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'
import type { Product } from '@/pages/products.tsx'
import type { GetAllResponse, GetResponse, Result } from '@/types'
import api from '@/utils/api.ts'
import useModal from '@/hooks/useModal.ts'

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

const schema = object().shape({
  serial: string().required(),
  // ISO with time date format
  expire_date: string().nullable(),
  value: number().min(0),
  product_code: string().nullable(),
  IMEI: string().required(),
  SIMNarrative: string().required(),
  SIMNo: string().required(),
  PCN: string().required(),
  PUK: string().required(),
  IMSI: string().required(),
  service_reference: string().required(),
  business_unit: string().required(),
})

export default function VouchersOld() {
  const { open, close, id, modalProps } = useModal()
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: ['voucher'],
    queryFn: async () => {
      const [vouchers, products] = await Promise.all([
        api.get('getAllVouchers').json() as Promise<GetAllResponse<Voucher>>,
        api.get('product').json() as Promise<GetAllResponse<Product>>,
      ])
      // eslint-disable-next-line ts/no-use-before-define
      saveReset()
      // eslint-disable-next-line ts/no-use-before-define
      toggleReset()
      return {
        vouchers: vouchers.results,
        products: products.results,
      }
    },
  })

  const { mutate: saveMutate, isPending: saveIsPending, variables: saveVariables, reset: saveReset } = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: InferType<typeof schema> }) => {
      return !id
        ? await api.post('createVoucher', { json: values }).json() as GetResponse<Voucher>
        : await api.put(`editVoucher/${id}`, { json: values }).json() as GetResponse<Voucher>
    },
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      // @ts-expect-error Inconsistent typing from API
      notifications.show({ message: `Successfully saved voucher: ${data.results.serial || data.results[0].serial}` })
      close()
    },
  })

  const { mutate: toggleMutate, variables: toggleVariables, reset: toggleReset } = useMutation({
    mutationFn: async (values: Voucher) => {
      return await api.patch(`set${values.available ? 'Inactive' : 'Active'}/${values.serial}`).json() as GetResponse<Voucher>
    },
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully ${data.results.available ? 'activated' : 'deactivated'} voucher: ${data.results.serial}` })
      close()
    },
  })

  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      product_code: '',
      value: 0,
      serial: '',
      expire_date: null,

      service_reference: '',
      business_unit: '',
      PCN: '',
      IMEI: '',
      SIMNarrative: '',
      SIMNo: '',
      IMSI: '',
      PUK: '',
    },
    transformValues: ({ expire_date }) => {
      notifications.show(expire_date)
      return {
        expire_date: expire_date ? (expire_date as unknown as Date).toISOString().split('T')[0] : null,
      }
    },
    validate: yupResolver(schema),
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
              <NumberInput required min={0} label="Value" {...form.getInputProps('value')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                searchable
                clearable
                label="Product reference"
                {...form.getInputProps('product_code')}
                data={data?.products?.map(({ product_code, product_name }) => ({ label: product_name, value: product_code }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Product ID" {...form.getInputProps('product_id')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="Service reference" {...form.getInputProps('service_reference')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <DateInput clearable label="Expiry date" {...form.getInputProps('expire_date')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="Business unit" {...form.getInputProps('business_unit')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="IMEI" {...form.getInputProps('IMEI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="IMSI" {...form.getInputProps('IMSI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="SIM narrative" {...form.getInputProps('SIMNarrative')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="SIM number" {...form.getInputProps('SIMNo')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput required label="PUK" {...form.getInputProps('PUK')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput required label="PCN" {...form.getInputProps('PCN')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group mt="sm" justify="end">
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
            open('Add voucher')
          }}
        >
          Add voucher
        </Button>
      </AppHeader>

      <AppClientTable
        id="vouchers"
        tableProps={{
          records: data?.vouchers,
          fetching: isPending,
          columns: [
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
                    loading={saveVariables?.values.serial === row.serial}
                    disabled={saveVariables && saveVariables?.values.serial !== row.serial}
                    onClick={(e) => {
                      e.stopPropagation()
                      form.setValues({ ...row, expire_date: row.expire_date ? new Date(`${row.expire_date}T00:00:00`) as unknown as string : undefined })
                      open(`Edit ${row.serial}`, row.serial)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    loading={toggleVariables?.serial === row.serial}
                    disabled={toggleVariables && toggleVariables?.serial !== row.serial}
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

        {JSON.stringify(form.values.expire_date)}
      </AppClientTable>
    </>
  )
}
