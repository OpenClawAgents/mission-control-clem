'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, MetricCard, StatusDot } from '@/components/ds'
import { Calendar, Plus, Clock, ChevronLeft, ChevronRight, Newspaper, Zap, BookOpen } from 'lucide-react'
import { getContent, type ContentItem } from '@/lib/api'

interface CronJob {
  id: string
  name?: string
  enabled: boolean
  schedule: { kind: string; expr?: string; everyMs?: number; at?: string; [key: string]: unknown }
  lastRunAt?: number
  nextRunAt?: number
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
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

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type CalendarEvent = {
  id: string
  title: string
  date: string
  type: 'content' | 'digest' | 'automation'
  color: string
  status?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    async function load() {
      try {
        const [content, cronRes] = await Promise.all([
          getContent(),
          fetch('/api/cron'),
        ])
        const contentEvents: CalendarEvent[] = (content as ContentItem[]).map((item) => ({
          id: item.id,
          title: item.title,
          date: item.published_at || item.created_at.split('T')[0],
          type: 'content' as const,
          color: item.status === 'published' ? '#22C55E' : item.status === 'review' ? '#A855F7' : '#6B7280',
          status: item.status,
        }))

        let cronData: CronJob[] = []
        if (cronRes.ok) {
          const cd = await cronRes.json()
          cronData = cd.jobs ?? []
          setCronJobs(cronData)
        }

        // Add automation schedule events
        const automationEvents: CalendarEvent[] = cronData
          .filter((j: CronJob) => j.enabled && j.nextRunAt)
          .map((j: CronJob) => ({
            id: `cron-${j.id}`,
            title: j.name || j.id,
            date: new Date(j.nextRunAt!).toISOString().split('T')[0],
            type: 'automation' as const,
            color: '#3B82F6',
          }))

        setEvents([...contentEvents, ...automationEvents])
      } catch {
        // Tables may be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const today = new Date()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  events.forEach((event) => {
    const dateKey = event.date?.split('T')[0]
    if (dateKey) {
      if (!eventsByDate[dateKey]) eventsByDate[dateKey] = []
      eventsByDate[dateKey].push(event)
    }
  })

  const scheduledCount = events.filter((e) => e.type === 'content' && e.status === 'published').length
  const automationCount = cronJobs.filter((j) => j.enabled).length

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Content schedule, digest delivery, and automations"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Schedule
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Events"
          value={loading ? '...' : String(events.length)}
          change="This month"
          changeType="neutral"
          icon={<Calendar className="h-5 w-5" />}
        />
        <MetricCard
          label="Published"
          value={String(scheduledCount)}
          change="Content live"
          changeType="positive"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricCard
          label="Automations"
          value={String(automationCount)}
          change="Active"
          changeType="neutral"
          icon={<Zap className="h-5 w-5" />}
        />
        <MetricCard
          label="Digests"
          value={String(events.filter((e) => e.type === 'digest').length)}
          change="Scheduled"
          changeType="neutral"
          icon={<Newspaper className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <GlassCard className="lg:col-span-2" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="h-8 w-8 rounded-[8px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-white/60" />
            </button>
            <h3 className="text-f-lg font-semibold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={nextMonth}
              className="h-8 w-8 rounded-[8px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all"
            >
              <ChevronRight className="h-4 w-4 text-white/60" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-f-xs text-white/30 py-2 font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-[8px] bg-white/[0.01]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = eventsByDate[dateKey] || []
              const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear

              return (
                <div
                  key={day}
                  className={`h-16 rounded-[8px] p-1.5 transition-all ${
                    isToday
                      ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30'
                      : 'bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`text-f-xs font-medium ${isToday ? 'text-[#F59E0B]' : 'text-white/50'}`}>
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Upcoming sidebar */}
        <div className="space-y-4">
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-white/40" />
              <h3 className="text-f-base font-semibold text-white">Upcoming</h3>
            </div>
            {loading ? (
              <div className="py-4 text-center text-f-sm text-white/30">Loading...</div>
            ) : events.length === 0 ? (
              <div className="py-4 text-center text-f-sm text-white/30">
                No scheduled events yet
              </div>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 8).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 py-1.5 text-f-sm"
                  >
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="text-white/80 truncate flex-1">{event.title}</span>
                    <span className="text-f-xs text-white/30 shrink-0">{event.date}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-f-base font-semibold text-white">Automations</h3>
            </div>
            {cronJobs.length === 0 ? (
              <div className="py-4 text-center text-f-sm text-white/30">
                No automations configured
              </div>
            ) : (
              <div className="space-y-2">
                {cronJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-1.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-f-sm text-white/80 truncate block">{job.name || job.id}</span>
                      <span className="text-f-xs text-white/30">{formatSchedule(job.schedule)}</span>
                    </div>
                    <StatusDot
                      status={job.enabled ? 'online' : 'offline'}
                      size="sm"
                    />
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