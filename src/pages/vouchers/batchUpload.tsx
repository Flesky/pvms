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
  Text,
  TextInput,
} from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, yupResolver } from '@mantine/form'
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

export interface ErrorSchema {
  message: string
  return_code: string
  errors: {
    batch_id: Array<string>
    batch_count: Array<string>
    product_id: Array<string>
    file: Array<string>
    rows: {
      [row: string]: {
        serial: Array<string>
        PUK: Array<string>
      }
    }
  }
  duplicated_rows: [
    {
      serial: number
      rows: number[]
    } | {
      PUK: number
      rows: number[]
    },
  ]
  csv: {
    serial: Array<string>
    PUK: Array<string>
  }
}

const schema = object().shape({
  batch_id: string().required(),
  product_id: number().required(),
  batch_count: number().required().min(1),
  file: mixed().test(
    'required',
    'File is required',
    value => value instanceof File,
  ),
})

export default function BatchUploadVouchers() {
  const queryClient = useQueryClient()
  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      batch_id: '',
      product_id: 0,
      batch_count: 0,
      file: undefined,
    },
    validate: yupResolver(schema),
  })
  const [errorMap, setErrorMap] = useState<
    // eslint-disable-next-line style/member-delimiter-style
    { errors: string[]; data: Array<{
      row_number: number
      serial: string
      puk: string
      status: string
      cause: string
    }> }
>()

  const { data: products } = useQuery({
    queryKey: ['product'],
    queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
  })

  const { mutate, isPending, isSuccess, data } = useMutation({
    mutationFn: async (values: InferType<typeof schema>) => {
      setErrorMap(undefined)
      const formData = new FormData()
      formData.append('batch_id', values.batch_id)
      formData.append('batch_count', String(values.batch_count))
      formData.append('product_id', String(values.product_id))
      formData.append('file', values.file as File)
      return await api.post('batchOrder', { body: formData }).json<{
        vouchers: [{ serial: string, PUK: string }]
      }>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      notifications.show({ message: `Successfully uploaded CSV` })
    },
    onError: async (error) => {
      const { errors, duplicated_rows, csv }: ErrorSchema = await (error as HTTPError).response.json()
      const { batch_id, batch_count, product_id, file, rows } = errors

      form.setFieldValue('file', [])

      setErrorMap({ errors:
        [batch_id, batch_count, product_id, file, rows && 'Duplicate entries were found in the CSV file.'].flat(), data: csv.serial.map((serial, i) => ({
        row_number: i + 1,
        serial,
        puk: csv.PUK[i],
        // If row number + 1 is not in the errors object, return "Pass"
        status: rows[String(i + 1)]
          ? `Duplicate ${Object.keys(rows[String(i + 1)]).map(key =>
                key.charAt(0).toUpperCase() + key.slice(1),
              ).join(', ')}`
          : 'Pass',
        // cause: JSON.stringify(duplicated_rows.filter(({ rows }) => rows.includes(i + 1))),
        // Use set addition to get the unique rows
        cause: duplicated_rows.filter(({ rows }) => rows.includes(i + 1)).length
          ? `CSV: Rows ${JSON.stringify([...new Set(duplicated_rows.filter(({ rows }) => rows.includes(i + 1)).flatMap(({ rows }) => rows))])}`
          : 'Database',
      })) })
    },
  })

  return (
    <>
      <AppHeader title="Batch upload" />

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
              <NumberInput aria-label="Batch count" min={0} hideControls {...form.getInputProps('batch_count')} />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>CSV file</Input.Label>
              <FileInput
                accept=".csv"
                aria-label="Select CSV file"
                placeholder="Select CSV file"
                leftSectionPointerEvents="none"
                {...form.getInputProps('file')}
              />
            </div>

            <Group justify="end">
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

            {errorMap && (
              <Card withBorder>
                <Alert title="Errors" color="red" icon={<IconAlertCircle />}>
                  {errorMap.errors?.map(error => (
                    <Text key={error}>
                      {error}
                    </Text>
                  ))}
                </Alert>
                <AppClientTable
                  id="batch-upload-errors"
                  tableProps={{
                    idAccessor: 'row_number',
                    records: errorMap.data,
                    columns: [
                      { accessor: 'row_number' },
                      { accessor: 'serial' },
                      { accessor: 'puk', title: 'PUK' },
                      { accessor: 'status' },
                      { accessor: 'cause', render: ({ status, cause }) => status === 'Pass' ? '' : cause },
                    ],
                    rowBackgroundColor: ({ status }) => status === 'Pass' ? '' : '#FFA8A8',
                  }}
                >
                </AppClientTable>
              </Card>
            )}

            {isSuccess && (
              <Card withBorder>
                <Alert title="Success" color="green" icon={<IconAlertCircle />}>
                  Successfully uploaded CSV.
                </Alert>
                <AppClientTable
                  id="batch-upload-success"
                  tableProps={{
                    idAccessor: 'row_number',
                    records: data?.vouchers,
                    columns: [
                      { accessor: 'serial', title: 'Serial' },
                      { accessor: 'PUK', title: 'PUK' },
                    ],
                  }}
                >
                </AppClientTable>
              </Card>
            )}
          </Stack>
        </form>
      </Container>
    </>
  )
}
