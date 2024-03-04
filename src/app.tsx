import { AppShell, Box, Burger, Button, Group, NavLink as MantineNavLink, Stack, Text } from '@mantine/core'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, withAuthenticationRequired } from 'react-oidc-context'
import { navLinks } from './utils/router'
import { useStore } from './utils/store.ts'

function DefaultLayout() {
  const auth = useAuth()
  const { navbarCollapsed } = useStore()

  return (
    <AppShell
      layout="alt"
      padding={0}
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: navbarCollapsed.mobile, desktop: navbarCollapsed.desktop },
      }}
    >
      <AppShell.Navbar>
        <Box bg="accent" p="md">
          <Group mt="md" justify="space-between">
            <img className="w-32" src="pivotel.png" />
            <Burger color="white" opened={true} onClick={navbarCollapsed.toggleMobile} hiddenFrom="sm" size="sm" />
          </Group>
          <Text mt="6px" mb="xl" c="white">Voucher Management System</Text>
        </Box>
        <Stack p="md" className="h-full" justify="space-between">
          <div>
            {navLinks.map(item => (
              <NavLink
                to={item.to}
                key={item.to}
              >
                {({ isActive }) => (
                  <MantineNavLink
                    label={item.label}
                    leftSection={<item.icon />}
                    classNames={{
                      root: 'px-3 py-2.5 group rounded',
                      label: 'font-medium',
                    }}
                    active={isActive}
                  />
                )}
              </NavLink>
            ))}
          </div>
          <Button
            onClick={async () => {
              await auth.signoutRedirect()
            }}
            color="red"
            variant="light"
          >
            Log out
          </Button>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main className="h-dvh">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

const Layout = withAuthenticationRequired(DefaultLayout, {
  OnRedirecting: () => <div className="p-4 text-sm">Authenticating...</div>,
})

export default Layout
