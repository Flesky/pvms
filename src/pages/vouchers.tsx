import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import * as yup from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import {
  Button,
  FileInput,
  Grid,
  Group,
  Modal,
  NumberInput,
  Pill,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { DateInput } from '@mantine/dates'
import { useState } from 'react'
import useModal from '../hooks/useModal.ts'
import api from '../utils/api.ts'
import type { GetAllResponse, GetResponse, Result } from '../types'
import AppHeader from '../components/AppHeader.tsx'
import AppClientTable from '../components/AppClientTable.tsx'
import type { Product } from './products.tsx'

export interface Voucher extends Result {
  expire_date: string
  value: number
  deplete_date: string
  serial: string
  product_code: string
  product_id: number
  IMEI: string
  SIMNarrative: string
  PCN: string
  SIMNo: string
  PUK: string
  IMSI: string
  available: number
  service_reference: string
  business_unit: string
  batch_id: number
}

interface BatchOrder extends Result {
  batch_id: number
  product_id: number
  batch_count: number
  voucher: Voucher[]
}

const schema = yup.object().shape({
  // product_id: yup.string().nullable(),
  expire_date: yup.date().nullable(),
  value: yup.number().min(0),
  serial: yup.string().required(),
  product_code: yup.string().nullable(),
  IMEI: yup.string().required(),
  SIMNarrative: yup.string().required(),
  SIMNo: yup.string().required(),
  PCN: yup.string().required(),
  PUK: yup.string().required(),
  IMSI: yup.string().required(),
  service_reference: yup.string().required(),
  business_unit: yup.string().required(),
  batch_id: yup.string().required(),
})

export default function Vouchers() {
  const { open: formOpen, close: formClose, id: formId, modalProps: formModalProps } = useModal()
  const { open, close, id, modalProps } = useModal()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'all' | 'batch' | number>('all')

  const { data: records, isPending } = useQuery({
    queryKey: ['voucher'],
    queryFn: async () => {
      const [batchOrders, products] = await Promise.all([
        api.get('batchOrder').json() as Promise<GetAllResponse<BatchOrder>>,
        // api.get('getAllVouchers').json() as Promise<GetAllResponse<Voucher>>,
        api.get('product').json() as Promise<GetAllResponse<Product>>,
      ])
      // eslint-disable-next-line ts/no-use-before-define
      resetSave()
      // eslint-disable-next-line ts/no-use-before-define
      resetToggle()
      return {
        batchOrders: batchOrders.results,
        vouchers: batchOrders.results.flatMap(({ voucher }) => voucher),
        products: products.results,
      }
    },
  })

  const { mutate: save, variables: saving, isPending: isSaving, reset: resetSave } = useMutation({
    mutationFn: async ({ values, id }: { values: Voucher, id?: string }) => {
      const json = {
        ...values,
        expire_date: values.expire_date ? (values.expire_date as unknown as Date).toISOString().split('T')[0] : undefined,
      }

      return !id
        ? await api.post('createVoucher', { json }).json() as GetResponse<Voucher>
        : await api.put(`editVoucher/${id}`, { json }).json() as GetResponse<Voucher>
    },
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      // @ts-expect-error Inconsistent typing from API
      notifications.show({ message: `Successfully saved voucher: ${data.results.serial || data.results[0].serial}` })
      formClose()
    },
  })

  const { mutate: toggle, variables: toggling, reset: resetToggle } = useMutation({
    mutationFn: async (values: Voucher) => await api.patch(`set${values.available ? 'Inactive' : 'Active'}/${values.serial}`).json() as GetResponse<Voucher>,
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully ${data.results.available ? 'activated' : 'deactivated'} voucher: ${data.results.serial}` })
      formClose()
    },
  })

  const voucherForm = useForm({
    initialValues: {
      product_code: '',
      product_id: '',
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
    validate: yupResolver(schema),
  })

  const { mutate: upload, variables: uploading, isPending: isUploading } = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData()
      formData.append('batch_id', values.batch_id)
      formData.append('product_id', Number(values.product_id))
      console.log(values.product_id)
      formData.append('file', values.file)
      await api.post('batchOrder', { body: formData }).json()
    },

    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      // @ts-expect-error Inconsistent typing from API
      notifications.show({ message: `Successfully uploaded CSV` })
      formClose()
    },
  })

  const batchOrderForm = useForm({
    initialValues: {
      batch_id: '',
      product_id: '',
      file: [],
    },
  })

  const VouchersTable = ({ _vouchers }: { _vouchers: Voucher[] }) => {
    return (
      <AppClientTable
        id="vouchers"
        tableProps={{
          records: _vouchers,
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
                    loading={saving?.values.serial === row.serial}
                    onClick={(e) => {
                      e.stopPropagation()
                      voucherForm.setValues({ ...row,
                        // Date = YYYY-MM-DD. Convert to valid date
                        expire_date: row.expire_date ? new Date(`${row.expire_date}T00:00:00`) as unknown as string : undefined })
                      formOpen(`Edit ${row.serial}`, row.serial)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    loading={toggling?.serial === row.serial}
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
      >
      </AppClientTable>
    )
  }

  return (
    <>
      <Modal size="lg" {...formModalProps}>
        <form onSubmit={voucherForm.onSubmit(values => save({ values, id: formId }))}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput required label="Serial number" {...voucherForm.getInputProps('serial')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput required min={0} label="Value" {...voucherForm.getInputProps('value')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                searchable
                clearable
                label="Product reference"
                {...voucherForm.getInputProps('product_code')}
                data={records?.products?.map(({ product_code, product_name }) => ({ label: product_name, value: product_code }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Product ID" {...voucherForm.getInputProps('product_id')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="Service reference" {...voucherForm.getInputProps('service_reference')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <DateInput clearable label="Expiry date" {...voucherForm.getInputProps('expire_date')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="Business unit" {...voucherForm.getInputProps('business_unit')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="IMEI" {...voucherForm.getInputProps('IMEI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="IMSI" {...voucherForm.getInputProps('IMSI')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="SIM narrative" {...voucherForm.getInputProps('SIMNarrative')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput required label="SIM number" {...voucherForm.getInputProps('SIMNo')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput required label="PUK" {...voucherForm.getInputProps('PUK')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput required label="PCN" {...voucherForm.getInputProps('PCN')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group mt="sm" justify="end">
                <Button loading={isSaving} type="submit">Save</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>

      <Modal {...modalProps}>
        <form onSubmit={batchOrderForm.onSubmit(values => upload(values))}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput required label="Batch ID" {...batchOrderForm.getInputProps('batch_id')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                searchable
                clearable
                label="Product reference"
                {...batchOrderForm.getInputProps('product_id')}
                data={records?.products?.map(({ product_id, product_name }) => ({ label: product_name, value: String(product_id) }))}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FileInput accept="csv" label="Upload files" {...batchOrderForm.getInputProps('file')} placeholder="Select CSV file" />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group mt="sm" justify="end">
                <Button loading={isUploading} type="submit">Upload</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>

      <AppHeader title="Vouchers">
        <Button
          variant="default"
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            open('Upload CSV')
          }}
        >
          Upload CSV
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            voucherForm.reset()
            formOpen('Add voucher')
          }}
        >
          Add voucher
        </Button>
      </AppHeader>

      <Stack gap={0} h="100%">
        <Group px="md" className="border-b" py="sm">
          <SegmentedControl
            value={view}
            onChange={setView}
            data={[
              { label: 'All', value: 'all' },
              { label: 'View by batch', value: 'batch' },

              // Conditional based on if view is a number/batch ID
              // ...(!['all', 'batch'].includes(view) ? [{ label: `Batch ${view}`, value: view }] : []),
            ]}
          >
          </SegmentedControl>
          {(view !== 'all' && view !== 'batch')

          && (
            <Pill withRemoveButton onRemove={() => setView('batch')}>
              Viewing batch
              {' '}
              {view}
            </Pill>
          )}
        </Group>

        {(view === 'batch')
          ? (
            <AppClientTable
              id="batchOrders"
              tableProps={{
                records: records?.batchOrders,
                fetching: isPending,
                columns: [
                  { accessor: 'batch_id', title: 'Batch ID' },
                  { accessor: 'product_id', title: 'Product ID' },
                  { accessor: 'batch_count', title: 'Voucher count' },
                  { accessor: 'actions', title: 'Actions', textAlign: 'right', render: ({ batch_id }) => (
                    <Button
                      size="xs"
                      variant="light"
                      color="gray"
                      onClick={() => {
                        setView(batch_id)
                      }}
                    >
                      View
                    </Button>
                  ) },
                ],
              }}
            >
            </AppClientTable>
            )
          : (
            <VouchersTable _vouchers={view === 'all'
              ? records?.vouchers
              : records?.batchOrders.find(
                ({ batch_id }) => batch_id === view,
              )?.voucher || []}
            >
            </VouchersTable>
            ) }
      </Stack>
    </>
  )
}
