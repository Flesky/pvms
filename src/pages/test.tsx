import { useQuery } from '@tanstack/react-query'

import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@mantine/core'
import AppHeader from '@/components/AppHeader.tsx'
import AppNewTable from '@/components/AppNewTable.tsx'

const columns: ColumnDef<Record<string, any>>[] = [
]

export default function Test() {
  const { data, isPending } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      // Add delay
      const response = await fetch('https://jsonplaceholder.typicode.com/todos')
      return response.json()
    },
  })

  return (
    <>

      <AppHeader title="Table demo">
      </AppHeader>

      <AppNewTable
        data={data}
        isLoading={isPending}
        columns={[
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'title', header: 'Title' },
          {
            accessorKey: 'completed',
            header: 'Completed',
          },
          {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <>
                <Button variant="default">Mark as complete</Button>
              </>
            ),
          },
        ]}
      />

    </>
  )
}
