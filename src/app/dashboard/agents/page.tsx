'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot } from '@/components/ds'
import { Bot, Clock, Sparkles, ExternalLink } from 'lucide-react'

interface AgentCron {
  id: string
  name: string
  enabled: boolean
  schedule: { kind: string; expr?: string; everyMs?: number; at?: string }
  lastRunAt: number | null
  lastRunStatus: string | null
  nextRunAt: number | null
}

interface AgentData {
  agentId: string
  name?: string
  emoji?: string
  model?: string
  status: 'online' | 'idle' | 'offline'
  cronJobs: AgentCron[]
  activeSessions: number
}

// Fallback descriptions keyed by agentId
const AGENT_META: Record<string, { desc: string; skills: string[] }> = {
  main: {
    desc: 'Mission Control orchestrator — coordinates all agents and manages the dashboard',
    skills: ['orchestration', 'gateway', 'health-check'],
  },
  'content-strategist': {
    desc: 'Plans content calendar, repurposes newsletters into social assets, manages publishing queue',
    skills: ['repurpose', 'calendar', 'growth-metrics', 'scheduling'],
  },
  'research-scout': {
    desc: 'Monitors psychedelic law, DEA scheduling, church rulings, state reform, and trending topics',
    skills: ['law-tracking', 'trending-scan', 'source-verify', 'rss-monitor'],
  },
  'script-writer': {
    desc: 'Produces viral-ready scripts with hooks, angles, and shot lists from research material',
    skills: ['hooks', 'angles', 'shot-lists', 'cta-writing'],
  },
  'digest-compiler': {
    desc: 'Assembles daily digests from research sources, RSS feeds, and law trackers',
    skills: ['summarize', 'categorize', 'format', 'distribute'],
  },
}

function formatSchedule(schedule: AgentCron['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    // Parse simple cron expressions into human-readable
    const parts = schedule.expr.split(' ')
    if (parts.length === 5) {
      const [min, hour, dayOfMonth, month, dayOfWeek] = parts
      if (dayOfMonth === '*' && month === '*') {
        if (dayOfWeek === '*') {
          // Daily or multiple times per day
          if (hour.includes(',')) {
            const times = hour.split(',').map(h => `${h.padStart(2, '0')}:${min.padStart(2, '0')}`).join(', ')
            return `Daily at ${times}`
          }
          return `Daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
        }
        return `Weekly`
      }
    }
    return schedule.expr
  }
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    return min >= 60 ? `Every ${Math.round(min / 60)}h` : `Every ${min}m`
  }
  return 'One-time'
}

function formatTimeAgo(ms: number | null): string {
  if (!ms) return 'Never'
  const diff = Date.now() - ms
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

const statusConfig = {
  online: { color: '#22C55E', label: 'Online' },
  idle: { color: '#F59E0B', label: 'Idle' },
  offline: { color: '#6B7280', label: 'Offline' },
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.ok ? r.json() : r.json().then(j => { throw new Error(j.error) }))
      .then(data => {
        setAgents(data.agents || [])
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        subtitle="Clem's production squad — coordinating content, research, and scripting"
      />

      {error && (
        <GlassCard hover={false}>
          <div className="py-4 text-center">
            <p className="text-f-sm text-[#EF4444]">Failed to load agents: {error}</p>
            <p className="text-f-xs text-white/40 mt-1">Make sure the Gateway is running</p>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Sparkles className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => {
            const meta = AGENT_META[agent.agentId] || { desc: 'Agent', skills: [] }
            const status = statusConfig[agent.status]
            return (
              <GlassCard key={agent.agentId} className="relative overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-[10px] flex items-center justify-center border"
                      style={{ backgroundColor: `${status.color}10`, borderColor: `${status.color}20` }}
                    >
                      {agent.emoji ? (
                        <span className="text-f-lg">{agent.emoji}</span>
                      ) : (
                        <Bot className="h-5 w-5" style={{ color: status.color }} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-f-base font-semibold text-white">{agent.name || agent.agentId}</h3>
                      <span className="flex items-center gap-1.5 text-f-xs">
                        <StatusDot status={agent.status} size="sm" />
                        <span style={{ color: status.color }}>{status.label}</span>
                        {agent.model && (
                          <span className="text-white/25 ml-1">· {agent.model}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {agent.activeSessions > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                      {agent.activeSessions} session{agent.activeSessions > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-f-sm text-white/60 mb-3">{meta.desc}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {meta.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-f-2xs text-white/50">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Cron Jobs */}
                {agent.cronJobs.length > 0 && (
                  <div className="border-t border-white/[0.06] pt-3 mt-1">
                    <div className="text-f-xs text-white/40 font-medium uppercase tracking-wider mb-2">Scheduled Tasks</div>
                    <div className="space-y-2">
                      {agent.cronJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-f-sm text-white/80 font-medium truncate">{job.name}</div>
                            <div className="text-f-xs text-white/40">{formatSchedule(job.schedule)}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {job.lastRunStatus === 'error' && (
                              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-f-2xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">error</span>
                            )}
                            {job.lastRunStatus === 'success' && (
                              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-f-2xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">ok</span>
                            )}
                            <span className="text-f-2xs text-white/30">{formatTimeAgo(job.lastRunAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}