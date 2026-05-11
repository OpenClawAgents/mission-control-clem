'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, EmptyState, MetricCard } from '@/components/ds'
import { BookOpen, Plus, FileText, Sparkles, Newspaper, Hash, Mail, PenTool, Share2, Search, Clapperboard } from 'lucide-react'
import { getContent, getContentCounts, type ContentItem, type ContentType, type ContentStatus } from '@/lib/api'

const contentTypeConfig: Record<ContentType, { icon: typeof Mail; desc: string }> = {
  newsletter: { icon: Mail, desc: 'Email newsletters & bulletins' },
  script: { icon: PenTool, desc: 'Viral-ready video scripts' },
  social_post: { icon: Share2, desc: 'Instagram, TikTok, YouTube' },
  research: { icon: Search, desc: 'Source documents & analysis' },
  digest: { icon: Newspaper, desc: 'Psychedelic law & church news' },
  video_clip: { icon: Clapperboard, desc: 'Tagged footage segments' },
  draft: { icon: FileText, desc: 'Unfinished work' },
}

const contentStatuses: { label: string; color: string }[] = [
  { label: 'Draft', color: 'bg-[#F59E0B]/20 text-[#F59E0B]' },
  { label: 'Review', color: 'bg-purple-500/20 text-purple-400' },
  { label: 'Published', color: 'bg-[#22C55E]/20 text-[#22C55E]' },
  { label: 'Archived', color: 'bg-white/10 text-white/50' },
]

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [counts, setCounts] = useState<{ type: ContentType; status: ContentStatus }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [contentData, countData] = await Promise.all([getContent(), getContentCounts()])
        setItems(contentData)
        setCounts(countData)
      } catch {
        // Auth or empty table is fine
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalItems = counts.length
  const scriptCount = counts.filter(c => c.type === 'script').length
  const publishedCount = counts.filter(c => c.status === 'published').length

  const countsByType = (type: ContentType) => counts.filter(c => c.type === type).length
  const countsByStatus = (status: string) => counts.filter(c => c.status === status).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Library"
        subtitle="Newsletters, scripts, research, and social assets — always query the library first"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add Content
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Items"
          value={loading ? '...' : String(totalItems)}
          change={totalItems > 0 ? `${publishedCount} published` : 'Ready to add'}
          changeType={totalItems > 0 ? 'positive' : 'neutral'}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricCard
          label="Scripts"
          value={loading ? '...' : String(scriptCount)}
          change={scriptCount > 0 ? 'In library' : 'Write your first'}
          changeType={scriptCount > 0 ? 'positive' : 'neutral'}
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Repurposed"
          value={loading ? '...' : String(countsByStatus('published'))}
          change="From library"
          changeType="neutral"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <MetricCard
          label="Published"
          value={loading ? '...' : String(publishedCount)}
          change={publishedCount > 0 ? 'Live' : 'No items yet'}
          changeType={publishedCount > 0 ? 'positive' : 'neutral'}
          icon={<Newspaper className="h-5 w-5" />}
        />
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">Content Types</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(contentTypeConfig).map(([type, config]) => {
            const Icon = config.icon
            const count = countsByType(type as ContentType)
            return (
              <div key={type} className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-[#F59E0B]/20 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-white/50" />
                  <span className="text-f-base font-medium text-white capitalize">{type.replace('_', ' ')}</span>
                </div>
                <p className="text-f-xs text-white/40">{config.desc}</p>
                <p className="text-f-sm text-white/60 mt-2">{count} items</p>
              </div>
            )
          })}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">By Status</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {contentStatuses.map((cs) => (
            <div key={cs.label} className="flex items-center gap-2 px-4 py-2 rounded-[10px] border border-white/[0.06] bg-white/[0.02]">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-f-xs font-medium ${cs.color}`}>
                {cs.label}
              </span>
              <span className="text-f-base text-white/80">{countsByStatus(cs.label.toLowerCase())}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {items.length > 0 ? (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Recent Items</h3>
          </div>
          <div className="space-y-2">
            {items.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-[10px] border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-f-base text-white/90 font-medium truncate">{item.title}</p>
                  <p className="text-f-xs text-white/40 capitalize">{item.type.replace('_', ' ')}</p>
                </div>
                <span className={`ml-3 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-f-xs font-medium ${
                  item.status === 'published' ? 'bg-[#22C55E]/20 text-[#22C55E]'
                  : item.status === 'review' ? 'bg-purple-500/20 text-purple-400'
                  : item.status === 'archived' ? 'bg-white/10 text-white/50'
                  : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard hover={false}>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No content yet"
            description="Add newsletters, scripts, research docs, and social media assets to your library. Always query the library before generating new content."
            action={
              <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
                <Plus className="h-4 w-4" />
                Add Your First Item
              </button>
            }
          />
        </GlassCard>
      )}
    </div>
  )
}