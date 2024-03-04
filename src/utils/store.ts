import { create } from 'zustand'

interface Store {
  navbarCollapsed: {
    mobile: boolean
    desktop: boolean
    toggleMobile: () => void
    toggleDesktop: () => void
  }
}

export const useStore = create<Store>(set => ({
  navbarCollapsed: {
    mobile: true,
    desktop: false,
    toggleMobile: () => set(state => ({ navbarCollapsed: { ...state.navbarCollapsed, mobile: !state.navbarCollapsed.mobile } })),
    toggleDesktop: () => set(state => ({ navbarCollapsed: { ...state.navbarCollapsed, desktop: !state.navbarCollapsed.desktop } })),
  },
}))
