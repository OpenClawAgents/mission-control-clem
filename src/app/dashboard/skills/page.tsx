'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard } from '@/components/ds'
import { Sparkles, Plus } from 'lucide-react'
import {
  SKILL_DEFINITIONS,
  CATEGORY_CONFIG,
  getSkillCounts,
  mergeCronData,
  type SkillMeta,
  type SkillCategory,
} from '@/lib/api/skills'
import type { CronJob } from '@/lib/api/skills'

const categoryIcons: Record<SkillCategory, string> = {
  content: '✍️',
  research: '🔍',
  operations: '⚙️',
  automation: '🤖',
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillMeta[]>(SKILL_DEFINITIONS)
  const counts = getSkillCounts(skills)

  useEffect(() => {
    async function loadCron() {
      try {
        const res = await fetch('/api/cron')
        if (!res.ok) return
        const jobs: CronJob[] = await res.json()
        setSkills(mergeCronData(SKILL_DEFINITIONS, jobs))
      } catch {
        // Keep static definitions if API unavailable
      }
    }
    loadCron()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        subtitle="Agent capabilities and scheduled tasks"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active"
          value={String(counts.active)}
          change={`${counts.total} total`}
          changeType="positive"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <MetricCard
          label="Disabled"
          value={String(counts.disabled)}
          change="Paused"
          changeType="neutral"
        />
        <MetricCard
          label="On Schedule"
          value={String(counts.withCron)}
          change="Cron jobs"
          changeType="neutral"
        />
        <MetricCard
          label="Categories"
          value="4"
          change="All covered"
          changeType="neutral"
        />
      </div>

      {(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat)
        const config = CATEGORY_CONFIG[cat]
        return (
          <GlassCard key={cat}>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-f-lg">{categoryIcons[cat]}</span>
              <h3 className="text-f-lg font-semibold text-white">{config.label}</h3>
              <span className="ml-auto text-f-xs text-white/40">{catSkills.length} skills</span>
            </div>
            <div className="space-y-3">
              {catSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between py-2 border-t border-white/[0.04]"
                >
                  <div className="min-w-0">
                    <div className="text-f-base text-white/80">{skill.name}</div>
                    <div className="text-f-sm text-white/40 truncate">{skill.description}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {skill.cronSchedule && (
                      <span className="text-f-xs text-white/30 font-mono">{skill.cronSchedule}</span>
                    )}
                    <StatusDot
                      status={skill.status === 'active' ? 'online' : skill.status === 'error' ? 'offline' : 'idle'}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}