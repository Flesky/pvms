import { createBrowserRouter } from 'react-router-dom'
import type { TablerIconsProps } from '@tabler/icons-react'
import { IconBox, IconTicket } from '@tabler/icons-react'

import DefaultLayout from '../app.tsx'

// import Index from '../pages'
import Products from '../pages/products.tsx'
import BatchUploadVouchers from '@/pages/vouchers/batch-upload.tsx'
import Vouchers from '@/pages/vouchers'

interface NavItem {
  to: string
  label: string
  icon: (props: TablerIconsProps) => JSX.Element
}

interface NavParent {
  label: string
  icon: (props: TablerIconsProps) => JSX.Element
  children?: NavChild[]
}

interface NavChild {
  to: string
  label: string
}

type NavLinks = (NavItem | NavParent)[]

const navLinks: NavLinks = [
  // { to: '/', label: 'Home', icon: IconHome },
  { to: '/', label: 'Products', icon: IconBox },
  // { to: '/vouchers', label: 'Vouchers', icon: IconTicket },
  { label: 'Vouchers', icon: IconTicket, children: [
    { to: '/vouchers', label: 'View all' },
    { to: '/vouchers/batch', label: 'Batch upload' },
  ] },
  // { to: '/vouchers/add', label: 'Add VouchersDeprecated', icon: IconTicket },
]

const router = createBrowserRouter([
  {
    children: [
      // { path: '', element: <Index /> },
      { path: '', element: <Products /> },

      { path: 'vouchers', children: [
        { path: '', element: <Vouchers /> },
        { path: 'batch', element: <BatchUploadVouchers /> },
      ] },
    ],
    element: <DefaultLayout />,
    path: '/',
  },
])

export { navLinks, router }
