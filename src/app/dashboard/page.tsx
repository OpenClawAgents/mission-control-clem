'use client'

import { useEffect, useState } from 'react'
import { PageHeader, MetricCard, GlassCard, StatusDot } from '@/components/ds'
import {
  BookOpen,
  Video,
  Newspaper,
  FileText,
  Bot,
  Zap,
  TrendingUp,
  Clock,
  Edit3,
  Cpu,
  Activity,
} from 'lucide-react'
import { getContentCounts, getDigestCounts, type ContentType, type ContentStatus } from '@/lib/api'

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
  lastChannel?: string
}

interface HeartbeatAgent {
  agentId: string
  enabled: boolean
  every: string
  everyMs: number
}

const quickActions = [
  { label: 'Add Content', href: '/dashboard/content', icon: BookOpen },
  { label: 'Catalog Video', href: '/dashboard/videos', icon: Video },
  { label: 'Write Digest', href: '/dashboard/digests', icon: Newspaper },
  { label: 'New Script', href: '/dashboard/scripts', icon: Edit3 },
  { label: 'View Calendar', href: '/dashboard/calendar', icon: Clock },
  { label: 'Agent Status', href: '/dashboard/agents', icon: Bot },
]

function formatAge(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
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

export default function DashboardPage() {
  const [contentCounts, setContentCounts] = useState<{ type: ContentType; status: ContentStatus }[]>([])
  const [digestCounts, setDigestCounts] = useState<{ category: string }[]>([])
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [heartbeatAgents, setHeartbeatAgents] = useState<HeartbeatAgent[]>([])
  const [gwVersion, setGwVersion] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cc, dc] = await Promise.all([getContentCounts(), getDigestCounts()])
        setContentCounts(cc)
        setDigestCounts(dc)
      } catch {
        // Tables may be empty
      }

      try {
        const [sessRes, gwRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/gateway/status'),
        ])
        if (sessRes.ok) {
          const sessData = await sessRes.json()
          setSessions(sessData.sessions ?? [])
        }
        if (gwRes.ok) {
          const gwData = await gwRes.json()
          setHeartbeatAgents(gwData.heartbeat?.agents ?? [])
          setGwVersion(gwData.runtimeVersion ?? '')
        }
      } catch {
        // Gateway may be unreachable
      }

      setLoading(false)
    }
    load()
  }, [])

  const totalContent = contentCounts.length
  const totalDigests = digestCounts.length
  const scriptCount = contentCounts.filter(c => c.type === 'script').length
  const publishedCount = contentCounts.filter(c => c.status === 'published').length
  const activeSessions = sessions.filter(s => s.status === 'running')
  const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Welcome back, Clementine"
      />

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
          change={activeSessions.length > 0 ? 'Active' : 'No active'}
          changeType={activeSessions.length > 0 ? 'positive' : 'neutral'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Tokens Used"
          value={loading ? '...' : totalTokens > 0 ? `${Math.round(totalTokens / 1000)}k` : '0'}
          change="Across all sessions"
          changeType="neutral"
          icon={<Cpu className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live agents */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-f-lg font-semibold text-white">Agents</h3>
            </div>
            {gwVersion && (
              <span className="text-f-2xs text-white/30">OpenClaw v{gwVersion}</span>
            )}
          </div>

          {heartbeatAgents.length > 0 ? (
            <div className="space-y-3">
              {heartbeatAgents.map((hb) => {
                const session = sessions.find(s => s.agentId === hb.agentId)
                const status: 'online' | 'idle' | 'offline' = session
                  ? session.status === 'running' ? 'online' : 'idle'
                  : 'offline'
                return (
                  <div key={hb.agentId} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
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

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-white/40" />
            <h3 className="text-f-lg font-semibold text-white">Recent Sessions</h3>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => {
              const status: 'online' | 'idle' | 'offline' = session.status === 'running' ? 'online' : 'idle'
              return (
                <div key={session.key} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                  <div className="min-w-0">
                    <span className="text-f-base text-white/90 font-medium">{session.agentId}</span>
                    <p className="text-f-xs text-white/40">{channelLabel(session.lastChannel || session.channel)} · {session.model}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-f-xs text-white/30">{formatAge(Date.now() - session.updatedAt)}</span>
                    <StatusDot status={status} size="sm" />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}
    </div>
  )
}