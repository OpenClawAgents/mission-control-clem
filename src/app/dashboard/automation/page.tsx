'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard, EmptyState } from '@/components/ds'
import type { CronJob, CronRun } from '@/lib/openclaw'
import {
  Zap,
  Clock,
  Play,
  Pause,
  Trash2,
  RotateCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Calendar,
  Timer,
  Activity,
  ExternalLink,
} from 'lucide-react'

function formatSchedule(schedule: { kind: string; expr?: string; everyMs?: number; at?: string; [key: string]: unknown }): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    return schedule.expr
  }
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    if (min >= 1440) return `every ${Math.round(min / 1440)}d`
    if (min >= 60) return `every ${Math.round(min / 60)}h`
    return `every ${min}m`
  }
  if (schedule.kind === 'at' && schedule.at) return `at ${schedule.at}`
  return 'manual'
}

function formatTimeAgo(ms: number): string {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ${min % 60}m ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function scheduleLabel(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron') return 'Cron'
  if (schedule.kind === 'every') return 'Interval'
  if (schedule.kind === 'at') return 'One-shot'
  return 'Manual'
}

function payloadSummary(payload: { kind: string; text?: string; message?: string; [key: string]: unknown }): string {
  if (payload.kind === 'systemEvent') {
    const text = payload.text || ''
    return text.length > 80 ? text.slice(0, 80) + '…' : text
  }
  if (payload.kind === 'agentTurn') {
    const msg = payload.message || ''
    return msg.length > 80 ? msg.slice(0, 80) + '…' : msg
  }
  return payload.kind
}

function RunStatusBadge({ status, error }: { status: string; error?: string }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: 'Completed' },
    succeeded: { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: 'Succeeded' },
    failed: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', label: 'Failed' },
    running: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', label: 'Running' },
    queued: { bg: 'bg-white/[0.04]', text: 'text-white/40', label: 'Queued' },
    skipped: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', label: 'Skipped' },
    timed_out: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', label: 'Timed Out' },
  }
  const c = colors[status] || colors.queued
  return (
    <div>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium ${c.bg} ${c.text} border border-current/10`}>
        {c.label}
      </span>
      {error && <p className="text-f-2xs text-[#EF4444] mt-1 truncate max-w-[300px]">{error}</p>}
    </div>
  )
}

function CronJobCard({
  job,
  onToggle,
  onRun,
  onDelete,
  runs,
  loadingRuns,
  expanded,
  onToggleExpand,
  onFetchRuns,
}: {
  job: CronJob
  onToggle: (jobId: string, enabled: boolean) => void
  onRun: (jobId: string) => void
  onDelete: (jobId: string) => void
  runs: CronRun[]
  loadingRuns: boolean
  expanded: boolean
  onToggleExpand: () => void
  onFetchRuns: (jobId: string) => void
}) {
  const [toggling, setToggling] = useState(false)
  const [running, setRunning] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle() {
    setToggling(true)
    await onToggle(job.id, !job.enabled)
    setToggling(false)
  }

  async function handleRun() {
    setRunning(true)
    await onRun(job.id)
    setTimeout(() => setRunning(false), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.name || job.id}"? This cannot be undone.`)) return
    setDeleting(true)
    await onDelete(job.id)
  }

  function handleExpand() {
    onToggleExpand()
    if (!expanded && runs.length === 0) {
      onFetchRuns(job.id)
    }
  }

  return (
    <GlassCard hover={false} className="relative">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center border shrink-0 ${
            job.enabled
              ? 'bg-[#22C55E]/10 border-[#22C55E]/20'
              : 'bg-white/[0.04] border-white/[0.06]'
          }`}>
            <Zap className={`h-4 w-4 ${job.enabled ? 'text-[#22C55E]' : 'text-white/30'}`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-f-base font-semibold text-white truncate">{job.name || job.id}</h3>
            <div className="flex items-center gap-2 text-f-xs text-white/40 mt-0.5">
              <span className="flex items-center gap-1">
                <StatusDot status={job.enabled ? 'online' : 'idle'} size="sm" />
                <span className={job.enabled ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                  {job.enabled ? 'Active' : 'Paused'}
                </span>
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {scheduleLabel(job.schedule)}
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatSchedule(job.schedule)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-1 rounded-[8px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2.5 py-1.5 text-f-2xs text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-all disabled:opacity-50"
            title="Run now"
          >
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Run
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-1 rounded-[8px] border px-2.5 py-1.5 text-f-2xs transition-all disabled:opacity-50 ${
              job.enabled
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/20'
                : 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20'
            }`}
            title={job.enabled ? 'Pause' : 'Enable'}
          >
            {toggling ? <Loader2 className="h-3 w-3 animate-spin" /> : job.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {job.enabled ? 'Pause' : 'Enable'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1 rounded-[8px] bg-[#EF4444]/10 border border-[#EF4444]/20 px-2.5 py-1.5 text-f-2xs text-[#EF4444] hover:bg-[#EF4444]/20 transition-all disabled:opacity-50"
            title="Delete"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Description / payload */}
      <div className="mt-3">
        {job.description && (
          <p className="text-f-sm text-white/60 mb-1">{job.description}</p>
        )}
        <p className="text-f-xs text-white/30 font-mono truncate">
          {payloadSummary(job.payload)}
        </p>
      </div>

      {/* Schedule & delivery metadata */}
      <div className="mt-3 flex flex-wrap gap-2">
        {job.sessionTarget && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-f-2xs text-white/40">
            <ExternalLink className="h-3 w-3" />
            {job.sessionTarget}
          </span>
        )}
        {job.delivery?.mode && job.delivery.mode !== 'none' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-f-2xs text-white/40">
            → {job.delivery.mode}
          </span>
        )}
      </div>

      {/* Expandable run history */}
      <button
        onClick={handleExpand}
        className="w-full mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-1 text-f-xs text-white/40 hover:text-white/60 transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Run History
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {loadingRuns ? (
            <div className="flex items-center gap-2 py-3 text-f-xs text-white/40">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading runs...
            </div>
          ) : runs.length === 0 ? (
            <p className="text-f-xs text-white/30 py-2">No run history yet.</p>
          ) : (
            runs.slice(0, 10).map((run) => (
              <div key={run.id} className="flex items-center justify-between py-1.5 border-t border-white/[0.03]">
                <div className="min-w-0">
                  <p className="text-f-xs text-white/60">
                    {run.completedAt ? formatTimeAgo(run.completedAt) : run.startedAt ? formatTimeAgo(run.startedAt) : '—'}
                  </p>
                  {run.startedAt && (
                    <p className="text-f-2xs text-white/25">{formatTime(run.startedAt)}</p>
                  )}
                </div>
                <RunStatusBadge status={run.status} error={run.error} />
              </div>
            ))
          )}
        </div>
      )}
    </GlassCard>
  )
}

export default function AutomationPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [jobRuns, setJobRuns] = useState<Record<string, CronRun[]>>({})
  const [loadingRuns, setLoadingRuns] = useState<Record<string, boolean>>({})

  const fetchJobs = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function handleToggle(jobId: string, enabled: boolean) {
    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setEnabled', jobId, enabled }),
      })
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, enabled } : j))
      }
    } catch {
      // fail silently
    }
  }

  async function handleRun(jobId: string) {
    try {
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', jobId }),
      })
    } catch {
      // fail silently
    }
  }

  async function handleDelete(jobId: string) {
    try {
      // Use the CLI-backed delete endpoint
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', jobId }),
      })
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch {
      // fail silently
    }
  }

  async function handleFetchRuns(jobId: string) {
    setLoadingRuns(prev => ({ ...prev, [jobId]: true }))
    try {
      const res = await fetch(`/api/cron/${encodeURIComponent(jobId)}/runs`)
      if (res.ok) {
        const data = await res.json()
        setJobRuns(prev => ({ ...prev, [jobId]: data.runs ?? [] }))
      }
    } catch {
      // fail silently
    } finally {
      setLoadingRuns(prev => ({ ...prev, [jobId]: false }))
    }
  }

  const activeCount = jobs.filter(j => j.enabled).length
  const pausedCount = jobs.filter(j => !j.enabled).length
  const cronCount = jobs.filter(j => j.schedule.kind === 'cron').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        subtitle="Cron jobs and scheduled tasks from OpenClaw Gateway"
        action={
          <a
            href="/dashboard/skills"
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all"
          >
            <Plus className="h-4 w-4" />
            View Skills
          </a>
        }
      />

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Total Jobs"
          value={loading ? '...' : String(jobs.length)}
          icon={<Zap className="h-5 w-5" />}
        />
        <MetricCard
          label="Active"
          value={loading ? '...' : String(activeCount)}
          change={activeCount > 0 ? 'Enabled' : 'None enabled'}
          changeType={activeCount > 0 ? 'positive' : 'neutral'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Paused"
          value={loading ? '...' : String(pausedCount)}
          icon={<Pause className="h-5 w-5" />}
        />
        <MetricCard
          label="On Cron"
          value={loading ? '...' : String(cronCount)}
          change="scheduled"
          changeType="neutral"
          icon={<Timer className="h-5 w-5" />}
        />
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 text-[#F59E0B] animate-spin mb-3" />
          <p className="text-f-base text-white/40">Loading cron jobs from Gateway...</p>
        </div>
      ) : jobs.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Zap className="h-12 w-12" />}
            title="No cron jobs configured"
            description="Cron jobs are managed through OpenClaw. Create them via the CLI or Gateway, and they'll appear here automatically."
            action={
              <button
                onClick={() => fetchJobs()}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all"
              >
                <RotateCw className="h-4 w-4" />
                Refresh
              </button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <CronJobCard
              key={job.id}
              job={job}
              onToggle={handleToggle}
              onRun={handleRun}
              onDelete={handleDelete}
              runs={jobRuns[job.id] ?? []}
              loadingRuns={loadingRuns[job.id] ?? false}
              expanded={expandedJob === job.id}
              onToggleExpand={() => setExpandedJob(prev => prev === job.id ? null : job.id)}
              onFetchRuns={handleFetchRuns}
            />
          ))}
        </div>
      )}

      {/* Gateway info */}
      {!loading && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-f-base font-semibold text-white">Gateway Cron Engine</h3>
              <p className="text-f-xs text-white/40 mt-1">
                Jobs are created and managed through the OpenClaw CLI or Gateway API. Changes here take effect immediately.
              </p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchJobs() }}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-f-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all"
            >
              <RotateCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  )
}