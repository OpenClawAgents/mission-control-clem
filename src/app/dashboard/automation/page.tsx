'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard } from '@/components/ds'
import { Zap, Plus, Clock } from 'lucide-react'

interface CronJob {
  id: string
  name?: string
  description?: string
  enabled: boolean
  schedule: {
    kind: string
    expr?: string
    everyMs?: number
    at?: string
    [key: string]: unknown
  }
  payload: {
    kind: string
    text?: string
    message?: string
    [key: string]: unknown
  }
  delivery?: {
    mode: string
    [key: string]: unknown
  }
  sessionTarget?: string
  lastRunAt?: number
  nextRunAt?: number
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) return schedule.expr
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    if (min >= 60) return `Every ${Math.round(min / 60)}h`
    return `Every ${min}m`
  }
  if (schedule.kind === 'at' && schedule.at) return `At ${schedule.at}`
  return schedule.kind
}

function formatTime(ts: number | undefined): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(ts: number | undefined): string {
  if (!ts) return 'Never'
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export default function AutomationPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cron')
        if (!res.ok) return
        setJobs(await res.json())
      } catch {
        // Keep empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const enabled = jobs.filter((j) => j.enabled).length
  const disabled = jobs.filter((j) => !j.enabled).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        subtitle="Cron jobs and scheduled tasks"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Job
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Jobs"
          value={String(jobs.length || '—')}
          change={loading ? 'Loading…' : `${enabled} active`}
          changeType="neutral"
          icon={<Zap className="h-5 w-5" />}
        />
        <MetricCard
          label="Enabled"
          value={String(enabled || '—')}
          change="Running"
          changeType="positive"
        />
        <MetricCard
          label="Disabled"
          value={String(disabled || '0')}
          change="Paused"
          changeType="neutral"
        />
        <MetricCard
          label="Schedules"
          value={String(jobs.filter((j) => j.schedule?.kind === 'cron').length || '—')}
          change="Cron-based"
          changeType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {jobs.length === 0 && !loading ? (
        <GlassCard hover={false}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-f-lg font-semibold text-white/80">No cron jobs yet</h3>
            <p className="mt-2 text-f-base text-white/50 max-w-md">
              Scheduled tasks will appear here once created via the Gateway API.
            </p>
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Scheduled Jobs</h3>
          </div>
          <div className="space-y-0">
            {(loading ? Array.from<CronJob>({ length: 3 }) : jobs).map((job, i) => (
              <div
                key={job?.id ?? String(i)}
                className="flex items-center justify-between py-3 border-t border-white/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-f-base text-white/80">
                      {job?.name || job?.id || 'Loading…'}
                    </span>
                    <StatusDot
                      status={job?.enabled ? 'online' : 'idle'}
                      size="sm"
                    />
                  </div>
                  <div className="text-f-sm text-white/40 mt-0.5">
                    {job ? formatSchedule(job.schedule) : '—'}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <div className="text-right">
                    <div className="text-f-xs text-white/30">Last run</div>
                    <div className="text-f-sm text-white/50">{job ? timeAgo(job.lastRunAt) : '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-f-xs text-white/30">Target</div>
                    <div className="text-f-sm text-white/50">{job?.sessionTarget || '—'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}