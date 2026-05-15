'use client'

import { useEffect, useState } from 'react'
import { PageHeader, MetricCard, GlassCard, StatusDot } from '@/components/ds'
import {
  BookOpen,
  Newspaper,
  Bot,
  Zap,
  TrendingUp,
  Clock,
  Edit3,
  Cpu,
  Activity,
  Server,
  Timer,
  Calendar,
  Loader2,
  ListTodo,
} from 'lucide-react'
import { getContentCounts, getDigestCounts, type ContentType, type ContentStatus } from '@/lib/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionInfo {
  key: string
  agentId: string
  kind: string
  channel: string
  model: string
  status: string
  updatedAt: number
  totalTokens: number
  contextTokens: number
  estimatedCostUsd?: number
  lastChannel?: string
}

interface HeartbeatAgent {
  agentId: string
  enabled: boolean
  every: string
  everyMs: number
}

interface CronJob {
  id: string
  name?: string
  enabled: boolean
  schedule: { kind: string; expr?: string; everyMs?: number; at?: string; [key: string]: unknown }
  lastRunAt?: number
  nextRunAt?: number
}

interface TaskSummary {
  total: number
  active: number
  terminal: number
  failures: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAge(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ${min % 60}m ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function channelLabel(channel: string): string {
  const map: Record<string, string> = {
    webchat: 'Web Chat',
    discord: 'Discord',
    telegram: 'Telegram',
    signal: 'Signal',
    whatsapp: 'WhatsApp',
    slack: 'Slack',
    heartbeat: 'Heartbeat',
  }
  return map[channel] || channel
}

function cronScheduleDisplay(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) return schedule.expr
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    if (min >= 60) return `every ${Math.round(min / 60)}h`
    return `every ${min}m`
  }
  if (schedule.kind === 'at' && schedule.at) return `at ${schedule.at}`
  return 'manual'
}

// Unified activity feed item
interface ActivityItem {
  id: string
  type: 'session' | 'cron'
  label: string
  detail: string
  time: number
  status: 'online' | 'idle' | 'offline'
  statusLabel: string
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

const quickActions = [
  { label: 'Digital Library', href: '/dashboard/library', icon: BookOpen },
  { label: 'Pipeline', href: '/dashboard/pipeline', icon: Zap },
  { label: 'Add Content', href: '/dashboard/content', icon: Edit3 },
  { label: 'Catalog Video', href: '/dashboard/videos', icon: Activity },
  { label: 'Digests', href: '/dashboard/digests', icon: Newspaper },
  { label: 'Agent Status', href: '/dashboard/agents', icon: Bot },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [contentCounts, setContentCounts] = useState<{ type: ContentType; status: ContentStatus }[]>([])
  const [digestCounts, setDigestCounts] = useState<{ category: string }[]>([])
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [heartbeatAgents, setHeartbeatAgents] = useState<HeartbeatAgent[]>([])
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [tasks, setTasks] = useState<TaskSummary | null>(null)
  const [gwVersion, setGwVersion] = useState<string>('')
  const [gwUptime, setGwUptime] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Supabase data
      try {
        const [cc, dc] = await Promise.all([getContentCounts(), getDigestCounts()])
        setContentCounts(cc)
        setDigestCounts(dc)
      } catch {
        // Tables may be empty
      }

      // Gateway data
      try {
        const [sessRes, gwRes, cronRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/gateway/status'),
          fetch('/api/cron'),
        ])

        if (sessRes.ok) {
          const sessData = await sessRes.json()
          setSessions(sessData.sessions ?? [])
        }

        if (gwRes.ok) {
          const gwData = await gwRes.json()
          setHeartbeatAgents(gwData.heartbeat?.agents ?? [])
          setGwVersion(gwData.runtimeVersion ?? '')
          setGwUptime(gwData.uptime ?? '')
          setTasks(gwData.tasks ?? null)
        }

        if (cronRes.ok) {
          const cronData = await cronRes.json()
          setCronJobs(cronData.jobs ?? [])
        }
      } catch {
        // Gateway may be unreachable
      }

      setLoading(false)
    }
    load()
  }, [])

  // Derived metrics
  const totalContent = contentCounts.length
  const totalDigests = digestCounts.length
  const publishedCount = contentCounts.filter(c => c.status === 'published').length
  const activeSessions = sessions.filter(s => s.status === 'running')
  const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0)
  const totalCost = sessions.reduce((sum, s) => sum + (s.estimatedCostUsd || 0), 0)
  const activeCronCount = cronJobs.filter(j => j.enabled).length

  // Build unified activity feed
  const activityFeed: ActivityItem[] = [
    ...sessions.map(s => ({
      id: s.key,
      type: 'session' as const,
      label: s.agentId,
      detail: `${channelLabel(s.lastChannel || s.channel)} · ${s.model}`,
      time: s.updatedAt,
      status: s.status === 'running' ? 'online' as const : 'idle' as const,
      statusLabel: s.status === 'running' ? 'Online' : 'Idle',
    })),
    ...cronJobs.filter(j => j.lastRunAt).map(j => ({
      id: `cron-${j.id}`,
      type: 'cron' as const,
      label: j.name || j.id,
      detail: `Cron: ${cronScheduleDisplay(j.schedule)}`,
      time: j.lastRunAt!,
      status: j.enabled ? 'online' as const : 'idle' as const,
      statusLabel: j.enabled ? 'Active' : 'Paused',
    })),
  ].sort((a, b) => b.time - a.time)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Welcome back, Clementine"
      />

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Content Items"
          value={loading ? '...' : String(totalContent)}
          change={totalContent > 0 ? `${publishedCount} published` : 'Ready to add'}
          changeType={totalContent > 0 ? 'positive' : 'neutral'}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricCard
          label="Digests"
          value={loading ? '...' : String(totalDigests)}
          change={totalDigests > 0 ? `${totalDigests} total` : 'Starting soon'}
          changeType={totalDigests > 0 ? 'positive' : 'neutral'}
          icon={<Newspaper className="h-5 w-5" />}
        />
        <MetricCard
          label="Sessions"
          value={loading ? '...' : String(activeSessions.length)}
          change={activeSessions.length > 0 ? 'Active now' : 'No active'}
          changeType={activeSessions.length > 0 ? 'positive' : 'neutral'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Tokens Used"
          value={loading ? '...' : totalTokens > 0 ? formatTokens(totalTokens) : '0'}
          change={totalCost > 0 ? `$${totalCost.toFixed(4)}` : 'No cost'}
          changeType="neutral"
          icon={<Cpu className="h-5 w-5" />}
        />
      </div>

      {/* Second row: Gateway + Automation metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Automations"
          value={loading ? '...' : String(activeCronCount)}
          change={`${cronJobs.length} total jobs`}
          changeType="neutral"
          icon={<Zap className="h-5 w-5" />}
        />
        <MetricCard
          label="Agents"
          value={loading ? '...' : String(heartbeatAgents.length)}
          change="Configured"
          changeType="neutral"
          icon={<Bot className="h-5 w-5" />}
        />
        {tasks && (
          <>
            <MetricCard
              label="Tasks"
              value={String(tasks.active)}
              change={`${tasks.total} total · ${tasks.failures} failed`}
              changeType={tasks.failures > 0 ? 'negative' : 'neutral'}
              icon={<ListTodo className="h-5 w-5" />}
            />
            <MetricCard
              label="Gateway"
              value={gwVersion || '—'}
              change={gwUptime || 'Connected'}
              changeType="positive"
              icon={<Timer className="h-5 w-5" />}
            />
          </>
        )}
        {!tasks && (
          <MetricCard
            label="Gateway"
            value={gwVersion || '—'}
            change={gwUptime || 'Local'}
            changeType="positive"
            icon={<Server className="h-5 w-5" />}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agents */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-f-lg font-semibold text-white">Agents</h3>
            </div>
            <a href="/dashboard/agents" className="text-f-xs text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors">
              View all →
            </a>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
            </div>
          ) : heartbeatAgents.length > 0 ? (
            <div className="space-y-3">
              {heartbeatAgents.map((hb) => {
                const session = sessions.find(s => s.agentId === hb.agentId)
                const status: 'online' | 'idle' | 'offline' = session
                  ? session.status === 'running' ? 'online' : 'idle'
                  : 'offline'
                const pctUsed = session && session.contextTokens > 0
                  ? Math.round((session.totalTokens / session.contextTokens) * 100)
                  : 0
                return (
                  <div key={hb.agentId} className="py-2 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0">
                        <span className="text-f-base text-white/90 font-medium">{hb.agentId}</span>
                        {session && (
                          <p className="text-f-xs text-white/40 truncate">
                            {channelLabel(session.lastChannel || session.channel)} · {session.model}
                          </p>
                        )}
                      </div>
                      <span className="flex items-center gap-2 text-f-sm shrink-0 ml-3">
                        <StatusDot status={status} size="sm" />
                        <span className={
                          status === 'online' ? 'text-[#22C55E]'
                          : status === 'idle' ? 'text-[#F59E0B]'
                          : 'text-white/40'
                        }>
                          {status === 'online' ? 'Online' : status === 'idle' ? 'Idle' : 'Offline'}
                        </span>
                      </span>
                    </div>
                    {session && session.contextTokens > 0 && (
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-f-2xs text-white/30 mb-0.5">
                          <span>Context</span>
                          <span>{formatTokens(session.totalTokens)}/{formatTokens(session.contextTokens)} ({pctUsed}%)</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pctUsed > 80 ? 'bg-[#EF4444]' : pctUsed > 50 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
                            }`}
                            style={{ width: `${Math.min(pctUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="h-10 w-10 text-white/20 mb-3" />
              <p className="text-f-sm text-white/40">No agents configured</p>
            </div>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 py-3 px-4 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-[#F59E0B]/20 transition-all group"
                >
                  <Icon className="h-4 w-4 text-white/40 group-hover:text-[#F59E0B]" />
                  <span className="text-f-base text-white/80 group-hover:text-white">{action.label}</span>
                </a>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* Research Beats */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-white/40" />
          <h3 className="text-f-lg font-semibold text-white">Research Beats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Psychedelic Law', color: 'bg-purple-500/20 text-purple-400' },
            { label: 'Church of Singularism', color: 'bg-blue-500/20 text-blue-400' },
            { label: 'DEA Scheduling', color: 'bg-red-500/20 text-red-400' },
            { label: 'State Reform', color: 'bg-green-500/20 text-green-400' },
          ].map((beat) => (
            <div key={beat.label} className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-f-xs font-medium ${beat.color}`}>
                {beat.label}
              </span>
              <p className="mt-2 text-f-sm text-white/40">
                {digestCounts.length > 0
                  ? `${digestCounts.filter(d => d.category === beat.label.toLowerCase().replace(/\s/g, '_')).length} updates`
                  : 'No updates yet'}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Unified Activity Feed */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/40" />
            <h3 className="text-f-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="flex items-center gap-2 text-f-xs text-white/30">
            <span>{activityFeed.length} items</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        ) : activityFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-f-base text-white/40">No activity yet</p>
            <p className="text-f-sm text-white/25 mt-1">Start a conversation or set up automations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activityFeed.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0 ${
                    item.type === 'cron'
                      ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/20'
                      : 'bg-white/[0.04] border border-white/[0.06]'
                  }`}>
                    {item.type === 'cron'
                      ? <Calendar className="h-3 w-3 text-[#3B82F6]" />
                      : <Bot className="h-3 w-3 text-white/40" />
                    }
                  </div>
                  <div className="min-w-0">
                    <span className="text-f-sm text-white/90 font-medium truncate block">{item.label}</span>
                    <p className="text-f-xs text-white/40 truncate">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-f-xs text-white/30">{formatAge(Date.now() - item.time)}</span>
                  <StatusDot status={item.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Gateway Health */}
      {!loading && gwVersion && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-[10px] flex items-center justify-center bg-[#22C55E]/10 border border-[#22C55E]/20">
                <Server className="h-4 w-4 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="text-f-base font-semibold text-white">Gateway</h3>
                <p className="text-f-xs text-white/40">
                  OpenClaw v{gwVersion}
                  {gwUptime && ` · ${gwUptime}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {tasks && (
                <div className="flex items-center gap-3 text-f-xs text-white/40">
                  <span>{tasks.active} tasks</span>
                  {tasks.failures > 0 && (
                    <span className="text-[#EF4444]">{tasks.failures} failed</span>
                  )}
                </div>
              )}
              <span className="flex items-center gap-1.5 text-f-sm">
                <StatusDot status="online" size="sm" />
                <span className="text-[#22C55E]">Connected</span>
              </span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}