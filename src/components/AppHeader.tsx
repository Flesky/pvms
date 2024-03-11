import type { ReactNode } from 'react'

import { AppShell, Burger, Group, Title } from '@mantine/core'
import { useContext } from 'react'

import { NavbarContext } from '../app'

export default function AppHeader({ children, title }: { children?: ReactNode, title: string }) {
  const { desktopOpened, mobileOpened, toggleDesktop, toggleMobile } = useContext(NavbarContext)

  return (
    <AppShell.Header>
      <Group h="100%" justify="space-between" px="md">
        <Group>
          <Burger hiddenFrom="sm" onClick={toggleMobile} opened={mobileOpened} size="sm" />
          <Burger onClick={toggleDesktop} opened={desktopOpened} size="sm" visibleFrom="sm" />
          <Title size="md">{title || 'Page'}</Title>
        </Group>
        {children}
      </Group>
    </AppShell.Header>
  )
}
