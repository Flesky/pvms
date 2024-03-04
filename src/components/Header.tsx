import { AppShell, Burger, Group, Title } from '@mantine/core'
import { useStore } from '../utils/store.ts'

export default function Header({ title, children }) {
  const { navbarCollapsed } = useStore()

  return (
    <AppShell.Header>
      <Group justify="space-between" h="100%" px="md">
        <Group>
          <Burger
            opened={!navbarCollapsed.mobile}
            onClick={navbarCollapsed.toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={!navbarCollapsed.desktop}
            onClick={navbarCollapsed.toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <Title size="md">{title}</Title>
        </Group>
        {children}
      </Group>
    </AppShell.Header>
  )
}
