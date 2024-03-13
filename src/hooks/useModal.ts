import { useState } from 'react'

export default function useModal() {
  const [state, setState] = useState({
    opened: false,
    title: '',
    id: '',
  })

  return {
    open: (title: string, id = '') => {
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
