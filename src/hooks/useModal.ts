import { useState } from 'react'

export default function useModal<T>() {
  const [state, setState] = useState<
    { opened: boolean, title: string, id?: T }
  >({
    opened: false,
    title: '',
  })

  return {
    open: (title: string, id?: T) => {
      setState({ opened: true, title, id })
    },
    close: () => {
      setState({ ...state, opened: false })
    },
    id: state.id,
    modalProps: {
      onClose: () => setState({ ...state, opened: false }),
      opened: state.opened,
      title: state.title,
    },
  }
}
