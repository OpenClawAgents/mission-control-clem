'use client'

import { useState } from 'react'
import { Menu, Search as SearchIcon, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileSidebar } from './sidebar'
import { useSidebar } from '@/contexts/sidebar-context'
import Link from 'next/link'

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { collapsed, toggleCollapsed } = useSidebar()

  return (
    <>
      <header className="h-16 bg-[#0B0F18] border-0 border-b border-white/[0.06] flex items-center px-4 md:px-6 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={`h-9 w-9 ${collapsed ? '' : 'md:hidden'}`}
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileOpen(true)
            } else {
              toggleCollapsed()
            }
          }}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1" />

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 rounded-[10px] bg-white/[0.03] border border-white/[0.06] text-f-base text-white placeholder-white/30 pl-9 pr-4 outline-none focus:border-[#FF2DA0]/30 focus:shadow-[0_0_12px_rgba(255,45,160,0.08)]"
            />
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-9 w-9 ml-2" aria-label="Notifications">
          <Bell className="h-5 w-5 text-white/50" />
        </Button>

        <Link href="/dashboard/settings" className="ml-2 flex items-center gap-2 rounded-[10px] px-3 py-1.5 hover:bg-white/[0.04] transition-colors">
          <div className="h-8 w-8 rounded-full bg-[#FF2DA0]/15 flex items-center justify-center text-f-sm font-bold text-[#FF2DA0]">
            C
          </div>
          <span className="hidden md:block text-f-base text-white/70">Clementine</span>
        </Link>
      </header>

      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  )
}