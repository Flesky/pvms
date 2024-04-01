import {
  Alert,
  Button,
  Card,
  Container,
  FileInput,
  Group,
  Input,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import type { InferType } from 'yup'
import { mixed, number, object, string } from 'yup'
import { useState } from 'react'
import type { HTTPError } from 'ky'
import { IconAlertCircle } from '@tabler/icons-react'
import AppHeader from '@/components/AppHeader.tsx'
import api from '@/utils/api.ts'
import type { GetAllResponse } from '@/types'
import type { Product } from '@/pages/products.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'

const schema = object().shape({
  batch_id: string().required(),
  product_id: number().required(),
  batch_count: number().required().min(0),
  file: mixed().required(),
})

export default function BatchUploadVouchers() {
  const queryClient = useQueryClient()
  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      batch_id: '',
      product_id: 0,
      batch_count: 0,
      file: [],
    },
  })
  const [errorMap, setErrorMap] = useState<Array<{
    row_number: number
    serial: string
    puk: string
    status: string
  }>>()

  const { data: products } = useQuery({
    queryKey: ['product'],
    queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
  })

  const { mutate, variables, isPending, isSuccess } = useMutation({
    mutationFn: async (values: InferType<typeof schema>) => {
      setErrorMap(undefined)
      const formData = new FormData()
      formData.append('batch_id', values.batch_id)
      formData.append('batch_count', String(values.batch_count))
      formData.append('product_id', String(values.product_id))
      formData.append('file', values.file as File)
      return await api.post('batchOrder', { body: formData }).json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully uploaded CSV` })
    },
    onError: async (error) => {
      const { errors, return_code }: { errors: Record<string, Record<string, Array<string>> | number>, return_code: object | string } = await (error as HTTPError).response.json()
      if (typeof return_code === 'object' || return_code !== '-206')
        return
      const { file }: { file: File } = variables!
      const csv = await file.text()
      form.setFieldValue('file', [])

      setErrorMap(csv.split('\n').map((row, i) => {
        const [serial, puk] = row.split(',')
        return {
          row_number: i + 1,
          serial,
          puk,
          // If row number + 1 is not in the errors object, return "Pass"
          status: errors[i + 1] ? `Duplicate ${Object.keys(errors[i + 1]).join(', ')}` : 'Pass',
        }
      }))
    },
  })

  return (
    <>
      <AppHeader title="Batch upload"></AppHeader>

      <Container mt="xs" size="lg">
        <form onSubmit={form.onSubmit(values => mutate(values))}>
          <Stack p="md" gap="lg">
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Batch ID</Input.Label>
              <TextInput required {...form.getInputProps('batch_id')} />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Product reference</Input.Label>
              <Select
                searchable
                clearable
                data={products?.map(({ product_id, product_name }) => ({ label: product_name, value: String(product_id) }))}
                {...form.getInputProps('product_id')}
              />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Batch count</Input.Label>
              <NumberInput aria-label="Batch count" hideControls {...form.getInputProps('batch_count')} />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Attach CSV</Input.Label>
              <FileInput
                accept=".csv"
                aria-label="Attach CSV file"
                placeholder="CSV file"
                leftSectionPointerEvents="none"
                {...form.getInputProps('file')}
              />
            </div>

            {errorMap && (
              <Card withBorder>
                <Alert title="CSV error" color="red" icon={<IconAlertCircle />}>
                  Duplicated records found in the database table. Please fix the issues, then try again.
                </Alert>
                <AppClientTable
                  id="batch-upload-errors"
                  tableProps={{
                    records: errorMap,
                    columns: [
                      { accessor: 'row_number', title: 'Row number' },
                      { accessor: 'serial', title: 'Serial' },
                      { accessor: 'puk', title: 'PUK' },
                      { accessor: 'status', title: 'Status' },
                    ],
                  }}
                >
                </AppClientTable>
              </Card>
            )}

            {isSuccess && (
              <Alert title="Success" color="green" icon={<IconAlertCircle />}>
                Successfully uploaded CSV.
              </Alert>
            )}

            <Group mt="sm" justify="end">
              <Button
                onClick={() => {
                  form.reset()
                  setErrorMap(undefined)
                }}
                variant="default"
              >
                Reset form
              </Button>
              <Button type="submit" loading={isPending}>Upload</Button>
            </Group>
          </Stack>
        </form>
      </Container>
    </>
  )
}
