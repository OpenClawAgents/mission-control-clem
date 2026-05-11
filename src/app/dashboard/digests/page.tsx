import { PageHeader, GlassCard, EmptyState, MetricCard, StatusDot } from '@/components/ds'
import { Newspaper, Plus, Scale, Church, Shield, Map } from 'lucide-react'

const categories = [
  { key: 'psychedelic_law', label: 'Psychedelic Law', icon: Scale, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { key: 'church', label: 'Church of Singularism', icon: Church, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { key: 'dea', label: 'DEA Scheduling', icon: Shield, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { key: 'state_reform', label: 'State Reform', icon: Map, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
]

const keyBeats = [
  'Bicycle Day',
  'Church of Singularism rulings',
  'DEA scheduling changes',
  'State-level reform (CO, OR, CA)',
  'FDA breakthrough therapy designations',
  'International policy shifts',
]

export default function DigestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Digests"
        subtitle="Psychedelic law, church news, and policy updates — fresh before stale"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Digest
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Digests"
          value="0"
          icon={<Newspaper className="h-5 w-5" />}
        />
        <MetricCard
          label="Psychedelic Law"
          value="0"
          change="Starting soon"
          changeType="neutral"
          icon={<Scale className="h-5 w-5" />}
        />
        <MetricCard
          label="Church"
          value="0"
          change="Starting soon"
          changeType="neutral"
          icon={<Church className="h-5 w-5" />}
        />
        <MetricCard
          label="DEA"
          value="0"
          change="Starting soon"
          changeType="neutral"
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <StatusDot status="idle" />
          <h3 className="text-f-lg font-semibold text-white">Categories</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <div key={cat.key} className="rounded-[10px] border p-4 hover:scale-[1.02] transition-transform cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-[10px] ${cat.color} border mb-3`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-f-base font-medium text-white">{cat.label}</h4>
                <p className="text-f-xs text-white/40 mt-1">0 digests</p>
              </div>
            )
          })}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Map className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">Key Beats to Track</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {keyBeats.map((beat) => (
            <span key={beat} className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-f-sm text-white/60 hover:text-white/80 hover:border-[#F59E0B]/20 transition-all cursor-pointer">
              {beat}
            </span>
          ))}
        </div>
        <p className="text-f-xs text-white/30 mt-3">RSS feeds and source URLs configured in TOOLS.md</p>
      </GlassCard>

      <GlassCard hover={false}>
        <EmptyState
          icon={<Newspaper className="h-12 w-12" />}
          title="No digests yet"
          description="Track DEA scheduling changes, Church of Singularism rulings, state-level reform, and more. Fresh digest before stale summary."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Create First Digest
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}