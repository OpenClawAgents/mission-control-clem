'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard, SectionHeader, EmptyState } from '@/components/ds'
import { SKILL_DEFINITIONS, CATEGORY_CONFIG, getSkillCounts, mergeCronData, type SkillCategory, type SkillMeta, type CronJob } from '@/lib/api/skills'
import { Cpu, Clock, Activity, Pause, Zap, Loader2 } from 'lucide-react'

const categoryIcons: Record<SkillCategory, string> = {
  content: '✍️',
  research: '🔬',
  operations: '⚙️',
  automation: '🤖',
}

function SkillCard({ skill, onRun }: { skill: SkillMeta; onRun?: (id: string) => void }) {
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

      <div className="flex items-center justify-between">
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
        {skill.cronSchedule && onRun && (
          <button
            onClick={() => onRun(skill.id)}
            className="inline-flex items-center gap-1 rounded-[8px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-1 text-f-2xs text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-all"
          >
            <Zap className="h-3 w-3" />
            Run now
          </button>
        )}
      </div>
    </GlassCard>
  )
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillMeta[]>(SKILL_DEFINITIONS)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cron')
        if (res.ok) {
          const data = await res.json()
          const jobs: CronJob[] = data.jobs ?? []
          setCronJobs(jobs)
          setSkills(mergeCronData(SKILL_DEFINITIONS, jobs))
        }
      } catch {
        // Fallback to static definitions
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const counts = getSkillCounts(skills)
  const byCategory = (cat: SkillCategory) => skills.filter(s => s.category === cat)

  async function handleRunNow(skillId: string) {
    const skill = skills.find(s => s.id === skillId)
    if (!skill?.cronName) return

    setRunning(skillId)
    try {
      const cronJob = cronJobs.find(j => j.name === skill.cronName || j.id === skill.cronName)
      if (!cronJob) return

      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', jobId: cronJob.id }),
      })
    } catch {
      // Silently fail
    } finally {
      setRunning(null)
    }
  }

  const categories: SkillCategory[] = ['content', 'research', 'operations', 'automation']

  function renderCategories() {
    return categories.map((cat) => {
      const catSkills = byCategory(cat)
      if (catSkills.length === 0) return null
      return (
        <div key={cat} className="space-y-3">
          <SectionHeader title={CATEGORY_CONFIG[cat].label} />
          <div className="grid gap-4 md:grid-cols-2">
            {catSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onRun={handleRunNow} />
            ))}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        subtitle="Clem's skill registry — powered by OpenClaw cron jobs and agents"
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Total Skills"
          value={loading ? '...' : String(counts.total)}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Active"
          value={loading ? '...' : String(counts.active)}
          change={counts.active > 0 ? `${counts.active} running` : 'None active'}
          changeType={counts.active > 0 ? 'positive' : 'neutral'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Disabled"
          value={loading ? '...' : String(counts.disabled)}
          icon={<Pause className="h-5 w-5" />}
        />
        <MetricCard
          label="On Schedule"
          value={loading ? '...' : String(counts.withCron)}
          change="cron jobs"
          changeType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 text-[#F59E0B] animate-spin mb-3" />
          <p className="text-f-base text-white/40">Loading skills from Gateway...</p>
        </div>
      )}

      {!loading && skills.length === 0 && (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Activity className="h-12 w-12" />}
            title="No skills found"
            description="Skills are defined in Mission Control and synced with OpenClaw cron jobs."
          />
        </GlassCard>
      )}

      {!loading && skills.length > 0 && renderCategories()}

      {cronJobs.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">All Cron Jobs</h3>
            <span className="text-f-xs text-white/40 ml-2">{cronJobs.length} total</span>
          </div>
          <div className="space-y-2">
            {cronJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <div className="min-w-0">
                  <span className="text-f-base text-white/90 font-medium">{job.name || job.id}</span>
                  <p className="text-f-xs text-white/40 truncate">
                    {job.schedule?.kind === 'cron' ? job.schedule.expr
                      : job.schedule?.kind === 'every' ? `every ${Math.round((job.schedule.everyMs || 0) / 60000)}m`
                      : job.schedule?.kind === 'at' ? String(job.schedule.at)
                      : 'manual'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <StatusDot status={job.enabled ? 'online' : 'idle'} size="sm" />
                  <span className={`text-f-xs ${job.enabled ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
                    {job.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}