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

import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconArrowsUpDown,
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
}

interface ColumnFilter {
  key: string
  mode: string
  value: string

}

export default function AppNewTable<T extends RowData>(props: Props<T>) {
  const { data = [], columns, isLoading } = props

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const [search, setSearch] = useState('')

  const [opened, { open, close }] = useDisclosure()
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

  const dataColumns = table.getAllColumns().filter(column => !['selection', 'actions'].includes(column.id))

  const [pageNumber, setPageNumber] = useState(1)
  function handlePageNumberChange(number: number) {
    setPageNumber(() => {
      if (number < 1) {
        table.setPageIndex(0)
        return 1
      }
      else if (number > Math.ceil(rowCount / pagination.pageSize)) {
        table.setPageIndex(Math.ceil(rowCount / pagination.pageSize - 1))
        return Math.ceil(rowCount / pagination.pageSize)
      }
      else {
        table.setPageIndex(number - 1)
        return number
      }
    })
  }

  return (
    <>
      <Modal size="lg" opened={opened} onClose={close} title="Filters">
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
                color="red"
                variant="light"
                onClick={() => {
                  setAppliedFilters([])
                  setFilters([])
                  close()
                }}
              >
                Clear filters
              </Button>
              <Button onClick={
                () => {
                  setAppliedFilters(filters)
                  close()
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
            onClick={open}
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
          >
            <Table.Thead>
              <Table.Tr>
                {table.getFlatHeaders().map(header => (
                  <Table.Th key={header.id}>
                    <Group wrap="nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort()
                      && (
                        <ActionIcon
                          variant="transparent"
                          size="xs"
                          color={!header.column.getIsSorted() ? 'gray.4' : 'gray'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
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

        <Group
          style={{
            borderTop: '1px solid var(--mantine-color-gray-3)',
          }}
          px="md"
          py="xs"
          justify="space-between"
        >
          <Text size="sm">
            {/* eslint-disable-next-line style/jsx-one-expression-per-line */}
            {Math.min(pagination.pageIndex * pagination.pageSize + 1, rowCount)} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount)} / {rowCount}
          </Text>

          <Group gap="xs">
            <ActionIcon
              onClick={() => handlePageNumberChange(pageNumber - 1)}
              disabled={!table.getCanPreviousPage()}
              variant="default"
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
            <NumberInput
              value={pageNumber}
              onKeyUp={e => e.key === 'Enter' && handlePageNumberChange(Number(e.currentTarget.value))}
              onBlur={e => handlePageNumberChange(Number(e.target.value))}
              mb="1px"
              w={52}
              styles={{
                input: {
                  fontSize: 'var(--mantine-font-size-sm)',
                },
              }}
              size="xs"
              placeholder="Page"
              allowDecimal={false}
              allowNegative={false}
              hideControls
            >
            </NumberInput>
            <Text size="sm">
              {/* eslint-disable-next-line style/jsx-one-expression-per-line */}
              / {Math.ceil(rowCount / pagination.pageSize) || 1}
            </Text>
            <ActionIcon
              onClick={() => handlePageNumberChange(pageNumber + 1)}
              disabled={!table.getCanNextPage()}
              variant="default"
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>

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
              value={pagination.pageSize.toString()}
              onChange={(e) => {
                table.setPageSize(Number(e))
                handlePageNumberChange(1)
              }}
              data={[
                { value: '10', label: '10 / page' },
                { value: '25', label: '25 / page' },
                { value: '50', label: '50 / page' },
                { value: '100', label: '100 / page' },
              ]}
            >
            </Select>
          </Group>
        </Group>
      </Stack>
    </>
  )
}
