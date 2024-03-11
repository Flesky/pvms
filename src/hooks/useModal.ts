import { useState } from 'react'

const defaultValues = {
  opened: false,
  title: '',
  id: '',
}

export default function useModal() {
  const [state, setState] = useState(defaultValues)
  // const [opened, { open, close }] = useDisclosure()

  return {
    open: (title: string, id = '') => {
      setState({ opened: true, title, id })
    },
    close: () => {
      setState(defaultValues)
    },
    id: state.id,
    modalProps: {
      onClose: () => setState({ opened: false, title: '', id: '' }),
      opened: state.opened,
      title: state.title,
    },
  }
}
