import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,

  SortingState,
} from '@tanstack/react-table'

import type { StackProps, TableProps } from '@mantine/core'
import { ActionIcon, Box, Button, Card, CloseButton, Group, LoadingOverlay, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, UnstyledButton } from '@mantine/core'

import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconArrowsVertical,
  IconChevronLeft,
  IconChevronRight,
  IconDatabaseOff,
  IconFilter,
  IconFilterExclamation,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useDebouncedValue, useDisclosure, useListState } from '@mantine/hooks'

type RowData = Record<string, any>

interface Props<T extends RowData> {
  data: T[] | undefined
  columns: ColumnDef<T, any>[]
  isLoading?: boolean
  rootProps?: Omit<StackProps, 'h' | 'pos'>
  tableProps?: Omit<TableProps, 'data' | 'children'>
}

interface ColumnFilter {
  key: string
  mode: string
  value: string
}

// const filters: Record<Partial<BuiltInSortingFn>, Record<string, Function>> = {
//   text: {
//     contains: (value: string, filter: string) => value.toLowerCase().includes(filter.toLowerCase()),
//     starts_with: (value: string, filter: string) => value.toLowerCase().startsWith(filter.toLowerCase()),
//     ends_with: (value: string, filter: string) => value.toLowerCase().endsWith(filter.toLowerCase()),
//     equals: (value: string, filter: string) => value.toLowerCase() === filter.toLowerCase(),
//   },
// }

export default function AppNewTable<T extends RowData>(props: Props<T>) {
  const { data = [], columns, isLoading, rootProps, tableProps } = props

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilterText, setGlobalFilterText] = useState('')
  const [globalFilter] = useDebouncedValue(globalFilterText, 300, { leading: true })

  const [filtersOpened, { open: openFilters, close: closeFilters }] = useDisclosure()
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure()

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

    return _data
  }, [data, appliedFilters])

  const table = useReactTable<T>({
    data: filteredData,
    columns,
    state: {
      pagination,
      rowSelection,
      sorting,
      globalFilter,
    },
    getRowId: row => row.id,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterText,
    globalFilterFn: 'includesString',
    enableGlobalFilter: true,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const [highlightedColumn, setHighlightedColumn] = useState<string>()

  return (
    <>
      <Modal size="lg" opened={filtersOpened} onClose={closeFilters} title="Filters">
        <form>
          <Stack gap="sm">
            {
              filters.map((filter, index) => (
                <Group wrap="nowrap" key={index} gap="xs">
                  <Select
                    value={filter.key}
                    onChange={key => setItemProp(index, 'key', String(key))}
                    data={table.getAllColumns().map(column => ({
                      value: column.id,
                      label: String(column.columnDef.header),
                    }))}
                    placeholder="Column"
                  />

                  <Select
                    value={filter.mode}
                    onChange={mode => setItemProp(index, 'mode', String(mode))}
                    data={[{
                      value: 'contains',
                      label: 'contains',
                    },
                    ]}
                    placeholder="Mode"
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

      <Modal opened={settingsOpened} onClose={closeSettings} title="Settings">
      </Modal>

      <Stack
        p="lg"
        // bg="#f9f9f9"
        h="100%"
        pos="relative"
        {...rootProps}
      >
        <LoadingOverlay visible={isLoading} zIndex={20} loaderProps={{ type: 'bars' }} />

        <Group
          justify="space-between"
          gap="xs"
        >
          <TextInput
            value={globalFilterText}
            onChange={e => setGlobalFilterText(e.target.value)}
            placeholder="Quick search"
            rightSectionPointerEvents="all"
            rightSection={globalFilterText
              ? (
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => setGlobalFilterText('')}
                />
                )
              : <IconSearch size={16} />}
          />

          <Group gap="xs">
            <Button
              onClick={openFilters}
              variant="default"
              leftSection={<IconFilter size={16} />}
            >
              {appliedFilters?.length
                ? appliedFilters.length === 1 ? '1 filter' : `${appliedFilters.length} filters`
                : 'Filters'}
            </Button>
            {/* <Button */}
            {/*  onClick={openSettings} */}
            {/*  variant="default" */}
            {/*  leftSection={<IconSettings size={16} />} */}
            {/* > */}
            {/*  Settings */}
            {/* </Button> */}
          </Group>
        </Group>

        <Card withBorder p={0}>
          {/* {!!table.getSelectedRowModel().rows.length && ( */}
          {/*  <Card className="rounded-b-none border-b"> */}
          {/*    <Group justify="space-between"> */}
          {/*      <Text size="sm"> */}
          {/*        {table.getSelectedRowModel().rows.length} */}
          {/*      </Text> */}
          {/*    </Group> */}
          {/*  </Card> */}
          {/* )} */}

          <ScrollArea
            styles={{
              scrollbar: {
                zIndex: 10,
              },
            }}
            className={!filteredData?.length && !isLoading ? 'shrink-0' : 'h-full'}
          >
            <Table
              miw="600px"
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
                {table.getHeaderGroups().map(headerGroup => (
                  <Table.Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const isDataColumn = header.column.getCanSort()
                      { /* TODO: Don't use buttons for parent columns */ }
                      return header.isPlaceholder
                        ? <Table.Th key={header.id} colSpan={header.colSpan} />
                        : (
                          <UnstyledButton
                            key={header.id}
                            component={Table.Th}
                            bg={(highlightedColumn === header.id || header.column.getIsSorted()) ? 'gray.2' : undefined}
                            onMouseOver={() => setHighlightedColumn(header.id)}
                            onClick={isDataColumn ? header.column.getToggleSortingHandler() : undefined}
                            colSpan={header.colSpan}
                          >
                            <Stack>
                              <Group justify="space-between" wrap="nowrap">
                                <Text size="sm" fw={500} className="select-none text-nowrap" c="dark.3">
                                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </Text>
                                {
                                  isDataColumn && (
                                    <Group wrap="nowrap" gap={0}>
                                      {/* <ActionIcon */}
                                      {/*  className={highlightedColumn === header.id ? 'visible' : 'invisible'} */}
                                      {/*  variant="subtle" */}
                                      {/*  size="sm" */}
                                      {/*  color="dark.5" */}
                                      {/*  onClick={() => {}} */}
                                      {/* > */}
                                      {/*  <IconFilter size={16} /> */}
                                      {/* </ActionIcon> */}
                                      <ActionIcon
                                        className={highlightedColumn === header.id || header.column.getIsSorted() ? 'visible' : 'invisible'}
                                        variant="subtle"
                                        size="sm"
                                        color="dark.5"
                                      >
                                        {{
                                          asc: <IconArrowNarrowUp size={16} />,
                                          desc: <IconArrowNarrowDown size={16} />,
                                        }[header.column.getIsSorted() as string] || <IconArrowsVertical size={16} />}
                                      </ActionIcon>
                                    </Group>
                                  )
                                }
                              </Group>
                            </Stack>
                          </UnstyledButton>
                          )
                    })}
                  </Table.Tr>
                ))}
              </Table.Thead>

              <Table.Tbody>
                {table.getRowModel().rows.map(row => (
                  <Table.Tr key={row.id}>
                    {/* <Table.Td key={`${row.id}_selection`}> */}
                    {/*  <Checkbox */}
                    {/*    checked={row.getIsSelected()} */}
                    {/*    disabled={!row.getCanSelect()} */}
                    {/*    onChange={row.getToggleSelectedHandler()} */}
                    {/*  /> */}
                    {/* </Table.Td> */}
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

          {!table.getPageCount() && !isLoading
          && (
            <Stack gap="xs" mih={150} m="lg" justify="center" align="center" className="grow">
              <Box

                bg="gray.2"
                style={{
                  borderRadius: '100%',
                }}
                p="xs"
              >
                {table.getState().globalFilter && !!table.getPreFilteredRowModel()
                  ? <IconFilterExclamation color="var(--mantine-color-dimmed)" />
                  : <IconDatabaseOff color="var(--mantine-color-dimmed)" />}
              </Box>
              <Text size="sm" c="dimmed">
                {/* eslint-disable-next-line style/jsx-one-expression-per-line */}
                No records { table.getState().globalFilter && !!table.getPreFilteredRowModel() ? 'matched' : ''}
              </Text>
            </Stack>
          )}
        </Card>

        <Group
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
            {Math.min(pagination.pageIndex * pagination.pageSize + 1, table.getRowCount())} — {Math.min(pagination.pageIndex * pagination.pageSize + table.getPaginationRowModel().rows.length, table.getRowCount())} of {table.getFilteredRowModel().rows.length} items
          </Text>

          <Group gap="xs">
            <Select
              data={Array.from({ length: table.getPageCount() }, (_, i) => ({
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
              of {table.getPageCount()} page{table.getPageCount() === 1 ? '' : 's'}
            </Text>
            <Group gap={4}>

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
        </Group>

      </Stack>
    </>
  )
}
