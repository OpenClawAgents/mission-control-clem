'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot } from '@/components/ds'
import {
  Settings,
  Server,
  Database,
  Shield,
  Clock,
  Cpu,
  Bot,
  Loader2,
  ExternalLink,
  RefreshCw,
  Activity,
  HardDrive,
} from 'lucide-react'

interface GatewayStatus {
  version: string
  uptime: string
  status: string
  heartbeat?: { agents: Array<{ agentId: string; enabled: boolean }> }
  tasks?: { total: number; active: number; terminal: number; failures: number }
}

interface CronJob {
  id: string
  name?: string
  enabled: boolean
  schedule: { kind: string; expr?: string; everyMs?: number }
}

export default function SettingsPage() {
  const [gw, setGw] = useState<GatewayStatus | null>(null)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'unknown'>('unknown')

  useEffect(() => {
    async function load() {
      try {
        const [gwRes, cronRes] = await Promise.all([
          fetch('/api/gateway/status'),
          fetch('/api/cron'),
        ])
        if (gwRes.ok) {
          const data = await gwRes.json()
          setGw(data)
        }
        if (cronRes.ok) {
          const data = await cronRes.json()
          setCronJobs(data.jobs ?? [])
        }
        // Quick DB check
        try {
          const dbRes = await fetch('/api/content?limit=1')
          setDbStatus(dbRes.ok ? 'connected' : 'error')
        } catch {
          setDbStatus('error')
        }
      } catch {
        // Gateway may be unreachable
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const enabledCrons = cronJobs.filter(j => j.enabled).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Gateway configuration and system health"
      />

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gateway */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[8px] flex items-center justify-center bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                  <Server className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <h3 className="text-f-lg font-semibold text-white">Gateway</h3>
              </div>
              <span className="flex items-center gap-1.5 text-f-sm">
                <StatusDot status={gw ? 'online' : 'offline'} size="sm" />
                <span className={gw ? 'text-[#22C55E]' : 'text-white/40'}>
                  {gw ? 'Connected' : 'Unavailable'}
                </span>
              </span>
            </div>
            <div className="space-y-0">
              {[
                { label: 'Version', value: gw?.version || '—', icon: Cpu },
                { label: 'Uptime', value: gw?.uptime || '—', icon: Clock },
                { label: 'Agents', value: gw?.heartbeat?.agents?.length ? String(gw.heartbeat.agents.length) : '—', icon: Bot },
                { label: 'Status', value: gw?.status || 'unknown', icon: Activity },
              ].map((item) => {
                const ItemIcon = item.icon
                return (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-t border-white/[0.04]">
                    <span className="flex items-center gap-2 text-f-base text-white/70">
                      <ItemIcon className="h-3.5 w-3.5 text-white/30" />
                      {item.label}
                    </span>
                    <span className="text-f-sm text-white/60 font-medium">{item.value}</span>
                  </div>
                )
              })}
            </div>
            {gw?.tasks && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-f-xs text-white/40 font-medium uppercase tracking-wider">Tasks</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                    <div className="text-f-base font-semibold text-white">{gw.tasks.active}</div>
                    <div className="text-f-2xs text-white/30">Active</div>
                  </div>
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                    <div className="text-f-base font-semibold text-white">{gw.tasks.terminal}</div>
                    <div className="text-f-2xs text-white/30">Done</div>
                  </div>
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                    <div className="text-f-base font-semibold text-[#EF4444]">{gw.tasks.failures}</div>
                    <div className="text-f-2xs text-white/30">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Database */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[8px] flex items-center justify-center bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                  <Database className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <h3 className="text-f-lg font-semibold text-white">Database</h3>
              </div>
              <span className="flex items-center gap-1.5 text-f-sm">
                <StatusDot
                  status={dbStatus === 'connected' ? 'online' : dbStatus === 'error' ? 'offline' : 'idle'}
                  size="sm"
                />
                <span className={dbStatus === 'connected' ? 'text-[#22C55E]' : 'text-white/40'}>
                  {dbStatus === 'connected' ? 'Connected' : dbStatus === 'error' ? 'Error' : 'Unknown'}
                </span>
              </span>
            </div>
            <div className="space-y-0">
              {[
                { label: 'Provider', value: 'Supabase', icon: Database },
                { label: 'URL', value: 'lmboomcjvrohibzqbmaw.supabase.co', icon: ExternalLink },
                { label: 'Auth', value: 'Row Level Security', icon: Shield },
                { label: 'Tables', value: '6 tables', icon: HardDrive },
              ].map((item) => {
                const ItemIcon = item.icon
                return (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-t border-white/[0.04]">
                    <span className="flex items-center gap-2 text-f-base text-white/70">
                      <ItemIcon className="h-3.5 w-3.5 text-white/30" />
                      {item.label}
                    </span>
                    <span className="text-f-sm text-white/60 font-medium truncate ml-3">{item.value}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-3.5 w-3.5 text-white/30" />
                <span className="text-f-xs text-white/40 font-medium uppercase tracking-wider">Migrations</span>
              </div>
              <div className="flex items-center gap-2 text-f-xs text-white/30">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 text-[#22C55E]">002 vector search</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-white/40">003 content pipeline</span>
              </div>
            </div>
          </GlassCard>

          {/* Automation summary */}
          <GlassCard className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-[8px] flex items-center justify-center bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <h3 className="text-f-lg font-semibold text-white">Automations</h3>
              <span className="text-f-xs text-white/30 ml-auto">{enabledCrons} of {cronJobs.length} active</span>
            </div>
            {cronJobs.length === 0 ? (
              <div className="text-center py-8 text-f-base text-white/30">
                No automations configured
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cronJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-2.5 rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3"
                  >
                    <StatusDot status={job.enabled ? 'online' : 'offline'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-f-sm text-white/80 font-medium truncate">{job.name || job.id}</div>
                      <div className="text-f-xs text-white/30">
                        {job.schedule.kind === 'cron' ? job.schedule.expr : job.schedule.kind}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  )
}