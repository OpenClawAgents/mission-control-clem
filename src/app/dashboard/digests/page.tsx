import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { Newspaper, Plus } from 'lucide-react'

export default function DigestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Digests"
        subtitle="Psychedelic law, church news, and policy updates"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#FF2DA0]/15 text-white hover:bg-[#FF2DA0]/25 border border-[#FF2DA0]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Digest
          </button>
        }
      />

      <GlassCard hover={false}>
        <EmptyState
          icon={<Newspaper className="h-12 w-12" />}
          title="No digests yet"
          description="Track DEA scheduling changes, state-level reform, Church of Singularism rulings, and more."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#FF2DA0]/15 text-white hover:bg-[#FF2DA0]/25 border border-[#FF2DA0]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Create First Digest
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}