import { PageHeader, GlassCard, StatusDot, MetricCard, SectionHeader } from '@/components/ds'
import { SKILL_DEFINITIONS, CATEGORY_CONFIG, getSkillCounts, type SkillMeta, type SkillCategory } from '@/lib/api/skills'
import { Activity, Clock, Cpu, Pause } from 'lucide-react'

const categoryIcons: Record<SkillCategory, string> = {
  content: '✍️',
  research: '🔬',
  operations: '⚙️',
  automation: '🤖',
}

function SkillCard({ skill }: { skill: SkillMeta }) {
  const cat = CATEGORY_CONFIG[skill.category]
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-[10px] flex items-center justify-center border"
            style={{
              backgroundColor: `${cat.color}10`,
              borderColor: `${cat.color}20`,
            }}
          >
            <span className="text-base">{categoryIcons[skill.category]}</span>
          </div>
          <div>
            <h3 className="text-f-base font-semibold text-white">{skill.name}</h3>
            <span className="flex items-center gap-1.5 text-f-xs">
              <StatusDot
                status={skill.status === 'active' ? 'online' : 'idle'}
                size="sm"
              />
              <span className={skill.status === 'active' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                {skill.status === 'active' ? 'Active' : 'Disabled'}
              </span>
            </span>
          </div>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium border"
          style={{
            backgroundColor: `${cat.color}10`,
            borderColor: `${cat.color}20`,
            color: cat.color,
          }}
        >
          {cat.label}
        </span>
      </div>

      <p className="text-f-sm text-white/60 mb-3">{skill.description}</p>

      <div className="flex items-center gap-4 text-f-xs text-white/40">
        {skill.cronSchedule ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {skill.cronSchedule}
          </span>
        ) : null}
        {skill.agents.length > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            {skill.agents.join(', ')}
          </span>
        ) : null}
      </div>
    </GlassCard>
  )
}

export default function SkillsPage() {
  const counts = getSkillCounts(SKILL_DEFINITIONS)

  const byCategory = (cat: SkillCategory) => SKILL_DEFINITIONS.filter(s => s.category === cat)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        subtitle="Clem's skill registry — content, research, operations, and automation"
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Total Skills"
          value={counts.total}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Active"
          value={counts.active}
          change={`${counts.active} running`}
          changeType="positive"
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Disabled"
          value={counts.disabled}
          icon={<Pause className="h-5 w-5" />}
        />
        <MetricCard
          label="On Schedule"
          value={counts.withCron}
          change="cron jobs"
          changeType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {byCategory('content').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Content" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('content').map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </div>
      )}

      {byCategory('research').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Research" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('research').map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </div>
      )}

      {byCategory('operations').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Operations" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('operations').map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </div>
      )}

      {byCategory('automation').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Automation" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('automation').map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </div>
      )}
    </div>
  )
}