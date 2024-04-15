import { createBrowserRouter } from 'react-router-dom'
import type { TablerIconsProps } from '@tabler/icons-react'
import { IconBox, IconHistory, IconSettings, IconTicket } from '@tabler/icons-react'

import DefaultLayout from '../app.tsx'

// import Index from '../pages'
import Products from '../pages/products.tsx'
import BatchUpload from '@/pages/vouchers/batch-upload.tsx'
import Vouchers from '@/pages/vouchers'
import BatchOrders from '@/pages/vouchers/batch-order.tsx'
import ErrorCodes from '@/pages/config/error-codes.tsx'
import AuditLog from '@/pages/audit-log'
import Test from '@/pages/test.tsx'

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
    { to: '/vouchers', label: 'View vouchers' },
    { to: '/vouchers/batch-orders', label: 'Batch orders' },
    { to: '/vouchers/batch-upload', label: 'Batch upload' },
  ] },

  {
    label: 'History',
    icon: IconHistory,
    to: '/audit-log',
  },

  // {
  //   label: 'Test',
  //   icon: IconHistory,
  //   to: '/test',
  // },

  { label: 'Configuration', icon: IconSettings, children: [
    { to: '/settings/error-codes', label: 'Error message overrides' },
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
        { path: 'batch-orders', element: <BatchOrders /> },
        { path: 'batch-upload', element: <BatchUpload /> },
      ] },

      {
        path: '/audit-log',
        element: <AuditLog />,
      },

      { path: 'settings/error-codes', element: <ErrorCodes /> },
      { path: 'test', element: <Test /> },
    ],
    element: <DefaultLayout />,
    path: '/',
  },
])

export { navLinks, router }
