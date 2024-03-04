import { DataTable } from 'mantine-datatable'
import { Button, Group, Input, Modal, NumberInput, TextInput } from '@mantine/core'
import { IconCheck, IconEdit, IconPlus, IconSearch, IconX } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm, zodResolver } from '@mantine/form'
import { DateInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import useClientTable from '../hooks/useClientTable.ts'
import Header from '../components/Header.tsx'
import api from '../utils/api.ts'
import useModal from '../hooks/useModal.ts'

export default function Vouchers() {
  const schema = z.object({
    voucher_code: z.string().trim().min(1),
    voucher_count: z.number().min(1),
    product_code_reference: z.string(),
    value: z.number().min(0),
    expiry_date: z.date(),
  })

  const form = useForm({
    initialValues: {
      voucher_code: '',
      voucher_count: 1,
      product_code_reference: '',
      value: 0,
      expiry_date: '',
    },
    validate: zodResolver(schema),
  })
  const { open, close, modalProps } = useModal()

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['voucher'],
    queryFn: async () => await api.get('getAllVouchers').json(),
  })

  const { mutate: upsert, isPending } = useMutation({
    mutationFn: async (values) => {
      if (!values.id)
        return await api.post('createVoucher', { json: values }).json()

      return await api.put(`editVoucher/${values.voucher_code}`, { json: values }).json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      close()
      notifications.show({
        message: 'Successfully saved voucher',
      })
    },
  })

  const { mutate: toggle } = useMutation({
    mutationFn: async (values) => {
      return await api.patch(`set${values.available ? 'Inactive' : 'Active'}/${values.voucher_code}`).json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      close()
      notifications.show({
        message: data.results.available ? 'Successfully activated voucher' : 'Successfully deactivated voucher',
      })
    },
  })

  const { search, setSearch, tableProps } = useClientTable(data?.results)

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit((values) => {
          values.expiry_date = new Date(values.expiry_date).toISOString().split
          upsert(values)
        })}
        >
          <TextInput label="Voucher code" {...form.getInputProps('voucher_code')} />
          <NumberInput min={1} mt="sm" data-autofocus label="Voucher count" {...form.getInputProps('voucher_count')} />
          <TextInput mt="sm" label="Product code" {...form.getInputProps('product_code_reference')} />
          <NumberInput min={0} mt="sm" data-autofocus label="Value" {...form.getInputProps('value')} />
          <DateInput valueFormat="YYYY-MM-DD" mt="sm" label="Expiry date" {...form.getInputProps('expiry_date')} />
          <Group justify="end">
            <Button mt="md" type="submit" loading={isPending}>Submit</Button>
          </Group>
        </form>
      </Modal>
      <Header title="Vouchers">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            open('Add product')
          }}
          variant="filled"
          color="accent"
        >
          Create voucher
        </Button>
      </Header>
      <div className="flex h-full flex-col">
        <Group px="md" py="sm" className="border-b" justify="end">
          <Input
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            placeholder="Search..."
            rightSection={<IconSearch size={16} />}
          >
          </Input>
        </Group>
        <DataTable
          horizontalSpacing="md"
          verticalSpacing="xs"
          fetching={isLoading}
          columns={[
            { accessor: 'voucher_code' },
            { accessor: 'voucher_count' },
            { accessor: 'expiry_date' },
            { accessor: 'value' },
            { accessor: 'created_at', render: row => new Date(row.created_at).toLocaleDateString() },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: row => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => {
                      form.setValues({ ...row, expiry_date: new Date(row.expiry_date) })
                      open('Edit product')
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color={row.available ? 'red' : 'green'}
                    leftSection={row.available ? <IconX size={16} /> : <IconCheck size={16} />}
                    onClick={() => toggle(row)}
                  >
                    <span className="w-16">
                      {row.available ? 'Deactivate' : 'Activate'}
                    </span>
                  </Button>
                </Group>
              ),
            },
          ]}
          {...tableProps}
        />
      </div>
    </>
  )
}
