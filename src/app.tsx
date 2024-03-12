import { Outlet, NavLink as RouterNavLink, matchPath, useLocation } from 'react-router-dom'
import { AppShell, Box, Burger, Button, Group, NavLink, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createContext } from 'react'
import { useAuth, withAuthenticationRequired } from 'react-oidc-context'
import { navLinks } from './utils/router'

export const NavbarContext = createContext({
  toggleDesktop: () => {},
  toggleMobile: () => {},
  desktopOpened: true,
  mobileOpened: false,
})

function Layout() {
  const auth = useAuth()
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const { pathname } = useLocation()

  return (
    <AppShell
      navbar={{
        collapsed: { desktop: !desktopOpened, mobile: !mobileOpened },
        breakpoint: 'sm',
        width: 300,
      }}
      header={{ height: 60 }}
      layout="alt"
    >
      <AppShell.Navbar>
        <Box bg="accent" p="md">
          <Group mt="md" justify="space-between">
            <img className="w-32" src="pivotel.png" alt="Pivotel logo" />
            <Burger color="white" opened={true} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          </Group>
          <Text mt="6px" mb="xl" c="white">Voucher Management System</Text>
        </Box>
        <Stack p="md" className="h-full" justify="space-between">
          <div>
            {navLinks.map(item => (
              <NavLink
                classNames={{
                  root: 'px-3 py-2.5 group rounded',
                  label: 'font-medium',
                }}
                styles={{
                  root: {
                  },
                }}
                onClick={() => {
                  if (pathname !== item.to)
                    toggleMobile()
                }}
                active={!!matchPath(pathname, item.to)}
                leftSection={<item.icon />}
                component={RouterNavLink}
                label={item.label}
                key={item.to}
                to={item.to}
              />
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
        <NavbarContext.Provider value={{
          desktopOpened,
          toggleDesktop,
          mobileOpened,
          toggleMobile,
        }}
        >
          <Outlet />
        </NavbarContext.Provider>
      </AppShell.Main>
    </AppShell>
  )
}

const DefaultLayout = withAuthenticationRequired(Layout, {
  OnRedirecting: () => <Box p="md">Authenticating...</Box>,
})

export default DefaultLayout
