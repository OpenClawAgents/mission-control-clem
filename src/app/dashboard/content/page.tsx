import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { BookOpen, Plus } from 'lucide-react'

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Library"
        subtitle="Newsletters, scripts, research, and social assets"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add Content
          </button>
        }
      />

      <GlassCard hover={false}>
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No content yet"
          description="Add newsletters, scripts, research docs, and social media assets to your library."
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