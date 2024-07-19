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
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useForm, yupResolver } from '@mantine/form'
import type { InferType } from 'yup'
import { mixed, number, object, string } from 'yup'

import { useState } from 'react'
import type { HTTPError } from 'ky'
import { IconAlertCircle } from '@tabler/icons-react'
import { DateInput } from '@mantine/dates'
import dayjs from 'dayjs'
import AppHeader from '@/components/AppHeader.tsx'
import api from '@/utils/api.ts'
import type { GetAllResponse } from '@/types'
import type { Product } from '@/pages/products.tsx'
import AppClientTable from '@/components/AppClientTable.tsx'
import type { VoucherType } from '@/pages/vouchers/types.tsx'

export interface FieldError {
  error_code: string
  error_message: string
  error_field: string
}

export interface BatchUploadErrorSchema {
  message: string
  return_code: string
  errors: FieldError[]
  csvDuplicates: {
    [key: string]: FieldError[]
  }
  duplicated_rows: Array<{
    serial?: number
    rows: Array<number>
    PUK?: number
  }>
  csv: {
    serial: Array<string>
    PUK: Array<string>
  }
}

const schema = object().shape({
  batch_id: string().required().label('Batch ID'),
  product_id: number().required().label('Product reference'),
  // voucher_type_id: number().required(),
  batch_count: number().required().min(1).label('Batch count'),
  expiry_days: number().transform((value, original) => original === '' ? undefined : value).min(1).label('Expiry date alert threshold'),
  file: mixed().test(
    'required',
    'File is required',
    value => value instanceof File,
  ),
  expiry_date: string().label('Expiry date'),
})

export default function BatchUploadVouchers() {
  const queryClient = useQueryClient()
  const form = useForm<InferType<typeof schema>>({
    initialValues: {
      batch_id: '',
      product_id: 0,
      // voucher_type_id: 0,
      expiry_date: '',
      expiry_days: '',
      batch_count: 0,
      file: undefined,
    },
    validate: yupResolver(schema),
    transformValues: values => ({
      ...values,
      expiry_date: values.expiry_date ? new Date(values.expiry_date).toISOString().split('T')[0] : undefined,
    }),
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

  // const { data: products } = useQuery({
  //   queryKey: ['product'],
  //   queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
  // })

  const { products } = useQueries({
    queries: [
      {
        queryKey: ['product'],
        queryFn: async () => (await api.get('product').json<GetAllResponse<Product>>()).results,
      },
      {
        queryKey: ['voucherType'],
        queryFn: async () => (await api.get('voucherType').json<GetAllResponse<VoucherType>>()).results,
      },
    ],
    combine: (results) => {
      return {
        products: results[0].data,
        voucherTypes: results[1].data,
        isPending: results.some(result => result.isPending),
      }
    },
  })

  const { mutate, isPending, isSuccess, data: vouchersAdded } = useMutation({
    mutationFn: async (values: InferType<typeof schema>) => {
      setErrorMap(undefined)
      const formData = new FormData()
      formData.append('batch_id', String(values.batch_id))
      formData.append('batch_count', String(values.batch_count))
      formData.append('product_id', String(values.product_id))
      formData.append('expiry_date', String(values.expiry_date))
      formData.append('expiry_days', String(values.expiry_days))
      // formData.append('voucher_type_id', String(values.voucher_type_id))
      formData.append('file', values.file as File)
      return (await api.post('batchOrder', { body: formData }).json<{
        vouchers: [{ serial: string, PUK: string }]
      }>()).vouchers
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher'] })
      // notifications.show({ message: `Successfully uploaded CSV` })
    },
    onError: async (error) => {
      // const { errors, duplicated_rows, csv }: ErrorSchema = await (error as HTTPError).response.json()
      // const { batch_id, batch_count, product_id, file, rows } = errors
      //
      // form.setFieldValue('file', [])
      //
      // setErrorMap({ errors:
      //   [batch_id, batch_count, product_id, file, rows && 'Duplicate entries were found in the database.', duplicated_rows?.length ? 'Duplicate entries were found in the CSV file.' : null].flat(), data: csv.serial.map((serial, i) => ({
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

      const { errors, csvDuplicates, duplicated_rows, csv }: BatchUploadErrorSchema = await (error as HTTPError).response.json()
      form.setFieldValue('file', [])

      setErrorMap({
        errors: [...errors.map(({ error_message }) => error_message), csvDuplicates?.length && 'Duplicate entries were found in the database.', duplicated_rows?.length && 'Duplicate entries were found in the CSV file.',
        ].filter(e => !!e) as string[],
        data: csv.serial.map((serial, i) => ({
          row_number: i + 1,
          serial,
          puk: csv.PUK[i],
          conflicts: (csvDuplicates[i + 1])
            ? csvDuplicates[i + 1].map(({ error_field }) => error_field)
            : [],
          cause:
            duplicated_rows?.filter(({ rows }) => rows.includes(i + 1)).length
              ? 'CSV'
              : 'Database'
          ,
        })),
      })
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
              <TextInput aria-label="Batch ID" required {...form.getInputProps('batch_id')} />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Product reference</Input.Label>
              <Select
                aria-label="Product reference"
                searchable
                clearable
                data={products?.map(({ id, supplier, product_name, status }) => ({ label: `${supplier}: ${product_name}`, value: String(id), disabled: !status }))}
                {...form.getInputProps('product_id')}
              />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>Expiry date</Input.Label>
              <DateInput minDate={dayjs().add(1, 'day').toDate()} aria-label="Expiry date" {...form.getInputProps('expiry_date')} />
            </div>
            <div className="grid md:grid-cols-2 md:items-baseline">
              <div className="mr-4 flex flex-col">
                <Input.Label>Expiry date alert threshold</Input.Label>
                <Input.Description>Sends out an alert the given number of days before the expiry date. Leave blank to disable.</Input.Description>
              </div>
              <NumberInput aria-label="Expiry days" min={1} {...form.getInputProps('expiry_days')} />
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
                      {
                        accessor: 'status',
                        render: ({ conflicts }) => conflicts?.length
                          ? `Duplicate ${conflicts.map(key =>
                            key.charAt(0).toUpperCase() + key.slice(1),
                          ).join(', ')}`
                          : 'Pass',
                      },
                      { accessor: 'cause', render: ({ conflicts, cause }) => conflicts?.length ? cause : '' },
                      {
                        accessor: 'action',
                        render: ({ serial, puk, conflicts, cause }) => (conflicts?.length && cause === 'Database')
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
                          : '',
                      },
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
                    records: vouchersAdded,
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
