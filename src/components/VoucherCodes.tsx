import { useQuery } from '@tanstack/react-query'
import { Box } from '@mantine/core'
import api from '../utils/api.ts'
import AppClientTable from './AppClientTable.tsx'

export default function VoucherCodes({ code }) {
  const { data: records, isLoading } = useQuery({
    queryKey: ['voucher', code],
    retry: false,
    queryFn: async () => {
      const res = await api.get(`getVoucher/${code}`).json()
      return res.results[0].voucher_children
    },
  })

  return (
    <Box bg="gray.1" pl={60}>
      <AppClientTable
        id="voucher-codes"
        tableProps={{
          records,
          fetching: isLoading,
          columns: [
            { accessor: 'depleted', render: ({ depleted }) => depleted ? 'Yes' : 'No' },
            { accessor: 'depleted_date' },
            { accessor: 'serviceID', title: 'Service ID' },
            { accessor: 'business_unit' },
            { accessor: 'serial_number' },
          ],
          recordsPerPage: 10,
        }}
      />
    </Box>
  )
}
