import { useQuery } from '@tanstack/react-query'
import type { DataTableColumn } from 'mantine-datatable'
import { Box, Card } from '@mantine/core'
import AppHeader from '@/components/AppHeader.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'
import api from '@/utils/api.ts'

const VOUCHER_SCHEMA: DataTableColumn<Record<string, any>>[] = [
  {
    accessor: 'batch_id',
    title: 'Batch ID',
  },
  { accessor: 'serial',
    // render: ({ voucher_code }) => (
    //   <Group wrap="nowrap">
    //     <IconChevronRight size={16} />
    //     <span>{voucher_code}</span>
    //   </Group>
    // )
  },
  {
    accessor: 'product_code',
  },
  { accessor: 'expire_date' },
  { accessor: 'depleted', render: ({ available, deplete_date }) => available ? 'No' : deplete_date || 'Yes' },
  { accessor: 'value' },
  { accessor: 'service_reference', title: 'Service reference' },
  { accessor: 'business_unit' },
  { accessor: 'IMEI', title: 'IMEI' },
  { accessor: 'SIMNarrative', title: 'Narrative' },
  { accessor: 'SIMNo', title: 'SIM number' },
  { accessor: 'IMSI', title: 'IMSI' },
  { accessor: 'PUK', title: 'PUK' },
  { accessor: 'available', title: 'Status', render: ({ available }) => (available ? 'Active' : 'Inactive') },
]

const schema: Record<string, DataTableColumn<Record<string, any>>[]> = {
  voucher_main: VOUCHER_SCHEMA,
  batch_order: [
    { accessor: 'batch_id', title: 'Batch ID' },
    {
      accessor: 'product_id',
      title: 'Product ID',
    },
    {
      accessor: 'batch_count',
      title: 'Number of vouchers',
    },
  ],
  product: [
    { accessor: 'product_code' },
    {
      accessor: 'product_id',
      title: 'Product ID',
    },
    { accessor: 'product_name' },
    { accessor: 'supplier' },
  ],
}

export default function AuditLog() {
  const { data, isPending } = useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => (await api.get('voucher-history').json()).results,
  })

  return (
    <>
      <AppHeader title="Audit Log" />

      <AppClientTable
        id="audit-log"
        tableProps={{
          records: data,
          fetching: isPending,
          columns: [
            {
              accessor: 'created_at',
              render: ({ created_at }) => new Date(created_at).toLocaleString(),
              title: 'Timestamp',
            },
            {
              accessor: 'transaction',
            },
            {
              accessor: 'username',
            },
          ],
          rowExpansion: {
            content: ({ record }) => (
              // JSON.stringify(JSON.parse(data.find(row => row.id === record.id).new_data))
              <Box p="xl" bg="#F1F3F5">
                <Card withBorder>
                  <AppClientTable
                    id="audit-log"
                    tableProps={{
                      records: [JSON.parse(data.find(row => row.id === record.id).new_data)].flat(),
                      fetching: isPending,
                      columns: schema[record.database_table],
                    }}
                  />
                </Card>
              </Box>
            ),
          },
        }}
      >
      </AppClientTable>
    </>
  )
}
