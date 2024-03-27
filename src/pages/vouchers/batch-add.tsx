import { Container, FileInput, Input, NumberInput, Select, Stack, TextInput } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { mixed, number, object, string } from 'yup'
import AppHeader from '@/components/AppHeader.tsx'
import api from '@/utils/api.ts'
import type { GetAllResponse, GetResponse } from '@/types'
import type { Product } from '@/pages/products.tsx'
import type { Voucher } from '@/pages/vouchersOld.tsx'

const schema = object().shape({
  batch_id: string().required(),
  product_id: number().required(),
  batch_count: number().min(0),
  file: mixed().required(),
})

export default function BatchAddVouchers() {
  const queryClient = useQueryClient()

  const { data: products, isFetching } = useQuery({
    queryKey: ['product'],
    queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
  })

  const form = useForm({
    initialValues: {
      batch_id: '',
      product_id: '',
      batch_count: 0,
      file: [],
    },
  })

  const { mutate, error, variables, isPending } = useMutation({
    mutationFn: async (values: schema) => {
      const formData = new FormData()
      formData.append('batch_id', values.batch_id)
      formData.append('batch_count', values.batch_count)
      formData.append('product_id', values.product_id)
      formData.append('file', values.file)
      const res = await api.post('batchOrder', { body: formData }).json()
    },

    onSuccess: (data: GetResponse<Voucher>) => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully uploaded CSV` })
      formClose()
    },
  })

  return (
    <>
      <AppHeader title="Batch upload"></AppHeader>

      <Container size="lg">
        <form onSubmit={form.onSubmit(values => save({ values, id: formId }))}>
          <Stack p="md">
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label>Batch ID</Input.Label>
              <TextInput />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label>Product reference</Input.Label>
              <Select
                searchable
                clearable
                data={products?.map(({ product_id, product_name }) => ({ label: product_name, value: String(product_id) }))}
              />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label>Batch count</Input.Label>
              <NumberInput aria-label="Batch count" hideControls />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label>Attach CSV</Input.Label>
              <FileInput
                aria-label="Attach CSV"
                placeholder="Your CV"
                leftSectionPointerEvents="none"
              />
            </div>
          </Stack>
        </form>
      </Container>
    </>
  )
}
