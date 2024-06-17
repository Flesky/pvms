import { createBrowserRouter } from 'react-router-dom'
import type { TablerIconsProps } from '@tabler/icons-react'
import { IconBox, IconHistory, IconList, IconSettings, IconTicket } from '@tabler/icons-react'

import DefaultLayout from '../app.tsx'

// import Index from '../pages'
import Products from '../pages/products.tsx'
import BatchUpload from '@/pages/vouchers/batch-upload.tsx'
import Vouchers from '@/pages/vouchers'
import BatchOrders from '@/pages/vouchers/batch-order.tsx'
import ErrorCodes from '@/pages/config/error-codes.tsx'
import AuditLog from '@/pages/audit-log'
import Test from '@/pages/test.tsx'
import VoucherTypes from '@/pages/vouchers/types.tsx'
import type { Actions, Subjects } from '@/utils/ability.ts'

interface NavItem {
  to: string
  label: string
  icon: (props: TablerIconsProps) => JSX.Element
  subject?: Subjects
  action?: Actions
}

interface NavParent {
  label: string
  icon: (props: TablerIconsProps) => JSX.Element
  children?: NavChild[]
  subject?: Subjects
  action?: Actions
}

interface NavChild {
  to: string
  label: string
  subject?: Subjects
  action?: Actions
}

type NavLinks = (NavItem | NavParent)[]

const navLinks: NavLinks = [
  // { to: '/', label: 'Home', icon: IconHome },
  { to: '/', label: 'Products', icon: IconBox, subject: 'Product' },
  // { to: '/vouchers', label: 'Vouchers', icon: IconTicket },
  { label: 'Vouchers', icon: IconTicket, subject: 'Voucher', children: [
    { to: '/vouchers/types', label: 'Types', subject: 'Voucher' },
    { to: '/vouchers', label: 'View vouchers', subject: 'Voucher' },
  ] },

  {
    label: 'Batch Order',
    icon: IconList,
    subject: 'Batch Order',
    children: [
      { to: '/vouchers/batch-orders', label: 'View batch orders', subject: 'Batch Order' },
      { to: '/vouchers/batch-upload', label: 'Batch upload', subject: 'Batch Order', action: 'create' },
    ],
  },

  {
    label: 'History',
    icon: IconHistory,
    to: '/audit-log',
    subject: 'Management',
  },

  // {
  //   label: 'Test',
  //   icon: IconHistory,
  //   to: '/test',
  // },

  { label: 'Configuration', icon: IconSettings, subject: 'Management', children: [
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
        { path: 'types', element: <VoucherTypes /> },
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
