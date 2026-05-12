'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, SectionHeader } from '@/components/ds'
import {
  BookOpen,
  Server,
  Bot,
  Zap,
  Calendar,
  Shield,
  Cpu,
  Clock,
  Activity,
  ExternalLink,
  Database,
  FileText,
  Globe,
  Key,
  Terminal,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface DocSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
  items: DocItem[]
}

interface DocItem {
  label: string
  description: string
  type: 'endpoint' | 'concept' | 'cli' | 'config' | 'link'
  detail?: string
  href?: string
}

const sections: DocSection[] = [
  {
    id: 'api',
    title: 'API Reference',
    icon: Server,
    description: 'Gateway HTTP endpoints used by Mission Control',
    items: [
      {
        label: 'GET /api/sessions',
        description: 'List active sessions and main session status',
        type: 'endpoint',
        detail: 'Returns { ok, sessions: [{ key, agentId, kind, channel, model, status, startedAt, updatedAt, totalTokens, contextTokens, estimatedCostUsd }], mainStatus }',
      },
      {
        label: 'GET /api/gateway/status',
        description: 'Gateway health, version, uptime, task queue',
        type: 'endpoint',
        detail: 'Returns { ok, runtimeVersion, heartbeat, tasks, sessions, uptime, gatewayMode, host, platform, osArch }',
      },
      {
        label: 'GET /api/cron',
        description: 'List all cron jobs',
        type: 'endpoint',
        detail: 'Returns { ok, jobs: [{ id, name, enabled, schedule, payload, delivery, sessionTarget, lastRunAt, nextRunAt }] }',
      },
      {
        label: 'POST /api/cron',
        description: 'Actions: run, setEnabled, remove',
        type: 'endpoint',
        detail: 'Body: { action: "run"|"setEnabled"|"remove", jobId, enabled? } — run triggers immediate execution, setEnabled toggles, remove deletes',
      },
      {
        label: 'GET /api/cron/[jobId]/runs',
        description: 'Run history for a specific cron job',
        type: 'endpoint',
        detail: 'Returns { ok, runs: [{ id, jobId, startedAt, completedAt, status, error }] }',
      },
    ],
  },
  {
    id: 'gateway',
    title: 'Gateway',
    icon: Globe,
    description: 'How Mission Control connects to the OpenClaw Gateway',
    items: [
      {
        label: 'Two-Path Architecture',
        description: 'Read-only operations use /tools/invoke HTTP endpoint. Privileged operations (cron, exec) use the openclaw CLI.',
        type: 'concept',
      },
      {
        label: 'Authentication',
        description: 'Bearer token from ~/.openclaw/openclaw.json → gateway.auth.token. Override with OPENCLAW_GATEWAY_TOKEN env var.',
        type: 'config',
      },
      {
        label: 'Gateway URL',
        description: 'ws://127.0.0.1:18789 (local loopback, configurable via OPENCLAW_GATEWAY_PORT)',
        type: 'config',
      },
      {
        label: '/tools/invoke',
        description: 'Direct tool invocation endpoint. Supports sessions_list, session_status, memory_search. Blocks cron, exec, sessions_spawn for security.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/gateway/tools-invoke-http-api',
      },
      {
        label: 'Security Model',
        description: 'API routes are server-side only — the frontend never touches Gateway auth tokens. All requests proxied through Next.js route handlers.',
        type: 'concept',
      },
    ],
  },
  {
    id: 'cli',
    title: 'CLI Commands',
    icon: Terminal,
    description: 'OpenClaw CLI commands used for privileged operations',
    items: [
      {
        label: 'openclaw cron list --json',
        description: 'List all cron jobs as JSON',
        type: 'cli',
      },
      {
        label: 'openclaw cron runs [jobId] --json',
        description: 'Get run history for a cron job',
        type: 'cli',
      },
      {
        label: 'openclaw cron update [jobId] --json \'{"enabled":true}\'',
        description: 'Enable or disable a cron job',
        type: 'cli',
      },
      {
        label: 'openclaw cron run [jobId]',
        description: 'Trigger a cron job immediately',
        type: 'cli',
      },
      {
        label: 'openclaw cron remove [jobId]',
        description: 'Delete a cron job permanently',
        type: 'cli',
      },
      {
        label: 'openclaw status --json',
        description: 'Full system status: version, heartbeat, tasks, sessions, gateway, OS',
        type: 'cli',
      },
    ],
  },
  {
    id: 'concepts',
    title: 'Core Concepts',
    icon: Layers,
    description: 'Key OpenClaw concepts that power Mission Control',
    items: [
      {
        label: 'Sessions',
        description: 'Each conversation is a session (key: agent:agentId:channel). Sessions track model, tokens, cost, and context window usage.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/concepts/session',
      },
      {
        label: 'Agents',
        description: 'Autonomous agents defined in openclaw.json. Each has a model, workspace, and optional heartbeat schedule.',
        type: 'concept',
        href: 'https.openclaw.ai/concepts/agent',
      },
      {
        label: 'Cron Jobs',
        description: 'Scheduled tasks with cron expressions, intervals, or one-shot timing. Managed via CLI or Gateway API.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/automation/cron-jobs',
      },
      {
        label: 'Heartbeat',
        description: 'Periodic check-in for each agent (e.g., every 30m). Used for proactive monitoring and task execution.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/gateway/heartbeat',
      },
      {
        label: 'Context Window',
        description: 'Token budget per session (e.g., 128k). When exceeded, compaction occurs to summarize and free space.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/concepts/context',
      },
      {
        label: 'Skills',
        description: 'Named capabilities (SKILL.md files) that extend agent behavior. Mission Control maps them to cron jobs.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/concepts/agent-workspace',
      },
      {
        label: 'Task Queue',
        description: 'Background task system for subagent runs, cron execution, and delegated work. Tracks status, failures, and completion.',
        type: 'concept',
        href: 'https://docs.openclaw.ai/automation/tasks',
      },
    ],
  },
  {
    id: 'pages',
    title: 'Dashboard Pages',
    icon: BookOpen,
    description: 'What each Mission Control page shows and where its data comes from',
    items: [
      {
        label: 'Overview',
        description: 'Live metrics, agent status with context bars, unified activity feed (sessions + cron), gateway health card',
        type: 'concept',
      },
      {
        label: 'Agents',
        description: 'Live session data from /api/sessions. Configured heartbeat agents from /api/gateway/status. Context usage bars.',
        type: 'concept',
      },
      {
        label: 'Skills',
        description: 'Static skill definitions merged with live cron job data from /api/cron. Status, schedules, run-now triggers.',
        type: 'concept',
      },
      {
        label: 'Automation',
        description: 'Full cron job management: list, enable/disable, run now, delete. Expandable run history per job.',
        type: 'concept',
      },
      {
        label: 'Calendar',
        description: 'Month grid visualizing cron fire times. Cron expression parser computes schedule. Day drill-down for event details.',
        type: 'concept',
      },
      {
        label: 'Settings',
        description: 'Gateway diagnostics: version, mode, host, PID, latency, uptime. System info, agent config, data paths.',
        type: 'concept',
      },
    ],
  },
  {
    id: 'links',
    title: 'External Docs',
    icon: ExternalLink,
    description: 'Official OpenClaw documentation and resources',
    items: [
      {
        label: 'OpenClaw Docs',
        description: 'Full platform documentation',
        type: 'link',
        href: 'https://docs.openclaw.ai',
      },
      {
        label: 'Gateway Configuration',
        description: 'Complete config reference for gateway, agents, channels',
        type: 'link',
        href: 'https://docs.openclaw.ai/gateway/configuration',
      },
      {
        label: 'Cron Jobs',
        description: 'Creating and managing scheduled tasks',
        type: 'link',
        href: 'https://docs.openclaw.ai/automation/cron-jobs',
      },
      {
        label: 'Agent Concepts',
        description: 'How agents, sessions, and context work',
        type: 'link',
        href: 'https://docs.openclaw.ai/concepts/agent',
      },
      {
        label: 'GitHub Source',
        description: 'OpenClaw open source repository',
        type: 'link',
        href: 'https://github.com/openclaw/openclaw',
      },
      {
        label: 'Community Discord',
        description: 'Get help and share feedback',
        type: 'link',
        href: 'https://discord.com/invite/clawd',
      },
    ],
  },
]

function typeBadge(type: DocItem['type']) {
  const map: Record<DocItem['type'], { bg: string; text: string; label: string }> = {
    endpoint: { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: 'API' },
    concept: { bg: 'bg-[#A855F7]/10', text: 'text-[#A855F7]', label: 'Concept' },
    cli: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', label: 'CLI' },
    config: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', label: 'Config' },
    link: { bg: 'bg-white/[0.04]', text: 'text-white/40', label: 'Link' },
  }
  const c = map[type]
  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-f-2xs font-medium border border-current/10 ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['api', 'gateway']))

  function toggleSection(id: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        subtitle="Mission Control API reference, concepts, and guides"
      />

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <GlassCard hover={false} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center bg-[#22C55E]/10 border border-[#22C55E]/20">
            <Server className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-f-base font-semibold text-white">5</p>
            <p className="text-f-xs text-white/40">API Endpoints</p>
          </div>
        </GlassCard>
        <GlassCard hover={false} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center bg-[#3B82F6]/10 border border-[#3B82F6]/20">
            <Terminal className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-f-base font-semibold text-white">6</p>
            <p className="text-f-xs text-white/40">CLI Commands</p>
          </div>
        </GlassCard>
        <GlassCard hover={false} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center bg-[#A855F7]/10 border border-[#A855F7]/20">
            <Layers className="h-4 w-4 text-[#A855F7]" />
          </div>
          <div>
            <p className="text-f-base font-semibold text-white">7</p>
            <p className="text-f-xs text-white/40">Core Concepts</p>
          </div>
        </GlassCard>
        <GlassCard hover={false} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <BookOpen className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-f-base font-semibold text-white">6</p>
            <p className="text-f-xs text-white/40">External Docs</p>
          </div>
        </GlassCard>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const Icon = section.icon
        const isExpanded = expandedSections.has(section.id)

        return (
          <div key={section.id} className="space-y-3">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-2 text-left group"
            >
              <Icon className="h-4 w-4 text-[#F59E0B]" />
              <h2 className="text-f-lg font-semibold text-white group-hover:text-[#F59E0B] transition-colors">
                {section.title}
              </h2>
              <span className="text-f-xs text-white/30 ml-1">({section.items.length})</span>
              <span className="ml-auto text-white/30">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            </button>

            <p className="text-f-sm text-white/40 -mt-1 mb-2">{section.description}</p>

            {isExpanded && (
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isLink = item.type === 'link' || !!item.href
                  const content = (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-f-base text-white/90 font-medium font-mono text-f-sm">{item.label}</span>
                          {typeBadge(item.type)}
                        </div>
                        <p className="text-f-sm text-white/40 mt-0.5">{item.description}</p>
                        {item.detail && (
                          <div className="mt-2 rounded-[8px] bg-white/[0.02] border border-white/[0.06] p-3 overflow-x-auto">
                            <code className="text-f-xs text-[#F59E0B]/70 whitespace-pre-wrap break-all">{item.detail}</code>
                          </div>
                        )}
                      </div>
                      {isLink && (
                        <ExternalLink className="h-4 w-4 text-white/30 shrink-0 mt-1" />
                      )}
                    </div>
                  )

                  if (isLink && item.href) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-[10px] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#F59E0B]/15 p-4 transition-all group"
                      >
                        {content}
                      </a>
                    )
                  }

                  return (
                    <div
                      key={item.label}
                      className="rounded-[10px] border border-white/[0.04] bg-white/[0.01] p-4"
                    >
                      {content}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}