import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'

import type { TableProps } from '@mantine/core'
import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconArrowsVertical,
  IconChevronLeft,
  IconChevronRight,
  IconDatabaseOff,
  IconFilter,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useDisclosure, useListState } from '@mantine/hooks'

type RowData = Record<string, any>

interface Props<T extends RowData> {
  data: T[] | undefined
  columns: ColumnDef<T, any>[]
  isLoading?: boolean
  tableProps?: Omit<TableProps, 'data' | 'children'>
}

interface ColumnFilter {
  key: string
  mode: string
  value: string
}

export default function AppNewTable<T extends RowData>(props: Props<T>) {
  const { data = [], columns, isLoading, tableProps } = props

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')

  const [filtersOpened, { open: openFilters, close: closeFilters }] = useDisclosure()
  const [filters, { append, remove, setItemProp, setState: setFilters }] = useListState<ColumnFilter>([])

  const [appliedFilters, setAppliedFilters] = useState<ColumnFilter[]>([])

  const filteredData = useMemo(() => {
    let _data = data

    if (appliedFilters?.length) {
      _data = data.filter(row => appliedFilters.every((filter) => {
        const value = row[filter.key]
        switch (filter.mode) {
          case 'contains':
            return String(value).toLowerCase().includes(filter.value.toLowerCase())
          // case 'starts_with':
          //   return String(value).toLowerCase().startsWith(filter.value.toLowerCase())
          // case 'ends_with':
          //   return String(value).toLowerCase().endsWith(filter.value.toLowerCase())
          // case 'equals':
          //   return String(value).toLowerCase() === filter.value.toLowerCase()
          default:
            return true
        }
      }))
    }

    if (!search)
      return _data
    return _data.filter(row => Object.values(row).some(value => String(value).includes(search)))
  }, [data, search, appliedFilters])
  const rowCount = filteredData.length
  const pageCount = Math.ceil(rowCount / pagination.pageSize)

  const table = useReactTable<T>({
    data: filteredData,
    columns,
    state: {
      pagination,
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
  })

  const [highlightedColumn, setHighlightedColumn] = useState<string>()

  const dataColumns = useMemo(() => table.getAllColumns().filter(column => !['selection', 'actions'].includes(column.id)), [table.getAllColumns()])

  return (
    <>
      <Modal size="lg" opened={filtersOpened} onClose={closeFilters} title="Filters">
        <form>
          <Stack gap="md">
            {
              filters.map((filter, index) => (
                <Group wrap="nowrap" key={index} gap="xs">
                  <Select
                    value={filter.key}
                    onChange={key => setItemProp(index, 'key', String(key))}
                    data={dataColumns.map(column => ({
                      value: column.id,
                      label: String(column.columnDef.header),
                    }))}
                  />

                  <Select
                    value={filter.mode}
                    onChange={mode => setItemProp(index, 'mode', String(mode))}
                    data={[{
                      value: 'contains',
                      label: 'contains',
                    },
                    ]}
                  />

                  <TextInput
                    value={filter.value}
                    onChange={e => setItemProp(index, 'value', e.target.value)}
                    placeholder="Value"
                  />

                  <CloseButton
                    aria-label="Remove filter"
                    onClick={() => remove(index)}
                  />
                </Group>
              ))
            }

            <Button
              leftSection={<IconPlus size={16} />}
              variant="default"
              onClick={() => append({
                key: '',
                mode: '',
                value: '',
              })}
            >
              Add filter
            </Button>
            <Group mt="md" justify="space-between">
              <Button
                variant="default"
                onClick={() => {
                  setAppliedFilters([])
                  setFilters([])
                  closeFilters()
                }}
              >
                Reset filters
              </Button>
              <Button onClick={
                () => {
                  setAppliedFilters(filters)
                  closeFilters()
                }
              }
              >
                Apply filters
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Stack gap={0} h="100%" pos="relative">
        <LoadingOverlay visible={isLoading} zIndex={20} loaderProps={{ type: 'bars' }} />

        <Group
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-3)',
          }}
          px="md"
          py="xs"
          justify="end"
          gap="xs"
        >
          <Button
            onClick={openFilters}
            variant="default"
            leftSection={<IconFilter size={16} />}
          >
            {appliedFilters?.length
              ? appliedFilters.length === 1 ? '1 filter' : `${appliedFilters.length} filters`
              : 'Filters'}
          </Button>
          <TextInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Quick search"
            rightSectionPointerEvents="all"
            rightSection={search
              ? (
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => setSearch('')}
                />
                )
              : <IconSearch size={16} />}
          />
        </Group>

        <ScrollArea
          styles={{
            scrollbar: {
              zIndex: 10,
            },
          }}
          className={!filteredData?.length && !isLoading ? 'shrink-0' : 'h-full'}
        >
          <Table
            miw="500px"
            style={{
              overflowX: 'auto',
            }}
            horizontalSpacing="md"
            verticalSpacing="xs"
            stickyHeader
            highlightOnHover
            {...tableProps}
          >
            <Table.Thead
              onMouseLeave={() => setHighlightedColumn(undefined)}
            >
              <Table.Tr bg="gray.2">
                {table.getFlatHeaders().map((header) => {
                  const isDataColumn = dataColumns.some(column => column.id === header.id)
                  return (
                    <UnstyledButton
                      key={header.id}
                      component={Table.Th}
                      className="hover:bg-[var(--mantine-color-gray-3)]"
                      bg={(highlightedColumn === header.id || header.column.getIsSorted()) ? 'gray.3' : undefined}
                      onMouseOver={() => setHighlightedColumn(header.id)}
                      onClick={isDataColumn ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm" fw={700} className="text-nowrap">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        {
                          isDataColumn && (
                            <ActionIcon
                              className={highlightedColumn === header.id || header.column.getIsSorted() ? 'visible' : 'invisible'}
                              variant="transparent"
                              size="xs"
                              color="dark.3"
                            >
                              {{
                                asc: <IconArrowNarrowUp />,
                                desc: <IconArrowNarrowDown />,
                              }[header.column.getIsSorted() as string] || <IconArrowsVertical />}
                            </ActionIcon>
                          )
                        }
                      </Group>
                    </UnstyledButton>
                  )
                },
                )}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {table.getRowModel().rows.map(row => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <Table.Td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {!filteredData?.length && !isLoading
        && (
          <Stack gap="xs" m="lg" justify="center" align="center" className="grow">
            <Box
              bg="gray.2"
              style={{
                borderRadius: '100%',
              }}
              p="xs"
            >
              <IconDatabaseOff color="var(--mantine-color-dimmed)" />
            </Box>
            <Text size="sm" c="dimmed">No records</Text>
          </Stack>
        )}

        {
          !!pageCount
          && (
            <Group
              style={{
                borderTop: '1px solid var(--mantine-color-gray-3)',
              }}
              px="md"
              py="xs"
              justify="space-between"
            >
              <Group gap="xs">
                <Select
                  w={116}
                  size="xs"
                  styles={{
                    input: {
                      fontSize: 'var(--mantine-font-size-sm)',
                    },
                    option: {
                      fontSize: 'var(--mantine-font-size-sm)',
                    },
                  }}
                  value={String(pagination.pageSize)}
                  onChange={pageSize => table.setPageSize(Number(pageSize))}
                  data={[
                    { value: '10', label: '10 / page' },
                    { value: '25', label: '25 / page' },
                    { value: '50', label: '50 / page' },
                    { value: '100', label: '100 / page' },
                  ]}
                  allowDeselect={false}
                >
                </Select>
              </Group>

              <Text size="sm">
                {/* eslint-disable-next-line style/jsx-one-expression-per-line */}
                {Math.min(pagination.pageIndex * pagination.pageSize + 1, table.getRowCount())} — {Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getRowCount())} of {table.getRowCount()} items
              </Text>

              <Group gap="xs">
                <Select
                  data={Array.from({ length: pageCount || 1 }, (_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  }))}
                  value={String(pagination.pageIndex + 1)}
                  onChange={page => table.setPageIndex(Number(page) - 1)}
                  w={80}
                  size="xs"
                  searchable
                  placeholder="Page"
                  styles={{
                    input: {
                      fontSize: 'var(--mantine-font-size-sm)',
                    },
                    option: {
                      fontSize: 'var(--mantine-font-size-sm)',
                    },
                  }}
                >
                </Select>
                <Text size="sm">
                  {/* eslint-disable-next-line style/jsx-one-expression-per-line */}
                  of {pageCount} page{pageCount > 1 ? 's' : ''}
                </Text>
                <ActionIcon
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant="default"
                >
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="default"
                >
                  <IconChevronRight size={16} />
                </ActionIcon>
              </Group>
            </Group>
          )
        }
      </Stack>
    </>
  )
}
