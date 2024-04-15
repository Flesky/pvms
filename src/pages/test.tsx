import { useQuery } from '@tanstack/react-query'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { ActionIcon, Box, Group, NumberInput, ScrollArea, Stack, Table, Text } from '@mantine/core'
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconDatabaseOff,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import AppHeader from '@/components/AppHeader.tsx'

export default function Test() {
  const { data, isFetching } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos')
      return response.json()
    },
  })

  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => [
    // { id: 'select',
    //   // header: ({ table }) =>
    //   // <Checkbox checked={table.getIsAllRowsSelected()} indeterminate={table.getIsSomeRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()}></Checkbox>,
    //   cell: ({ row }) =>
    //     <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()}></Checkbox> },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'title', header: 'Title' },
  ], [])

  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const rowCount = useMemo(() => data?.length || 0, [data])

  // function setPage(page: number) {
  //   console.log(page)
  //   if (!page)
  //     setPagination({ ...pagination, pageIndex: 1 })
  //   else if (page > Math.ceil(rowCount / pagination.pageSize))
  //     setPagination({ ...pagination, pageIndex: Math.ceil(rowCount / pagination.pageSize) })
  //   else
  //     setPagination({ ...pagination, pageIndex: page })
  // }

  useEffect(() => {
    if (!pagination.pageIndex)
      setPagination({ ...pagination, pageIndex: 1 })
    else if (pagination.pageIndex > Math.ceil(rowCount / pagination.pageSize))
      setPagination({ ...pagination, pageIndex: Math.ceil(rowCount / pagination.pageSize) })
  }, [pagination, rowSelection, sorting])

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex - 1,
        pageSize: pagination.pageSize,
      },
      rowSelection,
      sorting,
    },
    rowCount,
    getRowId: row => row.id,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    debugTable: true,
  })

  return (
    <>
      <AppHeader title="Table demo"></AppHeader>
      <Stack gap={0} h="100%">
        <ScrollArea>
          <Table
            miw="500px"
            style={{
              overflowX: 'auto',
            }}
            horizontalSpacing="md"
            verticalSpacing="xs"
            stickyHeader
          >
            <Table.Thead>
              <Table.Tr>
                {table.getFlatHeaders().map(header => (
                  <Table.Th key={header.id}>
                    <Group wrap="nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort()
                      && (
                        <ActionIcon variant="transparent" size="xs" color={!header.column.getIsSorted() ? 'gray.4' : 'gray'} onClick={header.column.getToggleSortingHandler()}>
                          {{
                            asc: <IconArrowNarrowUp />,
                            desc: <IconArrowNarrowDown />,
                          }[header.column.getIsSorted() as string] || <IconArrowsUpDown />}
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.length
                ? table.getRowModel().rows.map(row => (
                  <Table.Tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <Table.Td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
                : (
                  <Table.Tr>
                    <Table.Td colSpan={columns.length}>
                      <Stack gap="xs" align="center">
                        <Box
                          bg="gray.2"
                          style={{
                            borderRadius: '100%',
                          }}
                          p="xs"
                          size={200}
                        >
                          <IconDatabaseOff color="var(--mantine-color-dimmed)" />
                        </Box>
                        <Text size="sm" c="dimmed">No records</Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                  )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Group
          style={{
            borderTop: '1px solid var(--mantine-color-gray-2)',
          }}
          px="md"
          py="xs"
          justify="space-between"

        >
          <Text size="sm">
            {(pagination.pageIndex - 1) * pagination.pageSize + 1}
            {' '}
            -
            {' '}
            {pagination.pageIndex * pagination.pageSize}
            {' '}
            /
            {' '}
            {rowCount}
          </Text>
          <Group gap="xs">
            <ActionIcon onClick={table.previousPage} disabled={!table.getCanPreviousPage()} size="md" variant="default">
              <IconChevronLeft size={20} />
            </ActionIcon>
            <NumberInput
              mb="1px"
              value={Number(pagination.pageIndex)}
              onBlur={e => setPagination({ ...pagination, pageIndex: Number(e.currentTarget.value) })}
              onKeyUp={e => e.key === 'Enter' && setPagination({ ...pagination, pageIndex: Number(e.currentTarget.value) })}
              w="52"
              size="xs"
              styles={{
                input: {
                  fontSize: 'var(--mantine-font-size-sm)',
                },
              }}
              placeholder="Page"
              allowDecimal={false}
              allowNegative={false}
              hideControls
            >
            </NumberInput>
            <Text size="sm">
              /
              {' '}
              {Math.ceil(rowCount / pagination.pageSize) || 1}
            </Text>
            <ActionIcon onClick={table.nextPage} disabled={!table.getCanNextPage()} size="md" variant="default">
              <IconChevronRight size={20} />
            </ActionIcon>
          </Group>
          <div>AAAAAAAAAAAAAAAAAA</div>
        </Group>
      </Stack>
    </>
  )
}
