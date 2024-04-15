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
} from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, yupResolver } from '@mantine/form'
import type { InferType } from 'yup'
import { mixed, number, object } from 'yup'
import { useState } from 'react'
import type { HTTPError } from 'ky'
import { IconAlertCircle } from '@tabler/icons-react'
import AppHeader from '@/components/AppHeader.tsx'
import type { Error, ErrorResult } from '@/utils/api.ts'
import api, { transformErrors } from '@/utils/api.ts'
import type { GetAllResponse } from '@/types'
import type { Product } from '@/pages/products.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'

export interface BatchUploadErrorResult extends ErrorResult {
  csv: {
    serial: Array<string>
    PUK: Array<string>
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
  csvDuplicates: {
    rows: {
      [rowNumber: string]: {
        [key: string]: Error
      }
    }
  } | []
}

const schema = object().shape({
  batch_id: number().required().label('Batch ID'),
  product_id: number().required().label('Product reference'),
  batch_count: number().required().min(1).label('Batch count'),
  file: mixed().test(
    'required',
    'File is required',
    value => value instanceof File,
  ),
})

export default function BatchUploadVouchers() {
  const { invalidateQueries } = useQueryClient()
  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      batch_id: 0,
      product_id: 0,
      batch_count: 0,
      file: undefined,
    },
    validate: yupResolver(schema),
    validateInputOnBlur: true,
  })
  const [errorMap, setErrorMap] = useState<
    // eslint-disable-next-line style/member-delimiter-style
    { errors: string[]; data: Array<{
      row_number: number
      serial: string
      puk: string
      conflicts: string[]
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
      formData.append('batch_id', String(values.batch_id))
      formData.append('batch_count', String(values.batch_count))
      formData.append('product_id', String(values.product_id))
      formData.append('file', values.file as File)
      return await api.post('batchOrder', { body: formData }).json<{
        vouchers: [{ serial: string, PUK: string }]
      }>()
    },
    onSuccess: () => {
      invalidateQueries({ queryKey: ['voucher'] })
      // notifications.show({ message: `Successfully uploaded CSV` })
    },
    onError: async (error) => {
      const { errors, csv, duplicated_rows, csvDuplicates }: BatchUploadErrorResult = await (error as HTTPError).response.json()

      form.setErrors(transformErrors(errors))
      form.setFieldValue('file', [])
      form.setFieldError('file', undefined)

      // Errors: Please check the form for errors and try again.
      // CSV duplicates: Duplicate entries were found in the database.
      // Duplicated rows: Duplicate entries were found in the CSV file.

      const itemizedErrors: Array<string> = []
      if (errors.length) {
        itemizedErrors.push('Please check the form for errors and try again.')
        errors.forEach(({ error_message }) => {
          itemizedErrors.push(`• ${error_message}`)
        })
      }
      if (!Array.isArray(csvDuplicates) || duplicated_rows?.length)
        itemizedErrors.push('Duplicate entries were found in the CSV file.')
      setErrorMap({
        errors: itemizedErrors,
        data: csv.serial.map((serial, i) => ({
          row_number: i + 1,
          serial,
          puk: csv.PUK[i],
          conflicts: (!Array.isArray(csvDuplicates) && csvDuplicates?.rows[String(i + 1)])
            ? Object.keys(csvDuplicates.rows[String(i + 1)])
            : [],
          cause: duplicated_rows.filter(({ rows }) => rows.includes(i + 1)).length
            ? `CSV: Rows ${JSON.stringify([...new Set(duplicated_rows.filter(({ rows }) => rows.includes(i + 1)).flatMap(({ rows }) => rows))])}`
            : 'Database',
        })),
      })

      // setErrorMap({ errors:
      //   [csvDuplicates && 'Duplicate entries were found in the database.', duplicated_rows?.length ? 'Duplicate entries were found in the CSV file.' : null].flat(), data: csv.serial.map((serial, i) => ({
      //   row_number: i + 1,
      //   serial,
      //   puk: csv.PUK[i],
      //   // If row number + 1 is not in the errors object, return "Pass"
      //   // cause: JSON.stringify(duplicated_rows.filter(({ rows }) => rows.includes(i + 1))),
      //   // Use set addition to get the unique rows
      //   conflicts: (rows && rows[String(i + 1)])
      //     ? Object.keys(rows[String(i + 1)])
      //   //  .map(key =>
      //   //  key.charAt(0).toUpperCase() + key.slice(1),
      //   // )
      //     : [],
      //   cause: duplicated_rows.filter(({ rows }) => rows.includes(i + 1)).length
      //     ? `CSV: Rows ${JSON.stringify([...new Set(duplicated_rows.filter(({ rows }) => rows.includes(i + 1)).flatMap(({ rows }) => rows))])}`
      //     : 'Database',
      // })) })
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
              <NumberInput aria-label="Batch ID" hideControls required {...form.getInputProps('batch_id')} />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Product reference</Input.Label>
              <Select
                aria-label="Product reference"
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
                      // { accessor: 'status' },
                      { accessor: 'status', render: ({ conflicts }) => conflicts?.length
                        ? `Duplicate ${conflicts.map(key =>
                          key.charAt(0).toUpperCase() + key.slice(1),
                        ).join(', ')}`
                        : 'Pass' },
                      { accessor: 'cause', render: ({ conflicts, cause }) => conflicts?.length ? cause : '' },
                      { accessor: 'action', render: ({ serial, puk, conflicts, cause }) => (conflicts?.length && cause === 'Database')
                        ? (
                          <Button
                            onClick={() => {
                              window.open(`/vouchers?q=${conflicts.includes('serial') ? serial : puk}`)
                            }}
                            variant="default"
                          >
                            View
                          </Button>
                          )
                        : '' },
                    ],
                    rowBackgroundColor: ({ conflicts }) => conflicts?.length ? '#FFA8A8' : undefined,
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
