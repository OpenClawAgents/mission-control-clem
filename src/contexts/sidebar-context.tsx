'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'mc-sidebar-collapsed'

interface SidebarContextValue {
  collapsed: boolean
  mounted: boolean
  toggleCollapsed: () => void
  setCollapsed: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setCollapsedState(stored === 'true')
      }
    } catch {}
  }, [])

  const updateCollapsed = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const resolved = typeof next === 'function' ? (next as (value: boolean) => boolean)(prev) : next
      try {
        localStorage.setItem(STORAGE_KEY, String(resolved))
      } catch {}
      return resolved
    })
  }, [])

  const toggleCollapsed = useCallback(() => {
    updateCollapsed((prev) => !prev)
  }, [updateCollapsed])

  const value = useMemo(
    () => ({
      collapsed,
      mounted,
      toggleCollapsed,
      setCollapsed: (value: boolean) => updateCollapsed(value),
    }),
    [collapsed, mounted, toggleCollapsed, updateCollapsed]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}