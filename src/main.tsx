import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import { RouterProvider } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from 'react-oidc-context'
import { router } from './utils/router'
import theme from './utils/theme.ts'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-datatable/styles.css'
import './index.css'
import { config } from './utils/oidc.ts'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider
      {...config}
      onSigninCallback={() => {
        window.history.replaceState({}, document.title, window.location.pathname)
      }}
    >
      <MantineProvider theme={theme}>
        <ModalsProvider
          labels={{ cancel: 'Cancel', confirm: 'Save' }}
        >
          <QueryClientProvider client={queryClient}>
            <Notifications position="top-center" />
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  </React.StrictMode>,
)
