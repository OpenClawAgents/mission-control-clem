'use client'

import { useEffect, useState, useMemo } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard, EmptyState } from '@/components/ds'
import {
  Calendar as CalendarIcon,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Timer,
  Activity,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
    tz?: string
    staggerMs?: number
    [key: string]: unknown
  }
  payload: { kind: string; text?: string; message?: string; [key: string]: unknown }
  delivery?: { mode: string; [key: string]: unknown }
  sessionTarget?: string
  lastRunAt?: number
  nextRunAt?: number
}

// ---------------------------------------------------------------------------
// Cron expression parser — compute next fire times
// ---------------------------------------------------------------------------

function parseCronFields(expr: string): [number[], number[], number[], number[], number[]] | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null
  const minutes = parseField(parts[0], 60)
  const hours = parseField(parts[1], 24)
  const days = parseField(parts[2], 31)
  const months = parseField(parts[3], 12)
  const dows = parseField(parts[4], 7)
  if (minutes === null || hours === null || days === null || months === null || dows === null) return null
  return [minutes, hours, days, months, dows]
}

function parseField(field: string, max: number): number[] | null {
  if (field === '*') return Array.from({ length: max }, (_, i) => i)
  const vals: number[] = []
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/')
      const step = parseInt(stepStr, 10)
      if (isNaN(step)) return null
      const start = range === '*' ? 0 : parseInt(range, 10)
      if (isNaN(start)) return null
      for (let i = start; i < max; i += step) vals.push(i)
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number)
      if (isNaN(a) || isNaN(b)) return null
      for (let i = a; i <= b; i++) vals.push(i)
    } else {
      const n = parseInt(part, 10)
      if (isNaN(n)) return null
      vals.push(n)
    }
  }
  return vals
}

/** Generate approximate next fire times for a cron expression within a date range */
function cronFireTimes(expr: string, tz: string | undefined, startMs: number, endMs: number): number[] {
  // Simple approach: sample every minute in range, check if it matches
  // For calendar view this is fine (ranges are typically ~1 month)
  const times: number[] = []
  const fields = parseCronFields(expr)
  if (!fields) return times

  const [minutes, hours, days, months, dows] = fields
  const start = new Date(startMs)
  const end = new Date(endMs)

  // Iterate day by day, then hour, then minute
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  while (d.getTime() <= end.getTime()) {
    const month = d.getMonth() + 1 // cron months are 1-12
    if (months.includes(month)) {
      const day = d.getDate()
      const dow = d.getDay() || 7 // cron 0,7 = Sunday
      if (days.includes(day) && (dows.includes(dow) || dows.includes(dow % 7))) {
        for (const hour of hours) {
          for (const minute of minutes) {
            const fireTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute)
            if (fireTime.getTime() >= startMs && fireTime.getTime() <= endMs) {
              times.push(fireTime.getTime())
            }
          }
        }
      }
    }
    d.setDate(d.getDate() + 1)
  }
  return times
}

/** Generate fire times for interval-based schedules */
function intervalFireTimes(everyMs: number, anchorMs: number | undefined, startMs: number, endMs: number): number[] {
  const times: number[] = []
  const anchor = anchorMs ?? startMs
  let t = anchor
  while (t < startMs) t += everyMs
  while (t <= endMs) {
    times.push(t)
    t += everyMs
  }
  return times
}

/** Generate fire times for a one-shot schedule */
function oneShotFireTime(at: string): number | null {
  const t = new Date(at).getTime()
  return isNaN(t) ? null : t
}

// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function scheduleLabel(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) return schedule.expr
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    if (min >= 1440) return `every ${Math.round(min / 1440)}d`
    if (min >= 60) return `every ${Math.round(min / 60)}h`
    return `every ${min}m`
  }
  if (schedule.kind === 'at' && schedule.at) return `at ${schedule.at}`
  return 'manual'
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cron')
        if (res.ok) {
          const data = await res.json()
          setCronJobs(data.jobs ?? [])
        }
      } catch {
        // Gateway unreachable
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute fire times for the current month view
  const monthStart = new Date(year, month, 1).getTime()
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime()

  const scheduledEvents = useMemo(() => {
    const events: Map<number, Array<{ jobId: string; name: string; time: number; enabled: boolean }>> = new Map()

    for (const job of cronJobs) {
      let fireTimes: number[] = []

      if (job.schedule.kind === 'cron' && job.schedule.expr) {
        fireTimes = cronFireTimes(job.schedule.expr, job.schedule.tz as string | undefined, monthStart, monthEnd)
      } else if (job.schedule.kind === 'every' && job.schedule.everyMs) {
        fireTimes = intervalFireTimes(job.schedule.everyMs, job.schedule.anchorMs as number | undefined, monthStart, monthEnd)
      } else if (job.schedule.kind === 'at' && job.schedule.at) {
        const t = oneShotFireTime(job.schedule.at)
        if (t && t >= monthStart && t <= monthEnd) fireTimes = [t]
      }

      for (const time of fireTimes) {
        const day = new Date(time).getDate()
        if (!events.has(day)) events.set(day, [])
        events.get(day)!.push({
          jobId: job.id,
          name: job.name || job.id,
          time,
          enabled: job.enabled,
        })
      }
    }

    // Sort events within each day
    for (const [, dayEvents] of events) {
      dayEvents.sort((a, b) => a.time - b.time)
    }

    return events
  }, [cronJobs, monthStart, monthEnd])

  const selectedDayEvents = selectedDay ? (scheduledEvents.get(selectedDay) ?? []) : []

  // Count scheduled jobs
  const enabledJobs = cronJobs.filter(j => j.enabled)
  const totalEventsThisMonth = Array.from(scheduledEvents.values()).reduce((sum, evts) => sum + evts.length, 0)

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  function goToToday() {
    const now = new Date()
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDay(now.getDate())
  }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Scheduled automations and content deadlines"
      />

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Scheduled Jobs"
          value={loading ? '...' : String(enabledJobs.length)}
          change={`${cronJobs.length} total`}
          changeType="neutral"
          icon={<Zap className="h-5 w-5" />}
        />
        <MetricCard
          label="Fires This Month"
          value={loading ? '...' : String(totalEventsThisMonth)}
          change={MONTH_NAMES[month]}
          changeType="neutral"
          icon={<CalendarIcon className="h-5 w-5" />}
        />
        <MetricCard
          label="Next Fire"
          value={loading ? '...' : (() => {
            const now = Date.now()
            let earliest: number | null = null
            for (const [, evts] of scheduledEvents) {
              for (const e of evts) {
                if (e.time > now && e.enabled && (earliest === null || e.time < earliest)) {
                  earliest = e.time
                }
              }
            }
            return earliest ? formatDate(earliest) : '—'
          })()}
          change="Next scheduled"
          changeType="neutral"
          icon={<Timer className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Today"
          value={loading ? '...' : String(isCurrentMonth ? (scheduledEvents.get(today.getDate())?.filter(e => e.enabled).length ?? 0) : 0)}
          change={isCurrentMonth ? 'Today' : 'Not current month'}
          changeType="neutral"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <GlassCard hover={false} className="lg:col-span-2">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-f-lg font-semibold text-white">
              {MONTH_NAMES[month]} {year}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="rounded-[8px] bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-f-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              >
                Today
              </button>
              <button onClick={prevMonth} className="h-8 w-8 rounded-[8px] flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={nextMonth} className="h-8 w-8 rounded-[8px] flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-center text-f-xs text-white/30 py-1 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const events = scheduledEvents.get(day) ?? []
              const hasEvents = events.length > 0
              const isToday = isCurrentMonth && day === today.getDate()
              const isSelected = day === selectedDay

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`aspect-square rounded-[10px] flex flex-col items-center justify-center text-f-sm transition-all relative ${
                    isSelected
                      ? 'bg-[#F59E0B]/15 border border-[#F59E0B]/30'
                      : isToday
                      ? 'bg-white/[0.04] border border-white/[0.08]'
                      : 'border border-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={`${isToday ? 'text-white font-bold' : 'text-white/60'}`}>
                    {day}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.slice(0, 3).map((e, idx) => (
                        <div
                          key={idx}
                          className={`h-1 w-1 rounded-full ${e.enabled ? 'bg-[#F59E0B]' : 'bg-white/20'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* Sidebar: selected day events + job list */}
        <div className="space-y-4">
          {/* Selected day events */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-f-base font-semibold text-white">
                {selectedDay
                  ? `${MONTH_NAMES[month]} ${selectedDay}`
                  : 'Select a day'}
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
              </div>
            ) : selectedDay === null ? (
              <p className="text-f-sm text-white/30 py-4 text-center">Click a day on the calendar to see events</p>
            ) : selectedDayEvents.length === 0 ? (
              <p className="text-f-sm text-white/30 py-4 text-center">No scheduled events on this day</p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                    <div className="min-w-0">
                      <span className="text-f-sm text-white/80 font-medium truncate block">{event.name}</span>
                      <span className="text-f-xs text-white/30">{formatTime(event.time)}</span>
                    </div>
                    <StatusDot status={event.enabled ? 'online' : 'idle'} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* All scheduled jobs */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-f-base font-semibold text-white">
                Jobs
                <span className="ml-1 text-f-xs text-white/30 font-normal">({cronJobs.length})</span>
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
              </div>
            ) : cronJobs.length === 0 ? (
              <p className="text-f-sm text-white/30 py-4 text-center">No cron jobs configured</p>
            ) : (
              <div className="space-y-2">
                {cronJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                    <div className="min-w-0">
                      <span className="text-f-sm text-white/80 font-medium truncate block">{job.name || job.id}</span>
                      <span className="text-f-xs text-white/30 font-mono">{scheduleLabel(job.schedule)}</span>
                    </div>
                    <StatusDot status={job.enabled ? 'online' : 'idle'} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}