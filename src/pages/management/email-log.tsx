import { useQuery } from '@tanstack/react-query'
import { Box } from '@mantine/core'
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

export default function EmailLog() {
  const { data: emailLogs, isPending } = useQuery({
    queryKey: ['alertEmailLogs'],
    queryFn: async () => (await api.get('alertEmailLogs').json<GetAllResponse<EmailLogEntry>>()).results,
  })

  return (
    <>
      <AppHeader title="Email Log" />
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
