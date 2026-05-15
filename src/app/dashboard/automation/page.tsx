import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { Zap, Plus } from 'lucide-react'

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        subtitle="Workflows and automated tasks"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Workflow
          </button>
        }
      />

      <GlassCard hover={false}>
        <EmptyState
          icon={<Zap className="h-12 w-12" />}
          title="No automations yet"
          description="Set up workflows like auto-digest generation, content republishing, and scheduled research checks."
          action={
            <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
              <Plus className="h-4 w-4" />
              Create First Workflow
            </button>
          }
        />
      </GlassCard>
    </div>
  )
}