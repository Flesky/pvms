import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Fieldset, Group, Modal, Select, Stack, Switch, TextInput } from '@mantine/core'
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

interface EmailConfiguration extends Result {
  configuration_name: string
  configuration_value: number
  configuration_description: string
}

const INTERVAL_VALUES = [
  { value: '1', label: '1 minute' },
  { value: '2', label: '2 minutes' },
  { value: '3', label: '3 minutes' },
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '20', label: '20 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: '360', label: '6 hours' },
  { value: '540', label: '9 hours' },
  { value: '720', label: '12 hours' },
]

const schema = yup.object().shape({
  name: yup.string().trim().required().label('Name'),
  email: yup.string().trim().email().required().label('Email'),
})

function AlertConfig() {
  const queryClient = useQueryClient()

  const form = useForm({
    onValuesChange: (values, previous) => {
      if (!Object.keys(previous).length)
        return

      if (values.alert_email_toggle !== previous.alert_email_toggle)
        mutate({ id: 1, value: Number(values.alert_email_toggle), message: `Automatic email alerts ${values.alert_email_toggle ? 'enabled' : 'disabled'}` })
    },
    validateInputOnBlur: true,
    enhanceGetInputProps: () => ({
      disabled: isPending || isSavePending,
    }),
  })

  const { isPending } = useQuery(
    {
      queryKey: ['alertEmailConfigurationPrivate'],
      queryFn: async () => {
        const results = (await api.get('alertEmailConfigurationPrivate').json<GetAllResponse<EmailConfiguration>>()).results
        form.initialize({
          alert_email_toggle: Boolean(results[0].configuration_value),
          alert_email_interval: String(results[1].configuration_value),
        })
        return results
      },
    },
  )

  const { mutate, isPending: isSavePending } = useMutation({
    mutationFn: async ({ id, value }: { id: number, value: number, message: string }) => await api.put(`alertEmailConfiguration/${id}`, {
      json: { configuration_value: value },
    }).json(),
    onSuccess: (_, { message }) => {
      notifications.show({ message, color: 'green' })
      queryClient.invalidateQueries({ queryKey: ['alertEmailConfigurationPrivate'] })
    },
    onError: () => {
      notifications.show({ message: 'Failed to save email alert configuration.', color: 'red' })
      queryClient.invalidateQueries({ queryKey: ['alertEmailConfigurationPrivate'] })
    },
  })

  return (
    <Fieldset m="md" legend="Email Alert Configuration">
      <Stack>
        <Switch label="Automatic email alerts" {...form.getInputProps('alert_email_toggle', { type: 'checkbox' })} />
        <Group align="end">
          <Select
            data={INTERVAL_VALUES}
            label="Email alert interval"
            allowDeselect={false}
            {...form.getInputProps('alert_email_interval')}
          >
          </Select>
          <Button
            onClick={() => mutate(
              { id: 2, value: form.values.alert_email_interval, message: `Email alert interval set to ${
                INTERVAL_VALUES.find(({ value }) => value === form.values.alert_email_interval)?.label
              }` },
            )}
            disabled={isPending || isSavePending}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Fieldset>
  )
}

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
      {AlertConfig()}
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
