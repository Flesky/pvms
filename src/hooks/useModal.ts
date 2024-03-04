import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'

export default function useModal() {
  const [title, setTitle] = useState('')
  const [opened, { open, close }] = useDisclosure()

  return {
    open: (title: string) => {
      setTitle(title)
      open()
    },
    close,
    modalProps: {
      onClose: () => close(),
      opened,
      title,
    },
  }
}
