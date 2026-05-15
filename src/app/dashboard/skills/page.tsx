'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard, SectionHeader } from '@/components/ds'
import { SKILL_DEFINITIONS, CATEGORY_CONFIG, mergeCronData, getSkillCounts, type SkillMeta, type SkillCategory, type CronJob } from '@/lib/api/skills'
import { Activity, Clock, Cpu, Pause, ChevronDown, ChevronUp, Edit3, ArrowRight, ArrowDown, Play, X } from 'lucide-react'

const categoryIcons: Record<SkillCategory, string> = {
  content: '✍️',
  research: '🔬',
  operations: '⚙️',
  automation: '🤖',
}

// Skill detail view showing the input→steps→output pipeline
function SkillDetail({ skill, onClose }: { skill: SkillMeta; onClose: () => void }) {
  // These would come from a skill definition file in production
  const pipelineTemplates: Record<string, { input: string; steps: string[]; output: string }> = {
    'content-strategist': {
      input: 'Newsletter from archive (or topic prompt)',
      steps: [
        'Pull newsletter from digital library',
        'Extract key themes and arguments',
        'Generate 5 reel scripts with hooks',
        'Generate 5 carousel posts with CTA',
        'Generate 5 short-form captions',
        'Tag by theme for content calendar sequencing',
      ],
      output: '15 platform-ready assets (5 reels + 5 carousels + 5 captions)',
    },
    'script-writer': {
      input: 'Content idea or topic prompt',
      steps: [
        'Analyze topic against trending patterns',
        'Generate 10 hook variants',
        'Generate 10 elevator pitch variants',
        'Generate 10 angle options for body',
        'Suggest CTA based on platform',
        'Generate shot list with recommended angles',
        'Estimate runtime (target: sub-90s for reels)',
      ],
      output: 'Complete script with hooks, angles, shot list, and estimated runtime',
    },
    'research-scout': {
      input: 'Scheduled scan (6 AM + 9 AM CT)',
      steps: [
        'Scan psychedelic law sources (Bicycle Day, MAPS, EROWID)',
        'Check DEA scheduling updates',
        'Monitor church/state court rulings (RFRA cases)',
        'Track state-level reform bills',
        'Cross-reference with digital library for context',
        'Rank by relevance and content potential',
      ],
      output: 'Curated feed of 10-20 items with summaries and source links',
    },
    'digest-compiler': {
      input: 'Research scout output + daily schedule',
      steps: [
        'Collect top 5-10 items from research scout',
        'Write 2-3 sentence summary per item',
        'Add recommended content angle per item',
        'Assign category tags',
        'Format for email delivery',
        'Post to Mission Control dashboard',
      ],
      output: 'Daily digest with summaries, angles, and source links',
    },
    'video-catalog': {
      input: 'New file in /Volumes/ClemVideo/RawFootage',
      steps: [
        'Detect new file via filesystem watcher',
        'Extract metadata (duration, resolution, date)',
        'Auto-tag by visual content (altar, group, individual, location)',
        'Tag by metadata (source phone, file type)',
        'Index in video catalog database',
        'Make searchable via natural language',
      ],
      output: 'Cataloged video entry with tags, metadata, and search index',
    },
    'library-indexer': {
      input: 'Content file (newsletter, research, blog post)',
      steps: [
        'Ingest text content from file',
        'Chunk into semantic segments',
        'Generate embeddings via vector model',
        'Store in pgvector for semantic search',
        'Apply topic tags (autism, church, psychedelic law, etc.)',
        'Cross-link to related library entries',
      ],
      output: 'Indexed and searchable library entry with embeddings',
    },
    'law-tracker': {
      input: 'Scheduled scan of legal databases',
      steps: [
        'Check DEA Federal Register updates',
        'Monitor FDA breakthrough therapy designations',
        'Track state-level psychedelic reform bills',
        'Watch for church/religious exemption rulings',
        'Flag items matching Clem\'s content angles',
      ],
      output: 'Prioritized list of legal/policy changes with content angles',
    },
    'social-publisher': {
      input: 'Approved content asset',
      steps: [
        'Receive approved content from pipeline',
        'Optimize posting time for target platform',
        'Schedule post via platform API',
        'Track initial engagement metrics',
        'Feed performance data back to content strategist',
      ],
      output: 'Scheduled and tracked social media post',
    },
    'system-health': {
      input: 'Scheduled health check (every 30m)',
      steps: [
        'Ping Supabase health endpoint',
        'Check Gateway uptime',
        'Verify API route availability',
        'Check disk space on Mac Mini',
        'Report anomalies to Clem',
      ],
      output: 'Health status report + alerts for failures',
    },
    'backup-nightly': {
      input: 'Scheduled trigger (2 AM CT)',
      steps: [
        'Export content table to JSON',
        'Export digests table to JSON',
        'Export video metadata to JSON',
        'Compress and timestamp backup',
        'Store in /Volumes/ClemDocs/Backups/',
      ],
      output: 'Timestamped backup archive',
    },
  }

  const pipeline = pipelineTemplates[skill.id] || {
    input: 'Input data or trigger',
    steps: ['Process through skill pipeline'],
    output: 'Structured output',
  }

  return (
    <GlassCard hover={false} className="relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-8 w-8 rounded-[8px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all"
      >
        <X className="h-4 w-4 text-white/60" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="h-12 w-12 rounded-[12px] flex items-center justify-center border text-xl"
          style={{
            backgroundColor: `${CATEGORY_CONFIG[skill.category].color}10`,
            borderColor: `${CATEGORY_CONFIG[skill.category].color}20`,
          }}
        >
          {categoryIcons[skill.category]}
        </div>
        <div>
          <h2 className="text-f-lg font-semibold text-white">{skill.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusDot status={skill.status === 'active' ? 'online' : 'idle'} size="sm" />
            <span className={`text-f-sm ${skill.status === 'active' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
              {skill.status === 'active' ? 'Active' : 'Disabled'}
            </span>
            {skill.cronSchedule && (
              <span className="text-f-xs text-white/40">· {skill.cronSchedule}</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-f-base text-white/60 mb-6">{skill.description}</p>

      {/* Pipeline visualization */}
      <div className="space-y-3">
        <div className="text-f-sm font-semibold text-white/80 uppercase tracking-wider">Pipeline</div>

        {/* Input */}
        <div className="rounded-[12px] bg-[#3B82F6]/5 border border-[#3B82F6]/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-[6px] bg-[#3B82F6]/20 flex items-center justify-center">
              <ArrowDown className="h-3 w-3 text-[#3B82F6]" />
            </div>
            <span className="text-f-xs font-semibold text-[#3B82F6] uppercase tracking-wider">Input</span>
          </div>
          <p className="text-f-sm text-white/80 ml-8">{pipeline.input}</p>
        </div>

        {/* Steps */}
        <div className="space-y-2 ml-4">
          {pipeline.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-f-2xs font-bold text-[#F59E0B]">
                  {i + 1}
                </div>
                {i < pipeline.steps.length - 1 && (
                  <div className="w-px h-3 bg-white/[0.06]" />
                )}
              </div>
              <p className="text-f-sm text-white/70 pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="rounded-[12px] bg-[#22C55E]/5 border border-[#22C55E]/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-[6px] bg-[#22C55E]/20 flex items-center justify-center">
              <ArrowRight className="h-3 w-3 text-[#22C55E]" />
            </div>
            <span className="text-f-xs font-semibold text-[#22C55E] uppercase tracking-wider">Output</span>
          </div>
          <p className="text-f-sm text-white/80 ml-8">{pipeline.output}</p>
        </div>
      </div>

      {/* Agents */}
      {skill.agents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="text-f-xs text-white/40 mb-2">Assigned Agents</div>
          <div className="flex gap-2">
            {skill.agents.map((agent) => (
              <span
                key={agent}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white/[0.04] border border-white/[0.06] text-f-sm text-white/70"
              >
                <Cpu className="h-3 w-3" />
                {agent}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

function SkillCard({ skill, onClick }: { skill: SkillMeta; onClick: () => void }) {
  const cat = CATEGORY_CONFIG[skill.category]
  return (
    <div onClick={onClick} className="cursor-pointer">
    <GlassCard className="group" hover={true}>
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
            <h3 className="text-f-base font-semibold text-white group-hover:text-[#F59E0B] transition-colors">{skill.name}</h3>
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
        <Edit3 className="h-3.5 w-3.5 text-white/20 group-hover:text-[#F59E0B] transition-colors" />
      </div>
    </GlassCard>
    </div>
  )
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillMeta[]>(SKILL_DEFINITIONS)
  const [selectedSkill, setSelectedSkill] = useState<SkillMeta | null>(null)

  useEffect(() => {
    async function loadCronData() {
      try {
        const res = await fetch('/api/cron')
        if (res.ok) {
          const data = await res.json()
          const cronJobs: CronJob[] = data.jobs ?? []
          setSkills(mergeCronData(SKILL_DEFINITIONS, cronJobs))
        }
      } catch {
        // Gateway may be unreachable
      }
    }
    loadCronData()
  }, [])

  const counts = getSkillCounts(skills)
  const byCategory = (cat: SkillCategory) => skills.filter(s => s.category === cat)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        subtitle="Clem's skill registry — input → steps → output pipelines"
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Total Skills"
          value={counts.total}
          icon={<Activity />}
        />
        <MetricCard
          label="Active"
          value={counts.active}
          change={`${counts.active} running`}
          changeType="positive"
          icon={<Play />}
        />
        <MetricCard
          label="Disabled"
          value={counts.disabled}
          icon={<Pause />}
        />
        <MetricCard
          label="On Schedule"
          value={counts.withCron}
          change="cron jobs"
          changeType="neutral"
          icon={<Clock />}
        />
      </div>

      {selectedSkill ? (
        <SkillDetail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      ) : null}

      {byCategory('content').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Content" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('content').map(skill => <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />)}
          </div>
        </div>
      )}

      {byCategory('research').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Research" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('research').map(skill => <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />)}
          </div>
        </div>
      )}

      {byCategory('operations').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Operations" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('operations').map(skill => <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />)}
          </div>
        </div>
      )}

      {byCategory('automation').length > 0 && (
        <div className="space-y-3">
          <SectionHeader title="Automation" />
          <div className="grid gap-4 md:grid-cols-2">
            {byCategory('automation').map(skill => <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />)}
          </div>
        </div>
      )}
    </div>
  )
}