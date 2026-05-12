'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader, GlassCard, EmptyState, MetricCard, StatusDot } from '@/components/ds'
import { Newspaper, Plus, Scale, Church, Shield, MapPin } from 'lucide-react'
import { getDigests, getDigestCounts, createDigest, type Digest, type DigestCategory } from '@/lib/api'
import { getCurrentUserId } from '@/lib/api/auth'
import { DigestForm } from '@/components/forms/digest-form'

const categoryConfig: Record<DigestCategory, { icon: typeof Scale; label: string; color: string }> = {
  psychedelic_law: { icon: Scale, label: 'Psychedelic Law', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  church: { icon: Church, label: 'Church of Singularism', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  dea: { icon: Shield, label: 'DEA Scheduling', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  state_reform: { icon: MapPin, label: 'State Reform', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  other: { icon: Newspaper, label: 'Other', color: 'text-white/60 bg-white/[0.04] border-white/[0.06]' },
}

const keyBeats = [
  'Bicycle Day',
  'Church of Singularism rulings',
  'DEA scheduling changes',
  'State-level reform (CO, OR, CA)',
  'FDA breakthrough therapy designations',
  'International policy shifts',
]

export default function DigestsPage() {
  const [digests, setDigests] = useState<Digest[]>([])
  const [counts, setCounts] = useState<{ category: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadData = async () => {
    try {
      const [digestData, countData] = await Promise.all([getDigests(), getDigestCounts()])
      setDigests(digestData)
      setCounts(countData)
    } catch {
      // Auth or empty table is fine
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const catCount = (cat: string) => counts.filter(c => c.category === cat).length

  const handleCreate = async (data: {
    title: string
    date: string
    category: DigestCategory
    summary: string
    source_url: string
    source_name: string
  }) => {
    const userId = await getCurrentUserId()

    await createDigest({
      user_id: userId,
      title: data.title,
      date: data.date,
      category: data.category,
      summary: data.summary,
      source_url: data.source_url || null,
      source_name: data.source_name || null,
    })
    toast.success('Digest created')
    await loadData()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digests"
        subtitle="Psychedelic law, church news, and policy updates — fresh before stale"
        action={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Digest
          </button>
        }
      />

      <DigestForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Digests" value={loading ? '...' : String(digests.length)} icon={<Newspaper className="h-5 w-5" />} />
        <MetricCard label="Psychedelic Law" value={loading ? '...' : String(catCount('psychedelic_law'))} change={catCount('psychedelic_law') > 0 ? 'Tracked' : 'Starting soon'} changeType={catCount('psychedelic_law') > 0 ? 'positive' : 'neutral'} icon={<Scale className="h-5 w-5" />} />
        <MetricCard label="Church" value={loading ? '...' : String(catCount('church'))} change={catCount('church') > 0 ? 'Tracked' : 'Starting soon'} changeType={catCount('church') > 0 ? 'positive' : 'neutral'} icon={<Church className="h-5 w-5" />} />
        <MetricCard label="DEA" value={loading ? '...' : String(catCount('dea'))} change={catCount('dea') > 0 ? 'Tracked' : 'Starting soon'} changeType={catCount('dea') > 0 ? 'positive' : 'neutral'} icon={<Shield className="h-5 w-5" />} />
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <StatusDot status="idle" />
          <h3 className="text-f-lg font-semibold text-white">Categories</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.entries(categoryConfig) as [DigestCategory, typeof categoryConfig[DigestCategory]][]).map(([key, cat]) => {
            const Icon = cat.icon
            return (
              <div key={key} className="rounded-[10px] border border-white/[0.06] p-4 hover:scale-[1.02] transition-transform cursor-pointer">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-[10px] ${cat.color} border mb-3`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-f-base font-medium text-white">{cat.label}</h4>
                <p className="text-f-xs text-white/40 mt-1">{catCount(key)} digests</p>
              </div>
            )
          })}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-[#F59E0B]" />
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

      {digests.length > 0 ? (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Recent Digests</h3>
          </div>
          <div className="space-y-2">
            {digests.slice(0, 10).map((digest) => {
              const cat = categoryConfig[digest.category as DigestCategory]
              return (
                <div key={digest.id} className="flex items-center justify-between py-3 px-4 rounded-[10px] border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                  <div className="min-w-0 flex-1">
                    <p className="text-f-base text-white/90 font-medium truncate">{digest.title}</p>
                    <p className="text-f-xs text-white/40 mt-0.5">{new Date(digest.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`ml-3 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-f-xs font-medium ${cat?.color || 'bg-white/10 text-white/50'}`}>
                    {cat?.label || digest.category}
                  </span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      ) : (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Newspaper className="h-12 w-12" />}
            title="No digests yet"
            description="Track DEA scheduling changes, Church of Singularism rulings, state-level reform, and more. Fresh digest before stale summary."
            action={
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
                <Plus className="h-4 w-4" />
                Create First Digest
              </button>
            }
          />
        </GlassCard>
      )}
    </div>
  )
}