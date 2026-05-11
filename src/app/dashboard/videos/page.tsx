import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { Video, Plus } from 'lucide-react'

export default function VideosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Catalog"
        subtitle="Raw footage, clips, and metadata"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#FF2DA0]/15 text-white hover:bg-[#FF2DA0]/25 border border-[#FF2DA0]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Catalog Video
          </button>
        }
      />

      <GlassCard hover={false}>
        <EmptyState
          icon={<Video className="h-12 w-12" />}
          title="No videos cataloged"
          description="Tag clips from /Volumes/ClemVideo/RawFootage with metadata for fast search and retrieval."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#FF2DA0]/15 text-white hover:bg-[#FF2DA0]/25 border border-[#FF2DA0]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Catalog Your First Video
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}