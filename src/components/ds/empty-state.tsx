import * as React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 h-16 w-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] [&>svg]:h-8 [&>svg]:w-8">{icon}</div>}
      <h3 className="text-f-lg font-semibold text-white/80">{title}</h3>
      {description && <p className="mt-2 text-f-base text-white/50 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}