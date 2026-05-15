'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, MetricCard, StatusDot, SectionHeader } from '@/components/ds'
import { BookOpen, Search, Tag, FileText, Newspaper, Mail, Video, PenTool, Share2, Upload, Filter, Sparkles } from 'lucide-react'
import { getContent, type ContentItem, type ContentType, type ContentStatus } from '@/lib/api'

const typeConfig: Record<ContentType, { icon: typeof BookOpen; label: string; color: string }> = {
  newsletter: { icon: Mail, label: 'Newsletter', color: '#F59E0B' },
  script: { icon: PenTool, label: 'Script', color: '#A855F7' },
  social_post: { icon: Share2, label: 'Social Post', color: '#3B82F6' },
  research: { icon: Search, label: 'Research', color: '#22C55E' },
  digest: { icon: Newspaper, label: 'Digest', color: '#EF4444' },
  video_clip: { icon: Video, label: 'Video Clip', color: '#EC4899' },
  draft: { icon: FileText, label: 'Draft', color: '#6B7280' },
}

const statusColors: Record<ContentStatus, string> = {
  draft: 'bg-white/10 text-white/60',
  review: 'bg-purple-500/20 text-purple-400',
  published: 'bg-[#22C55E]/20 text-[#22C55E]',
  archived: 'bg-white/5 text-white/30',
}

const topicTags = [
  'Autism & Neurodivergence',
  'Psychedelic Law',
  'Church & Religion',
  'Trust Law',
  'Community Building',
  'Oracle Research',
  'Psychedelic Medicine',
  'Content Strategy',
]

export default function LibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState<ContentType | null>(null)
  const [activeStatus, setActiveStatus] = useState<ContentStatus | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getContent()
        setItems(data)
      } catch {
        // Table may be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = items.filter((item) => {
    if (activeType && item.type !== activeType) return false
    if (activeStatus && item.status !== activeStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})

  const publishedCount = items.filter((i) => i.status === 'published').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Library"
        subtitle="Your knowledge nucleus — newsletters, research, scripts, and more"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Upload className="h-4 w-4" />
            Import
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Items"
          value={loading ? '...' : String(items.length)}
          change={items.length > 0 ? `${publishedCount} published` : 'Start importing'}
          changeType={publishedCount > 0 ? 'positive' : 'neutral'}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricCard
          label="Newsletters"
          value={String(typeCounts['newsletter'] || 0)}
          change="Repurpose ready"
          changeType="neutral"
          icon={<Mail className="h-5 w-5" />}
        />
        <MetricCard
          label="Research"
          value={String(typeCounts['research'] || 0)}
          change="Source material"
          changeType="neutral"
          icon={<Search className="h-5 w-5" />}
        />
        <MetricCard
          label="Scripts"
          value={String(typeCounts['script'] || 0)}
          change="Video ready"
          changeType="neutral"
          icon={<PenTool className="h-5 w-5" />}
        />
      </div>

      {/* Search + Filters */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by title, tag, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/[0.06] text-f-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveStatus(null)}
              className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
                !activeStatus ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              All
            </button>
            {(['draft', 'review', 'published'] as ContentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(activeStatus === s ? null : s)}
                className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all capitalize ${
                  activeStatus === s
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                    : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(Object.entries(typeConfig) as [ContentType, typeof typeConfig[ContentType]][]).map(([type, config]) => {
            const Icon = config.icon
            const count = typeCounts[type] || 0
            return (
              <button
                key={type}
                onClick={() => setActiveType(activeType === type ? null : type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
                  activeType === type
                    ? 'border'
                    : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.06]'
                }`}
                style={activeType === type ? { backgroundColor: `${config.color}15`, borderColor: `${config.color}30`, color: config.color } : {}}
              >
                <Icon className="h-3 w-3" />
                {config.label}
                {count > 0 && <span className="ml-0.5 opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>

        {/* Items list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Sparkles className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-f-lg font-semibold text-white/80">
              {items.length === 0 ? 'Your library is empty' : 'No matching items'}
            </h3>
            <p className="mt-2 text-f-base text-white/50 max-w-md">
              {items.length === 0
                ? 'Import newsletters, research, scripts, and more to build your knowledge nucleus.'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const config = typeConfig[item.type] || typeConfig.draft
              const Icon = config.icon
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3 px-3 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition-all group cursor-pointer"
                >
                  <div
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${config.color}10`, borderColor: `${config.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-f-base text-white/90 font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-f-xs text-white/40">{config.label}</span>
                      {item.tags && item.tags.length > 0 && (
                        <span className="text-f-xs text-white/25">
                          {item.tags.slice(0, 3).join(' · ')}
                          {item.tags.length > 3 && ` +${item.tags.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                    <span className="text-f-xs text-white/25 group-hover:text-white/40 transition-colors">→</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Topic Tags */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-white/40" />
          <h3 className="text-f-lg font-semibold text-white">Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topicTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag.split(' ')[0].toLowerCase())}
              className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-f-sm text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}