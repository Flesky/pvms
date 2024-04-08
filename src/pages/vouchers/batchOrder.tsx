import { useQuery } from '@tanstack/react-query'
import { Button } from '@mantine/core'
import type { GetAllResponse, Result } from '@/types'
import type { Voucher } from '@/pages/vouchers/index.tsx'
import api from '@/utils/api.ts'
import AppHeader from '@/components/AppHeader.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'
import { router } from '@/utils/router.tsx'

export interface BatchOrder extends Result {
  id: number
  batch_id: number
  product_id: number
  batch_count: number
  voucher: Voucher
}

export default function BatchOrders() {
  const { data: records, isPending } = useQuery({
    queryKey: ['batchOrder'],
    queryFn: async () => (await api.get('batchOrder').json<GetAllResponse<BatchOrder>>()).results,
  })

  return (
    <>
      <AppHeader title="Batch orders">
      </AppHeader>
      <AppClientTable<BatchOrder>
        id="products"
        tableProps={{
          records,
          fetching: isPending,
          columns: [
            { accessor: 'batch_id', title: 'Batch ID' },
            {
              accessor: 'product_id',
              title: 'Product ID',
            },
            {
              accessor: 'batch_count',
              title: 'Number of vouchers',
            },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: ({ batch_id }) => (
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  onClick={() => {
                    router.navigate(`/vouchers?batchId=${batch_id}`)
                  }}
                >
                  View
                </Button>
              )
              ,
            },
          ],
        }}
      />
    </>
  )
}
