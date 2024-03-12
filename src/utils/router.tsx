import { createBrowserRouter } from 'react-router-dom'
import { IconBox, IconTicket } from '@tabler/icons-react'

import DefaultLayout from '../app.tsx'

// import Index from '../pages'
import Products from '../pages/products.tsx'
import Vouchers from '../pages/vouchers.tsx'

const navLinks = [
  // { to: '/', label: 'Home', icon: IconHome },
  { to: '/', label: 'Products', icon: IconBox },
  { to: '/vouchers', label: 'Vouchers', icon: IconTicket },
]

const router = createBrowserRouter([
  {
    children: [
      // { path: '', element: <Index /> },
      { path: '', element: <Products /> },
      { path: 'vouchers', element: <Vouchers /> },
    ],
    element: <DefaultLayout />,
    path: '/',
  },
])

export { navLinks, router }
