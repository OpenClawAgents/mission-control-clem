import * as React from 'react'
import { cn } from '@/lib/utils'

type GlassCardPadding = 'sm' | 'md' | 'lg'

export interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: GlassCardPadding
  style?: React.CSSProperties
  accent?: string // Optional left-border accent color
}

const paddingClasses: Record<GlassCardPadding, string> = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export function GlassCard({
  children,
  className,
  hover = true,
  padding = 'md',
  style,
  accent,
}: GlassCardProps) {
  // If accent color provided, add left border via box-shadow trick
  const accentStyle = accent
    ? { ...style, borderLeft: `3px solid ${accent}` }
    : style
  return (
    <div
      style={accentStyle}
      className={cn(
        'glass-card rounded-[14px] overflow-hidden',
        paddingClasses[padding],
        hover && 'transition-all duration-200 hover:-translate-y-0.5',
        !hover && 'transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}