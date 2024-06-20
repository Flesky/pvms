import { Outlet, NavLink as RouterNavLink, matchPath, useLocation } from 'react-router-dom'
import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createContext } from 'react'
import { useAuth, withAuthenticationRequired } from 'react-oidc-context'
import { IconChevronRight } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { navLinks } from './utils/router'
import { AbilityContext, Can } from './components/Can'
import { changePasswordUrl } from '@/utils/auth.ts'
import api from '@/utils/api.ts'
import defineAbilityFor from '@/utils/ability.ts'

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

  const { data: roles, isFetching } = useQuery({
    queryKey: ['roles', auth.user?.profile.email],
    queryFn: async () => (await api.get('tokeninspect').json()).introspect.resource_access[import.meta.env.VITE_CLIENT_ID].roles,
    initialData: [],
    refetchOnWindowFocus: false,
  })

  return (
    <AbilityContext.Provider value={defineAbilityFor(roles)}>
      <Can I="view" an="any" passThrough>
        {
          isAllowed => isAllowed
            ? (
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
                            <Can I={item.action || 'view'} a={item.subject || 'all'} key={item.label}>
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
                            </Can>
                          )
                        }
                        else {
                          return (
                            <Can I={item.action || 'view'} a={item.subject || 'all'} key={item.label}>
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
                                  <Can I={child.action || 'view'} a={child.subject || 'all'} key={child.label}>
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
                                  </Can>
                                ))}
                              </NavLink>
                            </Can>
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
                            await auth.signoutSilent()
                          }}
                        >
                          Log out
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
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

            : (
              <Box p="md">
                {isFetching
                  ? <Text>Authenticating...</Text>
                  : (
                    <>
                      <Text>You are not authorized to view this page.</Text>
                      <Button
                        mt="sm"
                        variant="light"
                        color="red"
                        onClick={async () => {
                          await auth.signoutSilent()
                        }}
                      >
                        Log out
                      </Button>
                    </>
                    ) }
              </Box>
              )
        }
      </Can>
    </AbilityContext.Provider>
  )
}

const DefaultLayout = withAuthenticationRequired(Layout, {
  OnRedirecting: () => (
    <Box p="md">
      <Text>Authenticating...</Text>
    </Box>
  ),
})

export default DefaultLayout
