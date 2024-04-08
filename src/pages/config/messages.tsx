import { Button, Container, Group, Input, Select, Stack, TextInput } from '@mantine/core'
import AppHeader from '@/components/AppHeader.tsx'

const fields = {
  errors: {
    'Batch ID already exists': 'The batch ID already exists.',
    'Batch ID is required': 'The batch ID is required.',
    'Product ID not found': 'The product ID is not found.',
    'Product ID is required': 'The product ID is required.',
    'Mismatch batch count': 'The number of vouchers in the CSV does not match the batch count.',
    'Batch count is required': 'The batch count is required.',
    'Missing CSV': 'The CSV file is required.',
    'Invalid CSV': 'The CSV file is invalid.',
    'Duplicates found in CSV': 'Duplicates found in the CSV file.',
    'Duplicates found in database': 'Duplicates found in the database.',
  },
}

export default function ErrorMessages() {
  return (
    <>
      <AppHeader title="Error messages" />
      <Container size="lg" mt="xs">
        <Stack p="md" gap="lg">
          <Select
            value="errors"
            data={[
              { value: 'errors', label: 'Batch upload errors' },
              { value: 'products', label: 'Product page errors' },
              { value: 'vouchers', label: 'Voucher page errors' },
            ]}
          >
          </Select>
          {Object.entries(fields.errors).map(([key, value]) => (
            <div key={key} className="grid md:grid-cols-2 md:items-baseline">
              <Input.Label required>{key}</Input.Label>
              <TextInput
                aria-label="Product reference"
                value={value}
              />
            </div>
          ))}
          <Group mt="md" justify="end">
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </Container>
    </>
  )
}
