import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { Calendar, Plus } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Content scheduling and upcoming deadlines"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Schedule Content
          </button>
        }
      />

      <GlassCard hover={false}>
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No scheduled content"
          description="Plan your content calendar — schedule scripts, digests, and social posts."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Schedule Your First Post
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}