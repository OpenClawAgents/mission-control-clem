import { PageHeader, GlassCard, EmptyState, MetricCard } from '@/components/ds'
import { BookOpen, Plus, FileText, Sparkles, Newspaper, Hash, Mail, PenTool, Share2, Search, Clapperboard } from 'lucide-react'

const contentTypes = [
  { type: 'Newsletter', icon: Mail, desc: 'Email newsletters & bulletins', count: 0 },
  { type: 'Script', icon: PenTool, desc: 'Viral-ready video scripts', count: 0 },
  { type: 'Social Post', icon: Share2, desc: 'Instagram, TikTok, YouTube', count: 0 },
  { type: 'Research', icon: Search, desc: 'Source documents & analysis', count: 0 },
  { type: 'Digest', icon: Newspaper, desc: 'Psychedelic law & church news', count: 0 },
  { type: 'Video Clip', icon: Clapperboard, desc: 'Tagged footage segments', count: 0 },
]

const contentStatuses = [
  { label: 'Draft', color: 'bg-[#F59E0B]/20 text-[#F59E0B]' },
  { label: 'Review', color: 'bg-purple-500/20 text-purple-400' },
  { label: 'Published', color: 'bg-[#22C55E]/20 text-[#22C55E]' },
  { label: 'Archived', color: 'bg-white/10 text-white/50' },
]

export default function ContentPage() {
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
          value="0"
          change="Ready to add"
          changeType="neutral"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricCard
          label="Scripts"
          value="0"
          change="Write your first"
          changeType="neutral"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Repurposed"
          value="0"
          change="From library"
          changeType="neutral"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <MetricCard
          label="Published"
          value="0"
          change="No items yet"
          changeType="neutral"
          icon={<Newspaper className="h-5 w-5" />}
        />
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">Content Types</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contentTypes.map((ct) => {
            const Icon = ct.icon
            return (
              <div key={ct.type} className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-[#F59E0B]/20 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-white/50" />
                  <span className="text-f-base font-medium text-white">{ct.type}</span>
                </div>
                <p className="text-f-xs text-white/40">{ct.desc}</p>
                <p className="text-f-sm text-white/60 mt-2">{ct.count} items</p>
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
              <span className="text-f-base text-white/80">0</span>
            </div>
          ))}
        </div>
      </GlassCard>

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
    </div>
  )
}