import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Group, Modal, TextInput } from '@mantine/core'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import * as yup from 'yup'
import { useForm, yupResolver } from '@mantine/form'
import type { InferType } from 'yup'
import { notifications } from '@mantine/notifications'
import type { HTTPError } from 'ky'
import api, { transformErrors } from '@/utils/api.ts'
import type { GetAllResponse, GetResponse, Result } from '@/types'
import AppHeader from '@/components/AppHeader.tsx'
import AppNewTable from '@/components/AppNewTable.tsx'
import useModal from '@/hooks/useModal.ts'
import { Can } from '@/components/Can.ts'

interface EmailRecipient extends Result {
  name: string
  email: string
}

const schema = yup.object().shape({
  name: yup.string().trim().required().label('Name'),
  email: yup.string().trim().email().required().label('Email'),
})

export default function AlertRecipients() {
  const { data, isPending } = useQuery({
    queryKey: ['alertEmailGroup'],
    queryFn: async () => (await api.get('alertEmailGroup').json<GetAllResponse<EmailRecipient>>()).results,
  })
  const { open, close, id, modalProps } = useModal<number>()
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
  })

  const { mutate: save, isPending: saveIsPending, variables: saveVariables, reset: saveReset, error } = useMutation({
    mutationFn: async ({ values, id }: { values: InferType<typeof schema>, id?: number }) =>
      !id
        ? await api.post('alertEmailGroup', { json: values }).json() as GetResponse<EmailRecipient>
        : await api.put(`alertEmailGroup/${id}`, { json: values }).json() as GetResponse<EmailRecipient>,
    onSuccess: (data: GetResponse<EmailRecipient>) => {
      queryClient.invalidateQueries({ queryKey: ['alertEmailGroup'] })
      notifications.show({ message: `Successfully saved recipient: ${data.results.name}`, color: 'green' })
      close()
    },
    onError: async (error: HTTPError) => {
      const errors = (await error.response?.json())?.errors
      if (errors)
        form.setErrors(transformErrors(errors))
      notifications.show({ message: 'Failed to save recipient.', color: 'red' })
    },
  })

  const { mutate: remove, variables: removeVariables } = useMutation({
    mutationFn: async (id: number) => await api.delete(`alertEmailGroup/${id}`).json() as GetResponse<EmailRecipient>,
    onSuccess: (data: GetResponse<EmailRecipient>) => {
      queryClient.invalidateQueries({ queryKey: ['alertEmailGroup'] })
      notifications.show({ message: `Successfully deleted recipient: ${data.results.name}`, color: 'green' })
      close()
    },
    onError: () => notifications.show({ message: 'Failed to delete recipient.', color: 'red' }),
  })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id }))}>
          <TextInput required label="Name" {...form.getInputProps('name')} />
          <TextInput mt="sm" required label="Email" {...form.getInputProps('email')} />
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

      <AppHeader title="Email Recipients">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset()
            saveReset()
            open('Add recipient')
          }}
        >
          Add recipient
        </Button>
      </AppHeader>
      <AppNewTable
        data={data}
        columns={[
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
          { accessorKey: 'actions', header: 'Actions', cell: ({ row }) => (
            <Group gap={4} justify="right" wrap="nowrap">
              <Can I="update" a="Management">
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  loading={saveIsPending && saveVariables?.values.email === row.original.email}
                  disabled={saveIsPending && !!saveVariables}
                  onClick={() => {
                    form.setValues(row.original)
                    saveReset()
                    open(`Edit ${row.original.name}`, row.original.id)
                  }}
                >
                  Edit
                </Button>
              </Can>
              <Can I="delete" a="Management">
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  loading={removeVariables === row.original.id}
                  onClick={() => remove(row.original.id)}
                >
                  Delete
                </Button>
              </Can>
            </Group>
          ) },
        ]}
        isLoading={isPending}
      />
    </>
  )
}
