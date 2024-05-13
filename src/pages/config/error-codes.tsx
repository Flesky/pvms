import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import type { HTTPError } from 'ky'
import { useForm, yupResolver } from '@mantine/form'
import * as yup from 'yup'
import { Alert, Button, Group, Modal, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type { InferType } from 'yup'
import AppHeader from '@/components/AppHeader.tsx'
import type { GetAllResponse, GetResponse, Result } from '@/types'
import api, { transformErrors } from '@/utils/api.ts'
import useModal from '@/hooks/useModal.ts'
import AppNewTable from '@/components/AppNewTable.tsx'

interface ErrorCode extends Result {
  error_code: string
  error_message: string
}

const schema = yup.object().shape({
  error_code: yup.string().trim().required().label('Error code'),
  error_message: yup.string().trim().required().label('Error message'),
})

export default function ErrorCodes() {
  const { open, close, id, modalProps } = useModal<number>()
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      error_code: '',
      error_message: '',
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
  })

  const { data: records, isPending } = useQuery({
    queryKey: ['errorCodes'],
    queryFn: async () => (await api.get('errorCodes').json<GetAllResponse<ErrorCode>>()).results,
  })

  const { mutate: save, isPending: saveIsPending, variables: saveVariables, reset: saveReset, error } = useMutation({
    mutationFn: async ({ values, id }: { values: InferType<typeof schema>, id?: number }) =>
      !id
        ? await api.post('errorCodes', { json: values }).json() as GetResponse<ErrorCode>
        : await api.put(`errorCodes/${id}`, { json: values }).json() as GetResponse<ErrorCode>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errorCodes'] })
      notifications.show({ message: `Successfully saved error message.`, color: 'green' })
      close()
    },
    onError: async (error: HTTPError) => {
      const errors = (await error.response?.json())?.errors
      if (errors)
        form.setErrors(transformErrors(errors))
      notifications.show({ message: 'Failed to save error message.', color: 'red' })
    },
  })

  // const { mutate: remove, variables } = useMutation({
  //   mutationFn: async (id: string) => await api.delete(`errorCodes/${id}`).json() as GetResponse<ErrorCode>,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['errorCodes'] })
  //     notifications.show({ message: `Successfully deleted error message.`, color: 'green' })
  //     close()
  //   },
  //   onError: () => notifications.show({ message: 'Failed to delete error message.', color: 'red' }),
  // })

  return (
    <>
      <Modal {...modalProps}>
        <form onSubmit={form.onSubmit(values => save({ values, id }))}>
          <TextInput disabled required mt="sm" label="Error code" {...form.getInputProps('error_code')} />
          <TextInput required mt="sm" label="Error message" {...form.getInputProps('error_message')} />
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

      <AppHeader title="Error message overrides" />

      <AppNewTable
        data={records}
        isLoading={isPending}
        columns={[
          { accessorKey: 'error_code', header: 'Error code' },
          { accessorKey: 'error_message', header: 'Error message' },
          { accessorKey: 'error_description', header: 'Error description' },
          { accessorKey: 'updated_at', header: 'Updated at', cell: ({ row }) => (row.original.created_at === row.original.updated_at) ? '' : new Date(row.original.updated_at).toLocaleString() },
          { accessorKey: 'updated_by', header: 'Updated by' },
          {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  loading={saveIsPending && saveVariables?.values.error_code === row.original.error_code}
                  disabled={saveIsPending && !!saveVariables}
                  onClick={() => {
                    form.setValues(row.original)
                    saveReset()
                    open(`Edit ${row.original.error_code}`, row.original.id)
                  }}
                >
                  Edit
                </Button>
              </Group>
            )
            ,
          },
        ]}
      >
      </AppNewTable>

    </>
  )
}
