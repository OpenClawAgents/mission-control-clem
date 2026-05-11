import { PageHeader, GlassCard, StatusDot } from '@/components/ds'
import { Bot } from 'lucide-react'

const agents = [
  {
    name: 'Content Strategist',
    desc: 'Plans content calendar, repurposes newsletters into social assets',
    status: 'online' as const,
    skills: ['repurpose', 'calendar', 'scheduling'],
  },
  {
    name: 'Research Scout',
    desc: 'Monitors psychedelic law, DEA scheduling, church rulings, state reform',
    status: 'online' as const,
    skills: ['rss-monitor', 'source-verify', 'law-tracking'],
  },
  {
    name: 'Script Writer',
    desc: 'Produces viral-ready scripts with hooks, angles, and shot lists',
    status: 'online' as const,
    skills: ['hooks', 'angles', 'shot-lists'],
  },
  {
    name: 'Digest Compiler',
    desc: 'Assembles daily digests from research sources and RSS feeds',
    status: 'idle' as const,
    skills: ['summarize', 'categorize', 'format'],
  },
]

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        subtitle="Clem's production squad — coordinating content, research, and scripting"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => (
          <GlassCard key={agent.name} className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center ${
                  agent.status === 'online'
                    ? 'bg-[#22C55E]/10 border border-[#22C55E]/20'
                    : 'bg-[#F59E0B]/10 border border-[#F59E0B]/20'
                }`}>
                  <Bot className={`h-4 w-4 ${
                    agent.status === 'online' ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                  }`} />
                </div>
                <div>
                  <h3 className="text-f-base font-semibold text-white">{agent.name}</h3>
                  <span className="flex items-center gap-1.5 text-f-xs">
                    <StatusDot status={agent.status} size="sm" />
                    <span className={agent.status === 'online' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                      {agent.status === 'online' ? 'Online' : 'Idle'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-f-sm text-white/60 mb-3">{agent.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-f-2xs text-white/50">
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}