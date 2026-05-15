import * as React from 'react'
import { cn } from '@/lib/utils'
import { GlassCard } from './glass-card'

export type MetricChangeType = 'positive' | 'negative' | 'neutral'

export interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: MetricChangeType
  icon?: React.ReactNode
  className?: string
}

// Accent color matches --mc-accent (#F59E0B)
const changeStyles: Record<MetricChangeType, string> = {
  positive: 'bg-[#22C55E]/20 text-[#22C55E]',
  negative: 'bg-[#EF4444]/20 text-[#EF4444]',
  neutral: 'bg-white/10 text-white/80',
}

export function MetricCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: MetricCardProps) {
  return (
    <GlassCard padding="sm" className={cn('min-h-[120px] sm:min-h-[140px]', className)}>
      <div className="flex flex-col gap-3 min-w-0 h-full justify-between">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex flex-col min-w-0">
            <span
              className="text-f-xl sm:text-f-2xl font-bold text-white leading-none truncate"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </span>
            <span className="mt-1.5 text-f-xs sm:text-f-sm font-medium uppercase tracking-wider text-white/65">{label}</span>
          </div>
          {icon ? <div className="shrink-0 h-9 w-9 rounded-[10px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div> : null}
        </div>
        {change ? (
          <span className={cn('inline-flex w-fit items-center rounded-full px-2 py-0.5 text-f-xs sm:text-f-sm font-medium', changeStyles[changeType])}>
            {change}
          </span>
        ) : null}
      </div>
    </GlassCard>
  )
}