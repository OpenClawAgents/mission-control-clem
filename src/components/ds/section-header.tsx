import * as React from 'react'

export interface SectionHeaderProps {
  title: string
  action?: React.ReactNode
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-f-2xl font-semibold text-white">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}