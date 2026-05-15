'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot } from '@/components/ds'
import {
  Bot,
  Clock,
  Sparkles,
  Cpu,
  MessageSquare,
  Search,
  PenTool,
  Newspaper,
  Video,
  BookOpen,
  PlayCircle,
  PauseCircle,
  ChevronRight,
  Activity,
  Timer,
  Shield,
  FileArchive,
  Lightbulb,
  BarChart3,
  Zap,
} from 'lucide-react'

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

// Lucide icon map — each agent gets a unique icon, no emojis
const AGENT_ICONS: Record<string, { icon: typeof Bot; color: string; gradient: string }> = {
  main: { icon: Shield, color: '#F59E0B', gradient: 'from-[#F59E0B]/20 to-[#F59E0B]/5' },
  'content-strategist': { icon: Lightbulb, color: '#A855F7', gradient: 'from-[#A855F7]/20 to-[#A855F7]/5' },
  'research-scout': { icon: Search, color: '#3B82F6', gradient: 'from-[#3B82F6]/20 to-[#3B82F6]/5' },
  'script-writer': { icon: PenTool, color: '#EC4899', gradient: 'from-[#EC4899]/20 to-[#EC4899]/5' },
  'digest-compiler': { icon: Newspaper, color: '#22C55E', gradient: 'from-[#22C55E]/20 to-[#22C55E]/5' },
  'video-cataloger': { icon: Video, color: '#06B6D4', gradient: 'from-[#06B6D4]/20 to-[#06B6D4]/5' },
  'library-indexer': { icon: BookOpen, color: '#8B5CF6', gradient: 'from-[#8B5CF6]/20 to-[#8B5CF6]/5' },
}

const AGENT_META: Record<string, { desc: string; skills: string[]; category: string }> = {
  main: {
    desc: 'Mission Control orchestrator — coordinates all agents, manages system health, and runs nightly backups',
    skills: ['orchestration', 'health-check', 'nightly-backup'],
    category: 'System',
  },
  'content-strategist': {
    desc: 'Plans content calendar, repurposes newsletters into social assets, manages publishing queue and growth metrics',
    skills: ['repurpose', 'calendar', 'growth-metrics', 'scheduling'],
    category: 'Content',
  },
  'research-scout': {
    desc: 'Monitors psychedelic law, DEA scheduling, church rulings, state reform, and trending topics across sources',
    skills: ['law-tracking', 'trending-scan', 'source-verify', 'rss-monitor'],
    category: 'Research',
  },
  'script-writer': {
    desc: 'Produces viral-ready scripts with hooks, angles, and shot lists from research material',
    skills: ['hooks', 'angles', 'shot-lists', 'cta-writing'],
    category: 'Content',
  },
  'digest-compiler': {
    desc: 'Assembles daily digests from research sources, RSS feeds, and law trackers for distribution',
    skills: ['summarize', 'categorize', 'format', 'distribute'],
    category: 'Research',
  },
  'video-cataloger': {
    desc: 'Tags and indexes raw footage with metadata for fast retrieval and clip selection',
    skills: ['metadata-extract', 'transcription', 'auto-tagging'],
    category: 'Operations',
  },
  'library-indexer': {
    desc: 'Indexes and updates the digital library for search and repurposing across projects',
    skills: ['text-extract', 'embedding-gen', 'dedup', 'tagging'],
    category: 'Operations',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  System: '#F59E0B',
  Content: '#A855F7',
  Research: '#3B82F6',
  Operations: '#22C55E',
}

function formatSchedule(schedule: AgentCron['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    const parts = schedule.expr.split(' ')
    if (parts.length === 5) {
      const [min, hour, dayOfMonth, , dayOfWeek] = parts
      if (dayOfMonth === '*' && dayOfWeek === '*') {
        if (hour.includes(',')) {
          const times = hour.split(',').map(h => `${h.padStart(2, '0')}:${min.padStart(2, '0')}`).join(', ')
          return `Daily at ${times}`
        }
        return `Daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
      }
      if (dayOfWeek !== '*') return `Weekly`
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
  online: { color: '#22C55E', label: 'Online', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20' },
  idle: { color: '#F59E0B', label: 'Idle', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20' },
  offline: { color: '#6B7280', label: 'Offline', bg: 'bg-white/5', border: 'border-white/10' },
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

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
            <p className="text-f-xs text-white/40 mt-1">The dashboard server or Gateway may be temporarily unavailable</p>
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
        <div className="space-y-4">
          {agents.map((agent) => {
            const meta = AGENT_META[agent.agentId] || { desc: 'Agent', skills: [], category: 'Other' }
            const iconConfig = AGENT_ICONS[agent.agentId] || { icon: Bot, color: '#6B7280', gradient: 'from-white/10 to-white/5' }
            const Icon = iconConfig.icon
            const status = statusConfig[agent.status]
            const categoryColor = CATEGORY_COLORS[meta.category] || '#6B7280'
            const isExpanded = expandedAgent === agent.agentId
            const enabledCrons = agent.cronJobs.filter(j => j.enabled)
            const hasCrons = agent.cronJobs.length > 0

            return (
              <GlassCard key={agent.agentId} className={isExpanded ? 'ring-1 ring-white/10' : undefined}>
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedAgent(isExpanded ? null : agent.agentId)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`h-12 w-12 rounded-[12px] flex items-center justify-center border shrink-0 bg-gradient-to-br ${iconConfig.gradient}`}
                      style={{ borderColor: `${iconConfig.color}30` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: iconConfig.color }} />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-f-lg font-semibold text-white">{agent.name || agent.agentId}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-f-2xs font-medium ${status.bg} ${status.border} border`}>
                          <StatusDot status={agent.status} size="sm" />
                          <span style={{ color: status.color }}>{status.label}</span>
                        </span>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium border"
                          style={{ backgroundColor: `${categoryColor}10`, borderColor: `${categoryColor}20`, color: categoryColor }}
                        >
                          {meta.category}
                        </span>
                      </div>
                      <p className="text-f-sm text-white/50 line-clamp-2">{meta.desc}</p>
                      <div className="flex items-center gap-4 mt-2 text-f-xs text-white/30">
                        {hasCrons && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {enabledCrons.length}/{agent.cronJobs.length} tasks
                          </span>
                        )}
                        {agent.model && (
                          <span className="flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            {agent.model}
                          </span>
                        )}
                        {agent.activeSessions > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {agent.activeSessions} session{agent.activeSessions > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <ChevronRight className={`h-5 w-5 text-white/30 transition-transform shrink-0 mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-5">
                    {/* Skills */}
                    <div>
                      <div className="text-f-xs text-white/40 font-medium uppercase tracking-wider mb-2">Capabilities</div>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.skills.map((skill) => (
                          <span key={skill} className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-f-xs text-white/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pipeline flow */}
                    <div>
                      <div className="text-f-xs text-white/40 font-medium uppercase tracking-wider mb-2">Pipeline</div>
                      <div className="flex items-center gap-2">
                        {[
                          { label: 'Input', color: '#3B82F6', icon: Activity },
                          { label: 'Process', color: '#A855F7', icon: Zap },
                          { label: 'Output', color: '#22C55E', icon: BarChart3 },
                        ].map((stage, i) => {
                          const StageIcon = stage.icon
                          return (
                            <div key={stage.label} className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-f-sm font-medium border"
                                style={{ backgroundColor: `${stage.color}10`, borderColor: `${stage.color}20`, color: stage.color }}
                              >
                                <StageIcon className="h-3.5 w-3.5" />
                                {stage.label}
                              </span>
                              {i < 2 && <ChevronRight className="h-3 w-3 text-white/20" />}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Cron Jobs */}
                    {hasCrons && (
                      <div>
                        <div className="text-f-xs text-white/40 font-medium uppercase tracking-wider mb-2">Scheduled Tasks</div>
                        <div className="space-y-1">
                          {agent.cronJobs.map((job) => (
                            <div key={job.id} className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-[8px] bg-white/[0.02] border border-white/[0.04]">
                              <div className="flex items-center gap-3 min-w-0">
                                {job.enabled ? (
                                  <PlayCircle className="h-4 w-4 text-[#22C55E] shrink-0" />
                                ) : (
                                  <PauseCircle className="h-4 w-4 text-white/20 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <div className="text-f-sm text-white/80 font-medium truncate">{job.name}</div>
                                  <div className="text-f-xs text-white/35 flex items-center gap-1.5">
                                    <Timer className="h-3 w-3" />
                                    {formatSchedule(job.schedule)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {job.lastRunStatus === 'error' && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-f-2-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                                    error
                                  </span>
                                )}
                                {job.lastRunStatus === 'success' && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-f-2-xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                                    ok
                                  </span>
                                )}
                                <span className="text-f-2xs text-white/25">{formatTimeAgo(job.lastRunAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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