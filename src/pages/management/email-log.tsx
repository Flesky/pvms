import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Box, Button, Fieldset, Group, NumberInput, Stack, Switch } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import api from '@/utils/api.ts'
import AppNewTable from '@/components/AppNewTable.tsx'
import AppHeader from '@/components/AppHeader.tsx'
import type { GetAllResponse, Result } from '@/types'

interface EmailLogEntry extends Result {
  call_method: string
  call_by: string
  email: string
  alerted_products: string
}

interface EmailConfiguration extends Result {
  configuration_name: string
  configuration_value: number
  configuration_description: string
}

export default function EmailLog() {
  const queryClient = useQueryClient()

  const form = useForm({
    onValuesChange: (values, previous) => {
      if (!Object.keys(previous).length)
        return

      if (values.alert_email_toggle !== previous.alert_email_toggle)
        mutate({ id: 1, value: Number(values.alert_email_toggle), message: `Automatic email alerts ${values.alert_email_toggle ? 'enabled' : 'disabled'}` })
    },
    validate: {
      alert_email_interval: (value) => {
        if (value < 1 || value > 24)
          return 'Interval must be between 1 and 24 hours'
      },
    },
    validateInputOnBlur: true,
    enhanceGetInputProps: () => ({
      disabled: isPending || isSavePending,
    }),
  })

  const { emailLogs, isPending } = useQueries({
    queries: [
      {
        queryKey: ['alertEmailLogs'],
        queryFn: async () => (await api.get('alertEmailLogs').json<GetAllResponse<EmailLogEntry>>()).results,
      },
      {
        queryKey: ['alertEmailConfigurationPrivate'],
        queryFn: async () => {
          const results = (await api.get('alertEmailConfigurationPrivate').json<GetAllResponse<EmailConfiguration>>()).results
          form.initialize({
            alert_email_toggle: Boolean(results[0].configuration_value),
            alert_email_interval: results[1].configuration_value,
          })
          return results
        },
      },
    ],
    combine: result => ({
      emailLogs: result[0].data,
      isPending: result.some(r => r.isPending),
    }),
  })

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
    <>
      <AppHeader title="Email Log" />
      <Fieldset m="md" legend="Email Alert Configuration">
        <Stack>
          <Switch label="Automatic email alerts" {...form.getInputProps('alert_email_toggle', { type: 'checkbox' })} />
          <Group align="end">
            <NumberInput min={1} max={24} label="Email alert interval (hours)" {...form.getInputProps('alert_email_interval')} />
            <Button
              onClick={() => mutate(
                { id: 2, value: form.values.alert_email_interval, message: `Email alert interval set to ${form.values.alert_email_interval} hours` },
              )}
              disabled={isPending || isSavePending}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Fieldset>
      <Box p="md">
        <AppNewTable
          data={emailLogs}
          isLoading={isPending}
          columns={[
            {
              accessorKey: 'call_method',
              header: 'Call Method',
            },
            {
              accessorKey: 'call_by',
              header: 'Call By',
            },
            {
              accessorKey: 'email',
              header: 'Email',
              cell: ({ row }) => {
                const length = (JSON.parse(row.original.email) as string[]).length
                return length + (length === 1 ? ' recipient' : ' recipients')
              },
            },
            {
              accessorKey: 'created_at',
              header: 'Timestamp',
              cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
            },
          ]}
        />
      </Box>
    </>
  )
}
