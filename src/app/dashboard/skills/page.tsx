'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot } from '@/components/ds'
import {
  Bot,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Search,
  Lightbulb,
  PenTool,
  Newspaper,
  Video,
  BookOpen,
  Activity,
  Zap,
  BarChart3,
  PlayCircle,
  PauseCircle,
  Timer,
  Cpu,
  MessageSquare,
  ArrowRight,
  ArrowDownToLine as InputIcon,
  Workflow,
  ArrowUpFromLine as OutputIcon,
} from 'lucide-react'

interface AgentCron {
  id: string
  name: string
  enabled: boolean
  schedule: { kind: string; expr?: string; everyMs?: number; at?: string }
  lastRunAt: number | null
  lastRunStatus: string | null
  lastError: string | null
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

// Lucide icon map — each agent gets a unique icon
const AGENT_ICONS: Record<string, { icon: typeof Bot; color: string }> = {
  main: { icon: Shield, color: '#F59E0B' },
  'content-strategist': { icon: Lightbulb, color: '#A855F7' },
  'research-scout': { icon: Search, color: '#3B82F6' },
  'script-writer': { icon: PenTool, color: '#EC4899' },
  'digest-compiler': { icon: Newspaper, color: '#22C55E' },
  'video-cataloger': { icon: Video, color: '#06B6D4' },
  'library-indexer': { icon: BookOpen, color: '#8B5CF6' },
}

// Skill metadata keyed by agentId
const SKILL_META: Record<string, { desc: string; category: 'content' | 'research' | 'operations' | 'automation'; skills: string[] }> = {
  main: {
    desc: 'Mission Control orchestrator — coordinates all agents, manages the dashboard, and runs system tasks',
    category: 'automation',
    skills: ['orchestration', 'gateway-health', 'nightly-backup'],
  },
  'content-strategist': {
    desc: 'Plans content calendar, repurposes newsletters into social assets, manages publishing queue',
    category: 'content',
    skills: ['repurpose', 'calendar', 'growth-metrics', 'scheduling'],
  },
  'research-scout': {
    desc: 'Monitors psychedelic law, DEA scheduling, church rulings, state reform, and trending topics',
    category: 'research',
    skills: ['law-tracking', 'trending-scan', 'source-verify', 'rss-monitor'],
  },
  'script-writer': {
    desc: 'Produces viral-ready scripts with hooks, angles, and shot lists from research material',
    category: 'content',
    skills: ['hooks', 'angles', 'shot-lists', 'cta-writing'],
  },
  'digest-compiler': {
    desc: 'Assembles daily digests from research sources, RSS feeds, and law trackers',
    category: 'research',
    skills: ['summarize', 'categorize', 'format', 'distribute'],
  },
  'video-cataloger': {
    desc: 'Tags and indexes raw footage from /Volumes/ClemVideo/RawFootage with metadata for fast retrieval',
    category: 'operations',
    skills: ['metadata-extract', 'transcription', 'auto-tagging'],
  },
  'library-indexer': {
    desc: 'Indexes and updates the digital library at /Volumes/ClemDocs/Library for search and repurposing',
    category: 'operations',
    skills: ['text-extract', 'embedding-gen', 'dedup', 'tagging'],
  },
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof Bot }> = {
  content: { label: 'Content', color: '#A855F7', icon: Lightbulb },
  research: { label: 'Research', color: '#3B82F6', icon: Search },
  operations: { label: 'Operations', color: '#22C55E', icon: Activity },
  automation: { label: 'Automation', color: '#F59E0B', icon: Zap },
}

function formatCronSchedule(schedule: AgentCron['schedule']): string {
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
      if (dayOfWeek !== '*') return 'Weekly'
    }
    return schedule.expr
  }
  if (schedule.kind === 'every' && schedule.everyMs) {
    const m = Math.round(schedule.everyMs / 60000)
    return m >= 60 ? `Every ${Math.round(m / 60)}h` : `Every ${m}m`
  }
  return 'One-time'
}

const statusConfig = {
  online: { color: '#22C55E', label: 'Online' },
  idle: { color: '#F59E0B', label: 'Idle' },
  offline: { color: '#6B7280', label: 'Offline' },
}

export default function SkillsPage() {
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

  const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
    key,
    ...config,
    agents: agents.filter(a => SKILL_META[a.agentId]?.category === key),
  })).filter(c => c.agents.length > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills & Agents"
        subtitle="Agent capabilities and their scheduled tasks"
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
        <div className="space-y-8">
          {categories.map(({ key, label, color, icon: CatIcon, agents: catAgents }) => (
            <div key={key}>
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-7 w-7 rounded-[8px] flex items-center justify-center border" style={{ backgroundColor: `${color}10`, borderColor: `${color}20` }}>
                  <CatIcon className="h-4 w-4" style={{ color }} />
                </div>
                <h2 className="text-f-lg font-semibold text-white">{label}</h2>
                <span className="text-f-xs text-white/30 ml-1">{catAgents.length} agent{catAgents.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                {catAgents.map((agent) => {
                  const meta = SKILL_META[agent.agentId] || { desc: agent.agentId, skills: [], category: 'other' }
                  const iconConfig = AGENT_ICONS[agent.agentId] || { icon: Bot, color: '#6B7280' }
                  const AgentIcon = iconConfig.icon
                  const isExpanded = expandedAgent === agent.agentId
                  const status = statusConfig[agent.status]
                  const enabledCrons = agent.cronJobs.filter(j => j.enabled)

                  return (
                    <GlassCard key={agent.agentId} className={isExpanded ? 'ring-1 ring-white/10' : undefined}>
                      <button
                        className="w-full flex items-center justify-between"
                        onClick={() => setExpandedAgent(isExpanded ? null : agent.agentId)}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="h-11 w-11 rounded-[10px] flex items-center justify-center border shrink-0"
                            style={{ backgroundColor: `${iconConfig.color}10`, borderColor: `${iconConfig.color}20` }}
                          >
                            <AgentIcon className="h-5 w-5" style={{ color: iconConfig.color }} />
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-f-base text-white font-semibold truncate">{agent.name || agent.agentId}</span>
                              <span className="flex items-center gap-1 text-f-2xs">
                                <StatusDot status={agent.status} size="sm" />
                                <span style={{ color: status.color }}>{status.label}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-f-xs text-white/35 mt-0.5">
                              {agent.cronJobs.length > 0 && (
                                <span>{enabledCrons.length}/{agent.cronJobs.length} tasks</span>
                              )}
                              {agent.model && <span>{agent.model}</span>}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-white/30 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-5">
                          {/* Description */}
                          <p className="text-f-sm text-white/60">{meta.desc}</p>

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

                          {/* Pipeline */}
                          <div>
                            <div className="text-f-xs text-white/40 font-medium uppercase tracking-wider mb-2">Pipeline</div>
                            <div className="flex items-center gap-2">
                              {[
                                { label: 'Input', color: '#3B82F6', icon: InputIcon },
                                { label: 'Process', color: '#A855F7', icon: Workflow },
                                { label: 'Output', color: '#22C55E', icon: OutputIcon },
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
                                    {i < 2 && <ArrowRight className="h-3 w-3 text-white/20" />}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Cron Jobs */}
                          {agent.cronJobs.length > 0 && (
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
                                        <div className="text-f-sm text-white/80 font-medium">{job.name}</div>
                                        <div className="text-f-xs text-white/35 flex items-center gap-1.5">
                                          <Timer className="h-3 w-3" />
                                          {formatCronSchedule(job.schedule)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {!job.enabled && (
                                        <span className="text-f-2xs text-white/30">Paused</span>
                                      )}
                                      {job.lastRunStatus === 'error' && (
                                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-f-2-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">error</span>
                                      )}
                                      {job.lastRunStatus === 'success' && (
                                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-f-2-xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">ok</span>
                                      )}
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
            </div>
          ))}

          {categories.length === 0 && !loading && !error && (
            <GlassCard hover={false}>
              <div className="py-8 text-center text-white/40">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-f-sm">No agents configured yet</p>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  )
}