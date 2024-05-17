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
      return []
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
          { accessorKey: 'id', header: 'ID', sortingFn: 'basic' },
          { accessorKey: 'title', header: 'Title' },
          {
            header: 'Completed',
            columns: [
              { accessorKey: 'completed2', header: 'Completed', sortingFn: 'basic' },
              { accessorKey: 'completed3', header: 'Completed', sortingFn: 'basic' },
            ],
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
