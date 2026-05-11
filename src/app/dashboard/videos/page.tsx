import { PageHeader, GlassCard, EmptyState, MetricCard } from '@/components/ds'
import { Video, Plus, HardDrive, Clock, Tag } from 'lucide-react'

export default function VideosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Catalog"
        subtitle="Raw footage, clips, and metadata — searchable beats scrollable"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Catalog Video
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Videos"
          value="0"
          icon={<Video className="h-5 w-5" />}
        />
        <MetricCard
          label="Total Duration"
          value="0m"
          change="Catalog ready"
          changeType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          label="Tagged"
          value="0"
          change="Add tags for search"
          changeType="neutral"
          icon={<Tag className="h-5 w-5" />}
        />
        <MetricCard
          label="Storage"
          value="—"
          change="Not connected"
          changeType="neutral"
          icon={<HardDrive className="h-5 w-5" />}
        />
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">Storage Paths</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Raw Footage', path: '/Volumes/ClemVideo/RawFootage', status: 'Not mounted' },
            { label: 'Catalog Database', path: '~/Library/video_catalog.db', status: 'SQLite' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div>
                <span className="text-f-base text-white/90 font-medium">{item.label}</span>
                <code className="block text-f-xs text-[#F59E0B]/70 mt-0.5">{item.path}</code>
              </div>
              <span className="text-f-xs text-white/40">{item.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <EmptyState
          icon={<Video className="h-12 w-12" />}
          title="No videos cataloged"
          description="Tag clips from /Volumes/ClemVideo/RawFootage with metadata for fast search and retrieval. Searchable beats scrollable."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Catalog Your First Video
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}