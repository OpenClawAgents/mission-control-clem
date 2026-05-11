import { PageHeader, GlassCard, EmptyState, MetricCard } from '@/components/ds'
import { FileText, Plus, Sparkles, Target, Clapperboard } from 'lucide-react'

export default function ScriptsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scripts"
        subtitle="Viral-ready scripts with hooks, angles, and shot lists"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Script
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Scripts"
          value="0"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Ready to Shoot"
          value="0"
          change="Write your first"
          changeType="neutral"
          icon={<Clapperboard className="h-5 w-5" />}
        />
        <MetricCard
          label="Avg Hook Score"
          value="—"
          change="No data yet"
          changeType="neutral"
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      <GlassCard hover={false}>
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="No scripts yet"
          description="Create viral-ready scripts with hooks, angles, and shot lists. Repurpose from your content library or start fresh."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Write Your First Script
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}