import { PageHeader, GlassCard, EmptyState, StatusDot } from '@/components/ds'
import { Bot, Plus } from 'lucide-react'

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        subtitle="Active sessions and agent status"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            New Session
          </button>
        }
      />

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <StatusDot status="online" />
          <h3 className="text-f-lg font-semibold text-white">Active Agents</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Clem', kind: 'Main Session', status: 'Online' },
            { name: 'Digest Worker', kind: 'Isolated', status: 'Idle' },
            { name: 'Skill Runner', kind: 'Isolated', status: 'Idle' },
          ].map((agent) => (
            <div key={agent.name} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-3">
                <Bot className="h-4 w-4 text-white/40" />
                <div>
                  <span className="text-f-base text-white/80">{agent.name}</span>
                  <span className="ml-2 text-f-xs text-white/40">{agent.kind}</span>
                </div>
              </div>
              <span className="flex items-center gap-2 text-f-sm text-[#22C55E]">
                <StatusDot status={agent.status === 'Online' ? 'online' : 'idle'} size="sm" />
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <EmptyState
          icon={<Bot className="h-12 w-12" />}
          title="No live sessions"
          description="Agent sessions will appear here when active."
        />
      </GlassCard>
    </div>
  )
}