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
} from 'lucide-react'
import { getContentCounts, getDigestCounts, type ContentType, type ContentStatus } from '@/lib/api'

const agentSquad = [
  { name: 'Content Strategist', desc: 'Plans content calendar & repurposes newsletters', status: 'online' as const },
  { name: 'Research Scout', desc: 'Monitors psychedelic law, DEA, church rulings', status: 'online' as const },
  { name: 'Script Writer', desc: 'Produces viral-ready scripts with hooks & angles', status: 'online' as const },
  { name: 'Digest Compiler', desc: 'Assembles daily digests from research sources', status: 'idle' as const },
]

const quickActions = [
  { label: 'Add Content', href: '/dashboard/content', icon: BookOpen },
  { label: 'Catalog Video', href: '/dashboard/videos', icon: Video },
  { label: 'Write Digest', href: '/dashboard/digests', icon: Newspaper },
  { label: 'New Script', href: '/dashboard/scripts', icon: Edit3 },
  { label: 'View Calendar', href: '/dashboard/calendar', icon: Clock },
  { label: 'Agent Status', href: '/dashboard/agents', icon: Bot },
]

export default function DashboardPage() {
  const [contentCounts, setContentCounts] = useState<{ type: ContentType; status: ContentStatus }[]>([])
  const [digestCounts, setDigestCounts] = useState<{ category: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cc, dc] = await Promise.all([getContentCounts(), getDigestCounts()])
        setContentCounts(cc)
        setDigestCounts(dc)
      } catch {
        // Tables exist but may be empty — that's fine
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalContent = contentCounts.length
  const totalDigests = digestCounts.length
  const scriptCount = contentCounts.filter(c => c.type === 'script').length
  const publishedCount = contentCounts.filter(c => c.status === 'published').length

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
          label="Videos"
          value="0"
          change="Catalog ready"
          changeType="neutral"
          icon={<Video className="h-5 w-5" />}
        />
        <MetricCard
          label="Digests"
          value={loading ? '...' : String(totalDigests)}
          change={totalDigests > 0 ? `${totalDigests} total` : 'Starting soon'}
          changeType={totalDigests > 0 ? 'positive' : 'neutral'}
          icon={<Newspaper className="h-5 w-5" />}
        />
        <MetricCard
          label="Scripts"
          value={loading ? '...' : String(scriptCount)}
          change={scriptCount > 0 ? 'In library' : 'Write your first'}
          changeType={scriptCount > 0 ? 'positive' : 'neutral'}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Agent Squad</h3>
          </div>
          <div className="space-y-3">
            {agentSquad.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <div className="min-w-0">
                  <span className="text-f-base text-white/90 font-medium">{agent.name}</span>
                  <p className="text-f-xs text-white/50 truncate">{agent.desc}</p>
                </div>
                <span className="flex items-center gap-2 text-f-sm shrink-0 ml-3">
                  <StatusDot status={agent.status} size="sm" />
                  <span className={agent.status === 'online' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                    {agent.status === 'online' ? 'Online' : 'Idle'}
                  </span>
                </span>
              </div>
            ))}
          </div>
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

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-white/40" />
          <h3 className="text-f-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-f-base text-white/40">No activity yet</p>
          <p className="text-f-sm text-white/25 mt-1">Start by adding content or cataloging videos</p>
        </div>
      </GlassCard>
    </div>
  )
}