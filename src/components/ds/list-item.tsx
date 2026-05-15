import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ListItemProps {
  children: React.ReactNode
  className?: string
  /** Optional accent color for left border */
  accentColor?: string
  /** Optional icon node (renders in an accent square) */
  icon?: React.ReactNode
  /** Click handler */
  onClick?: () => void
}

export function ListItem({ children, className, accentColor, icon, onClick }: ListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 py-3 px-3 rounded-[10px]',
        'bg-white/[0.02] hover:bg-white/[0.04]',
        'border border-white/[0.04] hover:border-white/[0.08]',
        'transition-all group',
        onClick && 'cursor-pointer',
        accentColor && 'border-l-[3px]',
        className
      )}
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      {icon && (
        <div
          className="shrink-0 h-8 w-8 rounded-[8px] flex items-center justify-center border"
          style={accentColor
            ? { backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20` }
            : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }
          }
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  )
}

/** Standard text patterns for use inside ListItem */
export function ListItemTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-f-base text-white/90 font-medium truncate', className)}>{children}</div>
}

export function ListItemMeta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2 mt-0.5', className)}>{children}</div>
}

export function ListItemSubtitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-f-sm text-white/50 mt-1 line-clamp-2', className)}>{children}</p>
}