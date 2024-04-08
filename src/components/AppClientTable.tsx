import { CloseButton, Group, Stack, TextInput } from '@mantine/core'
import type { DataTableProps } from 'mantine-datatable'
import { DataTable } from 'mantine-datatable'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { useSearchParams } from 'react-router-dom'

interface Props<T> {
  id: string
  tableProps: DataTableProps<T>
  children?: ReactNode
}

export default function AppClientTable<T extends Record<string, any>>(props: Props<T>) {
  const { tableProps, children } = props
  const { records, recordsPerPage } = tableProps
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(recordsPerPage || 25)
  const [search, setSearch] = useState(searchParams.get('q') || '')

  const filteredRecords = useMemo(() => {
    if (!records)
      return undefined

    let filtered = records
    if (search) {
      filtered = records.filter(item =>
        Object.keys(item).some(key =>
          String(item[key]).toLowerCase().includes(String(search).toLowerCase()),
        ),
      )
    }
    return filtered.slice((page - 1) * pageSize, page * pageSize) as T[]
  }, [records, search, page, pageSize])

  useEffect(() => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      q: search,
    })
  }, [search])

  return (
    <Stack gap={0} h="100%">
      <Group px="md" className="border-b" py="sm" justify={children ? 'space-between' : 'end'}>
        {children}
        <TextInput
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          placeholder="Search..."
          rightSectionPointerEvents="all"
          rightSection={!search
            ? <IconSearch size={16} />
            : (
              <CloseButton
                aria-label="Clear input"
                onClick={() => setSearch('')}
              />
          )}
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
