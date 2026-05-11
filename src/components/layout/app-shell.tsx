'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { TopBar } from './topbar'
import { SidebarProvider } from '@/contexts/sidebar-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth') || pathname === '/login'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}