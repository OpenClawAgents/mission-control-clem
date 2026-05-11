import * as React from 'react'
import { cn } from '@/lib/utils'

type StatusOption = 'online' | 'idle' | 'offline' | 'working'
type StatusDotSize = 'sm' | 'md'

export interface StatusDotProps {
  status: StatusOption
  size?: StatusDotSize
  pulse?: boolean
}

const sizeClasses: Record<StatusDotSize, string> = {
  sm: 'h-[6px] w-[6px]',
  md: 'h-[8px] w-[8px]',
}

const statusClasses: Record<StatusOption, string> = {
  online: 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.4)]',
  working: 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.4)]',
  idle: 'bg-[#F59E0B]',
  offline: 'bg-gray-500',
}

export function StatusDot({ status, size = 'md', pulse }: StatusDotProps) {
  const shouldPulse = pulse ?? (status === 'online' || status === 'working')

  return (
    <span
      className={cn(
        'inline-flex rounded-full',
        sizeClasses[size],
        statusClasses[status],
        shouldPulse && 'status-dot-pulse'
      )}
      aria-hidden="true"
    />
  )
}