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
