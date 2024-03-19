import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import * as yup from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import { Button, Grid, Group, Modal, NumberInput, Select, TextInput } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { DateInput } from '@mantine/dates'
import useModal from '../hooks/useModal.ts'
import api from '../utils/api.ts'
import type { GetAllResponse, GetResponse, Result } from '../types'
import AppHeader from '../components/AppHeader.tsx'
import AppClientTable from '../components/AppClientTable.tsx'
import type { Product } from './products.tsx'

interface Voucher extends Result {
  voucher_code: string
  product_code_reference: string
  expiry_date: string
  value: number
  available?: number
  serviceID: string
  business_unit: string
  serial_number: string
  IMEI: string
  SIMNarrative: string
  SIMNo: string
  IMSI: string
  PUK: string
}

const schema = yup.object().shape({
  voucher_code: yup.string().required(),
  product_code_reference: yup.string().nullable(),
  value: yup.number().min(0),
  expiry_date: yup.date().nullable(),

  serviceID: yup.string().required(),
  business_unit: yup.string().required(),
  serial_number: yup.string().required(),
  IMEI: yup.string().required(),
  SIMNarrative: yup.string().required(),
  SIMNo: yup.string().required(),
  IMSI: yup.string().required(),
  PUK: yup.string().required(),
})

export default function Vouchers() {
  const { open, close, id, modalProps } = useModal()
  const queryClient = useQueryClient()

  const { data: records, isPending } = useQuery({
    queryKey: ['voucher'],
    queryFn: async () => {
      const [vouchers, products] = await Promise.all([
        api.get('getAllVouchers').json() as GetAllResponse<Voucher>,
        api.get('product').json() as GetAllResponse<Product>,
      ])
      // eslint-disable-next-line ts/no-use-before-define
      resetSave()
      // eslint-disable-next-line ts/no-use-before-define
      resetToggle()
      return {
        vouchers: vouchers.results,
        products: products.results,
      }
    },
  })

  const { mutate: save, variables: saving, isPending: isSaving, reset: resetSave } = useMutation({
    mutationFn: async ({ values, id }: { values: Voucher, id?: string }) => {
      const json = {
        ...values,
        expiry_date: values.expiry_date ? (values.expiry_date as unknown as Date).toISOString().split('T')[0] : undefined,
      }

      return !id
        ? await api.post('createVoucher', { json }).json() as GetResponse<Voucher>
        : await api.put(`editVoucher/${id}`, { json }).json() as GetResponse<Voucher>
    },
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully saved voucher: ${data.results.voucher_code || data.results[0].voucher_code}` })
      close()
    },
  })

  const { mutate: toggle, variables: toggling, reset: resetToggle } = useMutation({
    mutationFn: async (values: Voucher) => await api.patch(`set${values.available ? 'Inactive' : 'Active'}/${values.voucher_code}`).json() as GetResponse<Voucher>,
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully ${data.results.available ? 'activated' : 'deactivated'} voucher: ${data.results.voucher_code}` })
      close()
    },
  })

  const form = useForm({
    initialValues: {
      voucher_code: '',
      product_code_reference: '',
      value: 0,
      expiry_date: '',

      serviceID: '',
      business_unit: '',
      serial_number: '',
      IMEI: '',
      SIMNarrative: '',
      SIMNo: '',
      IMSI: '',
      PUK: '',
    },
    validate: yupResolver(schema),
  })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id }))}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput disabled={!!id} required data-autofocus label="Voucher code" {...form.getInputProps('voucher_code')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput required min={0} label="Value" {...form.getInputProps('value')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                searchable
                clearable
                label="Product code"
                {...form.getInputProps('product_code_reference')}
                data={records?.products?.map(({ product_code, product_name }) => ({ label: `${product_code} - ${product_name}`, value: product_code }))}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <DateInput clearable label="Expiry date" {...form.getInputProps('expiry_date')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="Service ID" {...form.getInputProps('serviceID')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="Business unit" {...form.getInputProps('business_unit')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="Serial number" {...form.getInputProps('serial_number')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="IMEI" {...form.getInputProps('IMEI')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="SIM Narrative" {...form.getInputProps('SIMNarrative')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="SIM number" {...form.getInputProps('SIMNo')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="IMSI" {...form.getInputProps('IMSI')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput required label="PUK" {...form.getInputProps('PUK')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group mt="sm" justify="end">
                <Button loading={isSaving} type="submit">Save</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
      <AppHeader title="Vouchers">
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
      <AppClientTable<Voucher>
        id="vouchers"
        tableProps={{
          records: records?.vouchers,
          fetching: isPending,
          columns: [
            { accessor: 'voucher_code',
              // render: ({ voucher_code }) => (
              //   <Group wrap="nowrap">
              //     <IconChevronRight size={16} />
              //     <span>{voucher_code}</span>
              //   </Group>
              // )
            },
            {
              accessor: 'product_code_reference',
            },
            { accessor: 'expiry_date' },
            { accessor: 'value' },
            { accessor: 'serviceID', title: 'Service ID' },
            { accessor: 'business_unit' },
            { accessor: 'serial_number' },
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
                    loading={saving?.id === row.voucher_code}
                    onClick={(e) => {
                      e.stopPropagation()
                      form.setValues({ ...row,
                      // Date = YYYY-MM-DD. Convert to valid date
                        expiry_date: row.expiry_date ? new Date(`${row.expiry_date}T00:00:00`) as unknown as string : undefined })
                      open(`Edit ${row.voucher_code}`, row.voucher_code)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    loading={toggling?.voucher_code === row.voucher_code}
                    color={row.available ? 'red' : 'green'}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(row)
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
          // rowExpansion: {
          //   allowMultiple: true,
          //   content: ({ record }) => (<VoucherCodes code={record.voucher_code} />),
          // },
        }}
      />
    </>
  )
}
