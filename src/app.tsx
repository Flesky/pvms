import { Outlet, NavLink as RouterNavLink, matchPath, useLocation } from 'react-router-dom'
import { AppShell, Avatar, Box, Burger, Group, Menu, NavLink, Stack, Text, UnstyledButton, rem } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createContext } from 'react'
import { useAuth, withAuthenticationRequired } from 'react-oidc-context'
import { IconChevronRight } from '@tabler/icons-react'
import { navLinks } from './utils/router'
import { changePasswordUrl } from '@/utils/oidc.ts'

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
      <AppShell.Navbar bg="#1A1B41">
        <Box p="md">
          <Group mt="md" justify="space-between">
            <img className="w-32" src="/pulsar-blue.png" alt="Pulsar logo" />
            <Burger color="white" opened={true} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          </Group>
          <Text mt="8px" mb="xl" c="white">Voucher Management System</Text>
        </Box>
        <Stack className="h-full" justify="space-between">
          <Stack p="md" gap={0}>
            {navLinks.map((item) => {
              if ('to' in item) {
                return (
                  <NavLink
                    classNames={{
                      root: 'px-3 py-2.5 group rounded',
                      label: 'font-medium',
                    }}
                    onClick={() => {
                      if (pathname !== item.to)
                        toggleMobile()
                    }}
                    active={!!matchPath(pathname, item.to)}
                    to={item.to}
                    leftSection={<item.icon />}
                    component={RouterNavLink}
                    label={item.label}
                    key={item.label}
                  />
                )
              }
              else {
                return (
                  <NavLink
                    classNames={{
                      root: 'px-3 py-2.5 group rounded',
                      label: 'font-medium',
                    }}
                    childrenOffset={36}
                    leftSection={<item.icon />}
                    label={item.label}
                    key={item.label}
                    defaultOpened={!!item.children?.some(child => matchPath(pathname, child.to))}
                  >
                    {item.children?.map(child => (
                      <NavLink
                        classNames={{
                          root: 'px-3 py-2.5 group rounded',
                          label: 'font-medium',
                        }}
                        onClick={() => {
                          if (pathname !== child.to)
                            toggleMobile()
                        }}
                        active={!!matchPath(pathname, child.to)}
                        to={child.to}
                        component={RouterNavLink}
                        label={child.label}
                        key={child.label}
                      />
                    ))}
                  </NavLink>
                )
              }
            })}
          </Stack>
          <Menu withArrow>
            <Menu.Target>
              <UnstyledButton className="px-4 py-3 hover:bg-white/10">
                <Group c="white">
                  <Avatar
                    bg="gray.2"
                    radius="xl"
                  />

                  <div className="flex-1">
                    <Text size="sm" fw={500}>
                      {auth.user?.profile.preferred_username}
                    </Text>

                    <Text c="dimmed" size="xs">
                      {auth.user?.profile.email}
                    </Text>
                  </div>

                  <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item component="a" href={changePasswordUrl}>
                Change password
              </Menu.Item>
              <Menu.Item
                onClick={async () => {
                  await auth.signoutRedirect()
                }}
              >
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          {/* <Button */}
          {/*  onClick={async () => { */}
          {/*    await auth.signoutRedirect() */}
          {/*  }} */}
          {/*  color="red" */}
          {/*  variant="light" */}
          {/* > */}
          {/*  Log out */}
          {/* </Button> */}
          {/* <Button */}
          {/*  component="a" */}
          {/*  href={changePasswordUrl} */}
          {/* > */}
          {/*  {JSON.stringify(auth.user?.profile.preferred_username)} */}
          {/* </Button> */}
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
