import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { AuthProvider } from 'react-oidc-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { oidcConfig } from './utils/auth'
import { router } from './utils/router.tsx'
import theme from './utils/theme'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import 'mantine-datatable/styles.css'
import './index.css'

const queryClient = new QueryClient()

function signInCallback() {
  window.history.replaceState({}, document.title, window.location.pathname)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider
      {...oidcConfig}
      onSigninCallback={signInCallback}
    >
      <MantineProvider theme={theme}>
        <ModalsProvider labels={{ confirm: 'Submit', cancel: 'Cancel' }}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}></RouterProvider>
            <ReactQueryDevtools initialIsOpen={false} />

            <Notifications position="top-center" />
          </QueryClientProvider>
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  </React.StrictMode>,
)
