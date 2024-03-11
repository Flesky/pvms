import { CloseButton, Group, Input, Stack } from '@mantine/core'
import type { DataTableProps } from 'mantine-datatable'
import { DataTable } from 'mantine-datatable'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { IconSearch } from '@tabler/icons-react'

interface Props<T> {
  id: string
  tableProps: DataTableProps<T>
  children?: ReactNode
}

export default function AppClientTable<T = Record<string, any>>(props: Props<T>) {
  const { tableProps, children } = props
  const { records, recordsPerPage } = tableProps
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(recordsPerPage || 25)

  const filteredRecords = useMemo(() => {
    if (!records)
      return undefined

    let filtered = records
    if (search) {
      filtered = records.filter(item =>
        Object.keys(item).some(key =>
          String(item[key]).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    }
    return filtered.slice((page - 1) * pageSize, page * pageSize) as T[]
  }, [records, search, page, pageSize])

  return (
    <Stack gap={0} h="100%">
      <Group px="md" className="border-b" py="sm" justify={children ? 'space-between' : 'end'}>
        {children}
        <Input
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          placeholder="Search..."
          rightSectionPointerEvents="all"
          rightSection={!search ? <IconSearch size={16} /> : <CloseButton aria-label="Clear input" onClick={() => setSearch('')} />}
        />
      </Group>
      <DataTable
        horizontalSpacing="md"
        verticalSpacing="xs"
        {...tableProps}
        records={filteredRecords}
        totalRecords={records?.length}
        page={page}
        onPageChange={setPage}
        recordsPerPage={pageSize}
        onRecordsPerPageChange={setPageSize}
        recordsPerPageOptions={[10, 25, 50, 100]}
      />
    </Stack>
  )
}
