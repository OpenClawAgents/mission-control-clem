'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard } from '@/components/ds'
import { Bot, Cpu, Activity, Clock } from 'lucide-react'

interface SessionInfo {
  key: string
  agentId: string
  kind: string
  channel: string
  model: string
  status: string
  startedAt: number
  updatedAt: number
  totalTokens: number
  contextTokens: number
  estimatedCostUsd: number
  lastChannel?: string
}

interface GatewayOverview {
  runtimeVersion?: string
  heartbeat?: {
    defaultAgentId: string
    agents: Array<{ agentId: string; enabled: boolean; every: string; everyMs: number }>
  }
  sessions?: {
    count: number
    defaults: { model: string; contextTokens: number }
    recent: Array<{
      agentId: string
      key: string
      kind: string
      sessionId: string
      model: string
      runtime: string
      contextTokens: number
      totalTokens: number
      remainingTokens: number
      percentUsed: number
      inputTokens: number
      outputTokens: number
      updatedAt: number
      age: number
      systemSent: boolean
      abortedLastRun: boolean
      flags: string[]
      channel?: string
      lastChannel?: string
    }>
  }
  tasks?: {
    total: number
    active: number
    terminal: number
    failures: number
  }
}

function formatAge(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ${min % 60}m ago`
  const d = Math.floor(hr / 24)
  return `${d}d ${hr % 24}h ago`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function sessionStatus(s: SessionInfo): 'online' | 'idle' | 'offline' {
  if (s.status === 'running') return 'online'
  if (s.status === 'idle') return 'idle'
  return 'offline'
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

export default function AgentsPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [gateway, setGateway] = useState<GatewayOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
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
          setGateway(gwData)
        }
      } catch {
        // Network error — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeSessions = sessions.filter(s => s.status === 'running')
  const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0)
  const totalCost = sessions.reduce((sum, s) => sum + (s.estimatedCostUsd || 0), 0)
  const agentCount = gateway?.heartbeat?.agents?.length ?? 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        subtitle="Live sessions and agent status from OpenClaw Gateway"
      />

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Active Sessions"
          value={loading ? '...' : String(activeSessions.length)}
          change={activeSessions.length > 0 ? 'Running' : 'No active'}
          changeType={activeSessions.length > 0 ? 'positive' : 'neutral'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Agents"
          value={loading ? '...' : String(agentCount)}
          change="Configured"
          changeType="neutral"
          icon={<Bot className="h-5 w-5" />}
        />
        <MetricCard
          label="Total Tokens"
          value={loading ? '...' : formatTokens(totalTokens)}
          change="Across all sessions"
          changeType="neutral"
          icon={<Cpu className="h-5 w-5" />}
        />
        <MetricCard
          label="Est. Cost"
          value={loading ? '...' : `$${totalCost.toFixed(4)}`}
          change={totalCost > 0 ? 'Cumulative' : 'No cost yet'}
          changeType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Agent heartbeat configs */}
      {gateway?.heartbeat?.agents && gateway.heartbeat.agents.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Configured Agents</h3>
          </div>
          <div className="space-y-3">
            {gateway.heartbeat.agents.map((agent) => {
              const matchingSession = sessions.find(s => s.agentId === agent.agentId)
              const status = matchingSession ? sessionStatus(matchingSession) : 'offline'
              return (
                <div key={agent.agentId} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-[10px] flex items-center justify-center ${
                      status === 'online'
                        ? 'bg-[#22C55E]/10 border border-[#22C55E]/20'
                        : status === 'idle'
                        ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/20'
                        : 'bg-white/[0.04] border border-white/[0.06]'
                    }`}>
                      <Bot className={`h-4 w-4 ${
                        status === 'online' ? 'text-[#22C55E]'
                        : status === 'idle' ? 'text-[#F59E0B]'
                        : 'text-white/30'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-f-base text-white/90 font-medium">{agent.agentId}</span>
                      {matchingSession && (
                        <p className="text-f-xs text-white/40 truncate">
                          {channelLabel(matchingSession.lastChannel || matchingSession.channel)} · {matchingSession.model}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-f-xs text-white/40">
                      Heartbeat: {agent.every}
                    </span>
                    <span className="flex items-center gap-1.5 text-f-xs">
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
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Active sessions */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">
            Sessions
            {sessions.length > 0 && (
              <span className="ml-2 text-f-sm font-normal text-white/40">({sessions.length})</span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F59E0B] border-t-transparent mb-3" />
            <p className="text-f-base text-white/40">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-f-lg font-semibold text-white/80">No active sessions</h3>
            <p className="text-f-sm text-white/40 mt-1">Start a conversation with Clem to see sessions here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const status = sessionStatus(session)
              const pctUsed = session.contextTokens > 0
                ? Math.round((session.totalTokens / session.contextTokens) * 100)
                : 0
              return (
                <div key={session.key} className="rounded-[10px] border border-white/[0.04] p-4 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center ${
                        status === 'online'
                          ? 'bg-[#22C55E]/10 border border-[#22C55E]/20'
                          : 'bg-[#F59E0B]/10 border border-[#F59E0B]/20'
                      }`}>
                        <Bot className={`h-4 w-4 ${
                          status === 'online' ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-f-base font-semibold text-white truncate">{session.agentId}</h4>
                        <span className="flex items-center gap-1.5 text-f-xs">
                          <StatusDot status={status} size="sm" />
                          <span className={status === 'online' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                            {status === 'online' ? 'Online' : 'Idle'}
                          </span>
                          <span className="text-white/30">·</span>
                          <span className="text-white/40">{channelLabel(session.lastChannel || session.channel)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-f-xs text-white/40">{session.model}</p>
                      <p className="text-f-2xs text-white/30">{formatAge(Date.now() - session.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Context bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-f-xs text-white/40 mb-1">
                      <span>Context window</span>
                      <span>{formatTokens(session.totalTokens)} / {formatTokens(session.contextTokens)} ({pctUsed}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pctUsed > 80 ? 'bg-[#EF4444]' : pctUsed > 50 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
                        }`}
                        style={{ width: `${Math.min(pctUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Gateway version info */}
      {gateway?.runtimeVersion && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-f-base font-semibold text-white">Gateway</h3>
              <p className="text-f-xs text-white/40">OpenClaw v{gateway.runtimeVersion}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="online" />
              <span className="text-f-sm text-[#22C55E]">Connected</span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}