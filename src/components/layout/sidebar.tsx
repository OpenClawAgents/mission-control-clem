'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Newspaper,
  Bot,
  FileText,
  Calendar,
  Settings,
  Menu,
  Zap,
  Play,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useSidebar } from '@/contexts/sidebar-context'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Content Library', href: '/dashboard/content', icon: BookOpen },
      { label: 'Video Catalog', href: '/dashboard/videos', icon: Video },
      { label: 'Digests', href: '/dashboard/digests', icon: Newspaper },
      { label: 'Scripts', href: '/dashboard/scripts', icon: FileText },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Agents', href: '/dashboard/agents', icon: Bot },
      { label: 'Skills', href: '/dashboard/skills', icon: Sparkles },
      { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
      { label: 'Automation', href: '/dashboard/automation', icon: Zap },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

function SidebarNav({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
      {sections.map((section, sectionIndex) => (
        <div key={section.title}>
          {sectionIndex > 0 && <div className="my-3 mx-2 border-t border-white/[0.04]" />}
          {!collapsed ? (
            <div className="px-3 py-1 text-f-2xs font-medium uppercase tracking-[0.15em] text-white/30">
              {section.title}
            </div>
          ) : (
            <div className="px-3 py-1 flex justify-center" title={section.title}>
              <span className="h-1 w-1 rounded-full bg-white/15" />
              <span className="mx-0.5 h-1 w-1 rounded-full bg-white/10" />
              <span className="h-1 w-1 rounded-full bg-white/15" />
            </div>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
              const Icon = item.icon

              const linkClasses = collapsed
                ? cn(
                    'group relative flex items-center rounded-[10px] transition-all duration-200 justify-center',
                    isActive
                      ? 'bg-white/[0.06] shadow-[0_0_12px_rgba(245,158,11,0.06)] p-2.5'
                      : 'text-white/50 hover:bg-white/[0.04] p-2.5'
                  )
                : cn(
                    'group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-f-base font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/[0.06] text-white shadow-[0_0_12px_rgba(245,158,11,0.06)]'
                      : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                  )

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={linkClasses}
                >
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  )}
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
                      isActive
                        ? 'text-[#F59E0B]'
                        : 'text-white/40 group-hover:text-white/60'
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                  {isActive && collapsed && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()
  const handleNavigate = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 glass-sidebar border-0 p-0">
        <SheetHeader className="h-16 flex flex-row items-center justify-center px-3 border-b border-white/[0.06] space-y-0">
          <Link href="/dashboard" onClick={() => onOpenChange(false)} className="cursor-pointer flex-1">
            <div className="mc-bubble flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-4 py-2">
              <Play className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="mc-text-gradient text-f-lg font-bold tracking-[0.1em] uppercase">MC</span>
            </div>
          </Link>
          <SheetTitle className="sr-only">Mission Control</SheetTitle>
          <SheetDescription className="sr-only">Navigation menu</SheetDescription>
        </SheetHeader>
        <SidebarNav collapsed={false} pathname={pathname} onNavigate={handleNavigate} />
      </SheetContent>
    </Sheet>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, mounted, toggleCollapsed } = useSidebar()

  if (!mounted) {
    return <div className="hidden md:block w-64 shrink-0" />
  }

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen glass-sidebar flex-col shrink-0 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-3 border-b border-white/[0.06]">
        {!collapsed ? (
          <Link href="/dashboard" className="cursor-pointer flex-1">
            <div className="mc-bubble flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-4 py-2">
              <Play className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="mc-text-gradient text-f-lg font-bold tracking-[0.1em] uppercase">MC</span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto cursor-pointer">
            <div className="mc-bubble flex h-10 w-10 items-center justify-center rounded-[10px]">
              <Play className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 ml-2"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      <SidebarNav collapsed={collapsed} pathname={pathname} />

      <div className={cn(
        'px-4 py-3 border-t border-white/[0.04] flex items-center gap-2',
        collapsed && 'justify-center px-2'
      )}>
        <div className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
        {!collapsed && (
          <span className="text-f-2xs text-white/60">Connected</span>
        )}
      </div>
    </aside>
  )
}