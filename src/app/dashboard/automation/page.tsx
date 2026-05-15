'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, EmptyState, MetricCard, StatusDot } from '@/components/ds'
import { Zap, Plus, Clock, Play, Pause, RefreshCw, ExternalLink, Loader2, Timer } from 'lucide-react'
import { CreateModal } from '@/components/create-modal'

interface CronJob {
  id: string
  name?: string
  enabled: boolean
  schedule: { kind: string; expr?: string; everyMs?: number; at?: string; [key: string]: unknown }
  payload?: { kind: string; [key: string]: unknown }
  delivery?: { mode: string; channel?: string; to?: string; [key: string]: unknown }
  lastRunAt?: number
  nextRunAt?: number
}

interface CronRun {
  id: string
  status: string
  startedAt: string
  completedAt?: string
  durationMs?: number
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) return schedule.expr
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    if (min >= 60) return `every ${Math.round(min / 60)}h`
    return `every ${min}m`
  }
  if (schedule.kind === 'at' && schedule.at) return `at ${schedule.at}`
  return 'manual'
}

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

export default function AutomationPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [runs, setRuns] = useState<Record<string, CronRun[]>>({})

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cron')
        if (res.ok) {
          const data = await res.json()
          setJobs(data.jobs ?? [])
        }
      } catch {
        // Gateway may be unreachable
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function loadRuns(jobId: string) {
    if (expandedJob === jobId) {
      setExpandedJob(null)
      return
    }
    setExpandedJob(jobId)
    try {
      const res = await fetch(`/api/cron/${jobId}/runs`)
      if (res.ok) {
        const data = await res.json()
        setRuns((prev) => ({ ...prev, [jobId]: data.runs ?? [] }))
      }
    } catch {
      // Ignore
    }
  }

  const activeCount = jobs.filter((j) => j.enabled).length
  const totalRuns = Object.values(runs).reduce((sum, r) => sum + r.length, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Hub"
        subtitle="Manage cron jobs, scheduled tasks, and automated workflows"
        action={
          <CreateModal
            triggerLabel="New Automation"
            triggerIcon={Plus}
            title="Create Automation"
            description="Describe what you want automated. The system will set up the cron job for you."
            fields={[
              { name: 'name', label: 'Job Name', type: 'text', placeholder: 'Daily Psychedelic Law Digest', required: true },
              { name: 'schedule', label: 'Schedule', type: 'select', required: true, options: [
                { value: '0 9 * * *', label: 'Daily at 9:00 AM' },
                { value: '0 6 * * *', label: 'Daily at 6:00 AM' },
                { value: '0 9 * * 1', label: 'Weekly Monday 9:00 AM' },
                { value: '0 18 * * *', label: 'Daily at 6:00 PM' },
                { value: '0 9,18 * * *', label: 'Twice daily (9 AM + 6 PM)' },
              ]},
              { name: 'message', label: 'What should it do?', type: 'textarea', placeholder: 'Search for latest psychedelic law news and create a digest entry...', rows: 4, required: true },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/cron', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create',
                  name: values.name,
                  schedule: values.schedule,
                  message: values.message,
                }),
              })
              if (!res.ok) throw new Error('Failed to create automation')
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Jobs"
          value={loading ? '...' : String(jobs.length)}
          change={`${jobs.length} configured`}
          changeType="neutral"
          icon={<Timer className="h-5 w-5" />}
        />
        <MetricCard
          label="Active"
          value={String(activeCount)}
          change={activeCount > 0 ? 'Running' : 'None active'}
          changeType={activeCount > 0 ? 'positive' : 'neutral'}
          icon={<Play className="h-5 w-5" />}
        />
        <MetricCard
          label="Paused"
          value={String(jobs.length - activeCount)}
          change="Disabled"
          changeType="neutral"
          icon={<Pause className="h-5 w-5" />}
        />
        <MetricCard
          label="Recent Runs"
          value={String(totalRuns)}
          change="Last 24h"
          changeType="neutral"
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : jobs.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Zap className="h-12 w-12" />}
            title="No automations yet"
            description="Set up cron jobs for daily digests, content scheduling, and recurring tasks. Use the New Automation button above to create one."
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <GlassCard key={job.id} className="cursor-pointer" hover={true}>
              <div
                className="flex items-center justify-between"
                onClick={() => loadRuns(job.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0 border ${
                    job.enabled
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/20'
                      : 'bg-white/[0.04] border-white/[0.06]'
                  }`}>
                    <Zap className={`h-4 w-4 ${job.enabled ? 'text-[#22C55E]' : 'text-white/30'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-f-base text-white/90 font-medium truncate">{job.name || job.id}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-f-xs text-white/40">{formatSchedule(job.schedule)}</span>
                      {job.payload?.kind && (
                        <span className="text-f-xs text-white/25">· {job.payload.kind}</span>
                      )}
                      {job.delivery?.channel && (
                        <span className="text-f-xs text-white/25">→ {job.delivery.channel}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {job.lastRunAt && (
                    <span className="text-f-xs text-white/30 hidden sm:inline">
                      Last: {formatTime(Date.now() - job.lastRunAt)}
                    </span>
                  )}
                  <StatusDot status={job.enabled ? 'online' : 'offline'} size="sm" />
                </div>
              </div>

              {expandedJob === job.id && runs[job.id] && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="text-f-xs text-white/30 mb-2">Recent runs</div>
                  {runs[job.id].length === 0 ? (
                    <div className="text-f-sm text-white/20 py-2">No runs recorded</div>
                  ) : (
                    <div className="space-y-1.5">
                      {runs[job.id].slice(0, 5).map((run) => (
                        <div key={run.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <StatusDot
                              status={run.status === 'completed' ? 'online' : run.status === 'failed' ? 'offline' : 'idle'}
                              size="sm"
                            />
                            <span className="text-f-xs text-white/60 capitalize">{run.status}</span>
                          </div>
                          <div className="flex items-center gap-2 text-f-xs text-white/30">
                            {run.durationMs && <span>{run.durationMs}ms</span>}
                            <span>{new Date(run.startedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}