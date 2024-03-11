import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import * as yup from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import { Button, Group, Modal, NumberInput, Select, TextInput } from '@mantine/core'
import { IconChevronRight, IconPlus } from '@tabler/icons-react'
import { DateInput } from '@mantine/dates'
import useModal from '../hooks/useModal.ts'
import api from '../utils/api.ts'
import type { GetAllResponse, GetResponse, Result } from '../types'
import AppHeader from '../components/AppHeader.tsx'
import AppClientTable from '../components/AppClientTable.tsx'
import VoucherCodes from '../components/VoucherCodes.tsx'
import type { Product } from './products.tsx'

interface Voucher extends Result {
  voucher_code: string
  product_code_reference: string
  expiry_date: string
  voucher_count: number
  value: number
  available?: number
}

const schema = yup.object().shape({
  voucher_code: yup.string().required(),
  voucher_count: yup.number().min(1),
  voucher_code_reference: yup.string(),
  value: yup.number().min(0),
  expiry_date: yup.date().nullable(),
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
      reset()
      return {
        vouchers: vouchers.results,
        products: products.results,
      }
    },
  })

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async ({ values, id }: { values: Voucher, id?: string }) => {
      const json = {
        ...values,
        expiry_date: values.expiry_date ? (values.expiry_date as Date).toISOString().split('T')[0] : undefined,
      }

      return !id
        ? await api.post('createVoucher', { json }).json() as GetResponse<Voucher>
        : await api.put(`editVoucher/${id}`, { json }).json() as GetResponse<Voucher>
    },
    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully saved voucher: ${data.results.voucher_code}` })
      close()
    },
  })

  const { mutate: toggle, variables, reset } = useMutation({
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
      voucher_count: 1,
      product_code_reference: '',
      value: 0,
      expiry_date: '',
    },
    validate: yupResolver(schema),
  })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id }))}>
          <TextInput label="Voucher code" {...form.getInputProps('voucher_code')} />
          <NumberInput min={1} mt="sm" data-autofocus label="Voucher count" {...form.getInputProps('voucher_count')} />
          <Select
            searchable
            mt="sm"
            label="Product code"
            {...form.getInputProps('product_code_reference')}
            data={records?.products?.map(({ product_code, product_name }) => ({ label: `${product_code} ${product_name}`, value: product_code }))}
          />
          <NumberInput min={0} mt="sm" data-autofocus label="Value" {...form.getInputProps('value')} />
          <DateInput clearable mt="sm" label="Expiry date" {...form.getInputProps('expiry_date')} />
          <Group mt="xl" justify="end">
            <Button loading={isSaving} type="submit">Save</Button>
          </Group>
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
            { accessor: 'voucher_code', render: ({ voucher_code }) => (
              <Group wrap="nowrap">
                <IconChevronRight size={16} />
                <span>{voucher_code}</span>
              </Group>
            ) },
            {
              accessor: 'product_code_reference',
            },
            { accessor: 'expiry_date' },
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
                    onClick={() => {
                      form.setValues({ ...row,
                      // Date = YYYY-MM-DD. Convert to valid date
                        expiry_date: row.expiry_date ? new Date(`${row.expiry_date}T00:00:00`) : undefined })
                      open(`Edit ${row.voucher_code}`, row.voucher_code)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    loading={variables?.voucher_code === row.voucher_code}
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
          rowExpansion: {
            allowMultiple: true,
            content: ({ record }) => (<VoucherCodes code={record.voucher_code} />),
          },
        }}
      />
    </>
  )
}
