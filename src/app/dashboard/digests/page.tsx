'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, EmptyState, MetricCard, StatusDot } from '@/components/ds'
import { Newspaper, Plus, ExternalLink, Calendar, Tag } from 'lucide-react'
import { getDigests, type Digest, type DigestCategory } from '@/lib/api'

const categoryConfig: Record<DigestCategory, { label: string; color: string }> = {
  psychedelic_law: { label: 'Psychedelic Law', color: '#A855F7' },
  church: { label: 'Church', color: '#3B82F6' },
  dea: { label: 'DEA', color: '#EF4444' },
  state_reform: { label: 'State Reform', color: '#22C55E' },
  other: { label: 'Other', color: '#6B7280' },
}

export default function DigestsPage() {
  const [digests, setDigests] = useState<Digest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<DigestCategory | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getDigests(activeCategory ? { category: activeCategory } : undefined)
        setDigests(data)
      } catch {
        // Table may be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeCategory])

  const todayCount = digests.filter((d) => d.date === new Date().toISOString().split('T')[0]).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digests"
        subtitle="Psychedelic law, church news, and policy updates"
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
          value={loading ? '...' : String(digests.length)}
          change={todayCount > 0 ? `${todayCount} today` : 'No new today'}
          changeType={todayCount > 0 ? 'positive' : 'neutral'}
          icon={<Newspaper className="h-5 w-5" />}
        />
        {(Object.entries(categoryConfig) as [DigestCategory, typeof categoryConfig[DigestCategory]][]).map(
          ([cat, config]) => {
            const count = digests.filter((d) => d.category === cat).length
            return (
              <MetricCard
                key={cat}
                label={config.label}
                value={String(count)}
                change={count > 0 ? 'items' : 'None yet'}
                changeType="neutral"
              />
            )
          }
        ).slice(0, 3)}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
            !activeCategory
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
          }`}
        >
          All
        </button>
        {(Object.entries(categoryConfig) as [DigestCategory, typeof categoryConfig[DigestCategory]][]).map(
          ([cat, config]) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'border'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.06]'
              }`}
              style={
                activeCategory === cat
                  ? { backgroundColor: `${config.color}15`, borderColor: `${config.color}30`, color: config.color }
                  : {}
              }
            >
              {config.label}
            </button>
          )
        )}
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Newspaper className="h-5 w-5 text-white/20 animate-pulse" />
          </div>
        </GlassCard>
      ) : digests.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Newspaper className="h-12 w-12" />}
            title="No digests yet"
            description="Track DEA scheduling changes, state-level reform, Church of Singularism rulings, and more."
            action={
              <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
                <Plus className="h-4 w-4" />
                Create First Digest
              </button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {digests.map((digest) => {
            const config = categoryConfig[digest.category] || categoryConfig.other
            return (
              <GlassCard key={digest.id} className="relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium border"
                        style={{
                          backgroundColor: `${config.color}10`,
                          borderColor: `${config.color}20`,
                          color: config.color,
                        }}
                      >
                        {config.label}
                      </span>
                      {digest.is_sent && (
                        <span className="inline-flex items-center gap-1 text-f-2xs text-[#22C55E]">
                          <StatusDot status="online" size="sm" />
                          Sent
                        </span>
                      )}
                    </div>
                    <h3 className="text-f-base font-semibold text-white/90">{digest.title}</h3>
                    <p className="text-f-sm text-white/50 mt-1 line-clamp-2">{digest.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-f-xs text-white/30">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(digest.date).toLocaleDateString()}
                      </span>
                      {digest.source_name && (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {digest.source_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {digest.source_url && (
                    <a
                      href={digest.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 h-8 w-8 rounded-[8px] flex items-center justify-center bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                    </a>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}