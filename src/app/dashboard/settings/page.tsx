'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard } from '@/components/ds'
import {
  Monitor,
  Database,
  Server,
  ExternalLink,
  Cpu,
  Activity,
  Clock,
  Wifi,
  Shield,
  HardDrive,
  Loader2,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GatewayInfo {
  runtimeVersion?: string
  uptime?: string
  gatewayMode?: string
  gatewayReachable?: boolean
  gatewayLatency?: number
  gatewayPid?: number
  host?: string
  platform?: string
  osPlatform?: string
  osArch?: string
  osRelease?: string
  tasks?: {
    total: number
    active: number
    terminal: number
    failures: number
  }
  heartbeat?: {
    defaultAgentId: string
    agents: Array<{ agentId: string; enabled: boolean; every: string; everyMs: number }>
  }
  sessions?: {
    count: number
    defaults: { model: string; contextTokens: number }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [gateway, setGateway] = useState<GatewayInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/gateway/status')
        if (res.ok) {
          const data = await res.json()
          setGateway(data)
        } else {
          setError('Gateway unreachable')
        }
      } catch {
        setError('Cannot connect to Gateway')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const configLinks = [
    { label: 'OpenClaw Docs', href: 'https://docs.openclaw.ai', description: 'Platform documentation', external: true },
    { label: 'GitHub Repo', href: 'https://github.com/OpenClawAgents/mission-control-clem', description: 'Source code', external: true },
    { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard', description: 'Database & auth management', external: true },
    { label: 'Vercel Dashboard', href: 'https://vercel.com', description: 'Deployment & domains', external: true },
  ]

  const dataPaths = [
    { label: 'Digital Library', path: '/Volumes/ClemDocs/Library', desc: 'Newsletters, research, scripts' },
    { label: 'Raw Footage', path: '/Volumes/ClemVideo/RawFootage', desc: 'Video clips and recordings' },
    { label: 'Video Catalog DB', path: '~/Library/video_catalog.db', desc: 'SQLite metadata index' },
    { label: 'OpenClaw Config', path: '~/.openclaw/openclaw.json', desc: 'Gateway & agent configuration' },
    { label: 'Workspace', path: '~/.openclaw/workspace', desc: 'Agent workspace & memory files' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="System configuration and diagnostics"
      />

      {/* Gateway Health Metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Gateway"
          value={loading ? '...' : gateway?.runtimeVersion || '—'}
          change={gateway?.gatewayReachable ? 'Connected' : error || 'Offline'}
          changeType={gateway?.gatewayReachable ? 'positive' : 'negative'}
          icon={<Server className="h-5 w-5" />}
        />
        <MetricCard
          label="Latency"
          value={loading ? '...' : gateway?.gatewayLatency != null ? `${gateway.gatewayLatency}ms` : '—'}
          change="Connect time"
          changeType="neutral"
          icon={<Wifi className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Tasks"
          value={loading ? '...' : String(gateway?.tasks?.active ?? 0)}
          change={`${gateway?.tasks?.total ?? 0} total`}
          changeType="neutral"
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Uptime"
          value={loading ? '...' : gateway?.uptime ? 'Running' : '—'}
          change={gateway?.uptime || 'Unknown'}
          changeType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gateway Details */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-f-lg font-semibold text-white">Gateway</h3>
            </div>
            {!loading && (
              <span className="flex items-center gap-1.5 text-f-sm">
                <StatusDot status={gateway?.gatewayReachable ? 'online' : 'offline'} size="sm" />
                <span className={gateway?.gatewayReachable ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                  {gateway?.gatewayReachable ? 'Connected' : error || 'Offline'}
                </span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
            </div>
          ) : gateway ? (
            <div className="space-y-2">
              {[
                { label: 'Version', value: gateway.runtimeVersion || '—' },
                { label: 'Mode', value: gateway.gatewayMode || '—' },
                { label: 'Host', value: gateway.host || '—' },
                { label: 'Platform', value: gateway.platform || '—' },
                { label: 'PID', value: gateway.gatewayPid ? String(gateway.gatewayPid) : '—' },
                { label: 'Latency', value: gateway.gatewayLatency != null ? `${gateway.gatewayLatency}ms` : '—' },
                { label: 'Uptime', value: gateway.uptime || '—' },
                { label: 'Default Model', value: gateway.sessions?.defaults?.model || '—' },
                { label: 'Context Window', value: gateway.sessions?.defaults?.contextTokens ? `${Math.round(gateway.sessions.defaults.contextTokens / 1000)}k` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                  <span className="text-f-sm text-white/50">{label}</span>
                  <span className="text-f-sm text-white/90 font-medium font-mono">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Server className="h-10 w-10 text-white/20 mb-3" />
              <p className="text-f-sm text-white/40">{error || 'Gateway unreachable'}</p>
              <p className="text-f-xs text-white/25 mt-1">Make sure OpenClaw is running locally</p>
            </div>
          )}
        </GlassCard>

        {/* System Info */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">System</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { label: 'OS', value: gateway?.osRelease || gateway?.platform || '—', icon: <Monitor className="h-4 w-4 text-white/40" /> },
                { label: 'Architecture', value: gateway?.osArch || '—', icon: <Cpu className="h-4 w-4 text-white/40" /> },
                { label: 'Platform', value: gateway?.osPlatform || '—', icon: <HardDrive className="h-4 w-4 text-white/40" /> },
                { label: 'Sessions', value: String(gateway?.sessions?.count ?? 0), icon: <Activity className="h-4 w-4 text-white/40" /> },
                { label: 'Agents', value: String(gateway?.heartbeat?.agents?.length ?? 0), icon: <Shield className="h-4 w-4 text-white/40" /> },
                { label: 'Tasks (total)', value: String(gateway?.tasks?.total ?? 0), icon: <Clock className="h-4 w-4 text-white/40" /> },
                { label: 'Tasks (active)', value: String(gateway?.tasks?.active ?? 0), icon: <Activity className="h-4 w-4 text-white/40" /> },
                { label: 'Task failures', value: String(gateway?.tasks?.failures ?? 0), icon: <Server className="h-4 w-4 text-white/40" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-t border-white/[0.04]">
                  {icon}
                  <span className="text-f-sm text-white/50">{label}</span>
                  <span className="ml-auto text-f-sm text-white/90 font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Infrastructure */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Infrastructure</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Platform', value: 'Mission Control Clem', icon: <Monitor className="h-4 w-4 text-white/40" /> },
              { label: 'Framework', value: 'Next.js 16', icon: <Server className="h-4 w-4 text-white/40" /> },
              { label: 'Database', value: 'Supabase', icon: <Database className="h-4 w-4 text-white/40" /> },
              { label: 'Deployment', value: 'Vercel', icon: <ExternalLink className="h-4 w-4 text-white/40" /> },
              { label: 'Runtime', value: 'OpenClaw Gateway', icon: <Server className="h-4 w-4 text-white/40" /> },
              { label: 'Auth', value: 'Token (local)', icon: <Shield className="h-4 w-4 text-white/40" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-t border-white/[0.04]">
                {icon}
                <span className="text-f-base text-white/65">{label}</span>
                <span className="ml-auto text-f-base text-white/90 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Quick Links</h3>
          </div>
          <div className="space-y-2">
            {configLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between py-3 px-4 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-[#F59E0B]/20 transition-all group"
              >
                <div>
                  <span className="text-f-base text-white/80 group-hover:text-white">{link.label}</span>
                  <p className="text-f-xs text-white/40">{link.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-white/60" />
              </a>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Data Paths */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">Data Paths</h3>
        </div>
        <div className="space-y-3">
          {dataPaths.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div className="min-w-0">
                <span className="text-f-base text-white/90 font-medium">{item.label}</span>
                <p className="text-f-xs text-white/40">{item.desc}</p>
              </div>
              <code className="text-f-xs text-[#F59E0B]/70 bg-[#F59E0B]/10 px-2 py-1 rounded-md shrink-0 ml-3">{item.path}</code>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Heartbeat Agents Config */}
      {gateway?.heartbeat?.agents && gateway.heartbeat.agents.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Agent Configuration</h3>
            <span className="ml-auto text-f-xs text-white/30">Default: {gateway.heartbeat.defaultAgentId}</span>
          </div>
          <div className="space-y-2">
            {gateway.heartbeat.agents.map((agent) => (
              <div key={agent.agentId} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <div className="min-w-0">
                  <span className="text-f-base text-white/90 font-medium">{agent.agentId}</span>
                  <p className="text-f-xs text-white/40">Heartbeat every {agent.every}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <StatusDot status={agent.enabled ? 'online' : 'idle'} size="sm" />
                  <span className={`text-f-xs ${agent.enabled ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
                    {agent.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}