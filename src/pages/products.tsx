import { DataTable } from 'mantine-datatable'
import { Button, Group, Input, Modal, Text, TextInput } from '@mantine/core'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm, zodResolver } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import useClientTable from '../hooks/useClientTable.ts'
import Header from '../components/Header.tsx'
import api from '../utils/api.ts'
import useModal from '../hooks/useModal.ts'

export default function Products() {
  const schema = z.object({
    // product_code: z.string(),
    product_code: z.string().trim().min(1),
    product_type: z.string(),
    product_name: z.string(),
  })

  const form = useForm({
    initialValues: {
      product_code: '',
      product_type: '',
      product_name: '',
    },
    validate: zodResolver(schema),
  })
  const { open, close, modalProps } = useModal()

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['product'],
    queryFn: async () => await api.get('product').json(),
  })
  const { mutate: upsert, isPending } = useMutation({
    mutationFn: async (values) => {
      if (!values.id)
        return await api.post('product', { json: values }).json()

      return await api.put(`product/${values.product_code}`, { json: values }).json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] })
      close()
      notifications.show({
        message: 'Successfully saved product',
      })
    },
  })
  const { mutate: remove } = useMutation({
    mutationFn: async (values) => {
      return await api.delete(`product/${values.product_code}`).json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] })
      close()
      notifications.show({
        message: 'Successfully deleted product',
      })
    },
  })
  const { search, setSearch, tableProps } = useClientTable(data?.results)

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => upsert(values))}>
          <TextInput data-autofocus label="Product code" {...form.getInputProps('product_code')} />
          <TextInput mt="sm" label="Product type" {...form.getInputProps('product_type')} />
          <TextInput mt="sm" label="Product name" {...form.getInputProps('product_name')} />
          <Group justify="end">
            <Button mt="md" type="submit" loading={isPending}>Submit</Button>
          </Group>
        </form>
      </Modal>
      <Header title="Products">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            open('Add product')
          }}
          variant="filled"
          color="accent"
        >
          Add product
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
            { accessor: 'product_code' },
            { accessor: 'product_type' },
            { accessor: 'product_name' },
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
                      form.setValues(row)
                      open('Edit product')
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => modals.openConfirmModal({
                      title: 'Delete product',
                      children: (
                        <Text size="sm">
                          Are you sure to delete product
                          {' '}
                          <Text fw={700} component="span">{row.product_name}</Text>
                          ? This action is destructive and irreversible.
                        </Text>
                      ),
                      confirmProps: { color: 'red' },
                      onConfirm: () => remove(row),
                    })}
                  >
                    Delete
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
