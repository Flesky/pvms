import { Badge, Button, Card, Group, Stack, Title } from '@mantine/core'
import { useAuth } from 'react-oidc-context'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import AppHeader from '../components/AppHeader.tsx'
import AppNewTable from '@/components/AppNewTable.tsx'
import api from '@/utils/api.ts'
import type { Product } from '@/pages/products.tsx'
import { Can } from '@/components/Can.ts'

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { alertNotification } = useQueries({
    queries: [
      { queryKey: ['alertNotification'], queryFn: async () => (await api.get('alertNotification').json<{ alerted_vouchers: Product[] }>()).alerted_vouchers },
    ],
    combine: queries => ({ alertNotification: queries[0] }),
  })

  const { mutate: triggerEmailAlert, isPending: triggerEmailAlertPending } = useMutation({
    mutationFn: async () => await api.get('triggerAlert', {
      timeout: 60000,
    }),
    onSuccess: () => {
      notifications.show({ message: `Successfully notified recepients.`, color: 'green' })
    },
    onError: () => {
      notifications.show({ message: 'Failed to notify recepients.', color: 'red' })
    },
  })

  return (
    <>
      <AppHeader title="Dashboard" />
      <Title order={1} size="h2" p="lg">
        Good morning,
        {' '}
        {user.profile.given_name}
      </Title>

      <Stack px="lg">
        <Can I="view" a="Voucher">
          <Card withBorder>
            <Group justify="space-between" align="baseline" gap={0} mb="md">
              <Title order={2} size="h3">Low Stock Vouchers</Title>
              <Group>
                {/* { */}
                {/*  !alertNotification.isPending */}
                {/*  && ( */}
                {/*    <Text size="sm" c="dimmed"> */}
                {/*      Last updated: */}
                {/*      {' '} */}
                {/*      {new Date(alertNotification.dataUpdatedAt).toLocaleTimeString()} */}
                {/*    </Text> */}
                {/*  ) */}
                {/* } */}
                <Button loading={alertNotification.data && alertNotification.isFetching} onClick={() => queryClient.invalidateQueries({ queryKey: ['alertNotification'] })} variant="default">Refresh</Button>
                <Button loading={triggerEmailAlertPending} onClick={() => triggerEmailAlert()}>Notify alert recepients</Button>
              </Group>
            </Group>
            <AppNewTable
              data={alertNotification.data}
              isLoading={alertNotification.isPending}
              columns={[
                {
                  accessorKey: 'product_code',
                  header: 'Product Code',
                },
                {
                  accessorKey: 'product_name',
                  header: 'Product Name',
                },
                {
                  accessorKey: 'supplier',
                  header: 'Supplier',
                },
                {
                  accessorKey: 'status',
                  header: 'Status',
                  cell: ({ cell }) => cell.getValue() ? <Badge>Active</Badge> : <Badge color="gray">Inactive</Badge>,
                },
                {
                  accessorKey: 'available_voucher_count',
                  header: 'Available',
                },
                {
                  accessorKey: 'threshold_alert',
                  header: 'Threshold Alert',
                },
              ]}
            >
            </AppNewTable>
          </Card>
        </Can>
      </Stack>
    </>
  )
}
