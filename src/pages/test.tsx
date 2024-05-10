import { useQuery } from '@tanstack/react-query'

import { Button } from '@mantine/core'
import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import AppHeader from '@/components/AppHeader.tsx'
import AppNewTable from '@/components/AppNewTable.tsx'

const columns: ColumnDef<Record<string, any>>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'completed',
    header: 'Completed',

  },
]

export default function Test() {
  const { data, isPending } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      // Add delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch('https://jsonplaceholder.typicode.com/todos')
      return response.json()
    },
  })

  const [displayedData, setDisplayedData] = useState([])

  return (
    <>
      <AppHeader title="Table demo">
        <Button
          onClick={() => setDisplayedData(displayedData?.length ? [] : data)}
        >
          Toggle data
        </Button>
      </AppHeader>
      <AppNewTable data={displayedData} columns={columns} isLoading={isPending} />

    </>
  )
}
