export type SkillStatus = 'active' | 'disabled' | 'error'

export type SkillCategory = 'content' | 'research' | 'operations' | 'automation'

export interface SkillMeta {
  id: string
  name: string
  description: string
  status: SkillStatus
  cronSchedule: string | null
  cronName: string | null
  agents: string[]
  category: SkillCategory
}

export const CATEGORY_CONFIG: Record<SkillCategory, { label: string; color: string }> = {
  content: { label: 'Content', color: '#F59E0B' },
  research: { label: 'Research', color: '#A855F7' },
  operations: { label: 'Operations', color: '#22C55E' },
  automation: { label: 'Automation', color: '#3B82F6' },
}

/**
 * Skill definitions — the static metadata (name, description, category)
 * that can't be inferred from cron jobs alone.
 *
 * Status and cron schedule will be overridden by live data when available.
 */
export const SKILL_DEFINITIONS: SkillMeta[] = [
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    description: 'Plans content calendar, repurposes newsletters into social assets, manages publishing queue',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['content-strategist'],
    category: 'content',
  },
  {
    id: 'script-writer',
    name: 'Script Writer',
    description: 'Produces viral-ready scripts with hooks, angles, and shot lists from research material',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['script-writer'],
    category: 'content',
  },
  {
    id: 'social-publisher',
    name: 'Social Publisher',
    description: 'Schedules and publishes content across platforms with optimized timing',
    status: 'disabled',
    cronSchedule: null,
    cronName: null,
    agents: ['content-strategist'],
    category: 'content',
  },
  {
    id: 'research-scout',
    name: 'Research Scout',
    description: 'Monitors psychedelic law, DEA scheduling, church rulings, and state reform sources',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['research-scout'],
    category: 'research',
  },
  {
    id: 'digest-compiler',
    name: 'Digest Compiler',
    description: 'Assembles daily digests from research sources, RSS feeds, and law trackers',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['digest-compiler'],
    category: 'research',
  },
  {
    id: 'law-tracker',
    name: 'Law & Policy Tracker',
    description: 'Tracks DEA scheduling changes, FDA designations, and state-level psychedelic reform bills',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['research-scout'],
    category: 'research',
  },
  {
    id: 'video-catalog',
    name: 'Video Cataloger',
    description: 'Tags and indexes raw footage from /Volumes/ClemVideo/RawFootage with metadata for fast retrieval',
    status: 'disabled',
    cronSchedule: null,
    cronName: null,
    agents: ['video-cataloger'],
    category: 'operations',
  },
  {
    id: 'library-indexer',
    name: 'Library Indexer',
    description: 'Indexes and updates the digital library at /Volumes/ClemDocs/Library for search and repurposing',
    status: 'disabled',
    cronSchedule: null,
    cronName: null,
    agents: ['content-strategist'],
    category: 'operations',
  },
  {
    id: 'system-health',
    name: 'System Health Check',
    description: 'Monitors Supabase status, API health, and deployment uptime for Mission Control',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['clem'],
    category: 'automation',
  },
  {
    id: 'backup-nightly',
    name: 'Nightly Backup',
    description: 'Backs up content, digests, and video metadata from Supabase nightly',
    status: 'active',
    cronSchedule: null,
    cronName: null,
    agents: ['clem'],
    category: 'automation',
  },
]

/**
 * Merge live cron data into skill definitions.
 * Matches by name (cron job name contains the skill id keywords).
 */
export function mergeCronData(skills: SkillMeta[], cronJobs: CronJob[]): SkillMeta[] {
  return skills.map(skill => {
    // Try to find a matching cron job by name or id
    const cron = cronJobs.find(j =>
      j.name?.toLowerCase().includes(skill.id.replace(/-/g, '')) ||
      j.name?.toLowerCase().includes(skill.id.replace(/-/g, ' ')) ||
      j.id.toLowerCase().includes(skill.id.replace(/-/g, ''))
    )

    if (!cron) return skill

    return {
      ...skill,
      status: cron.enabled ? 'active' : 'disabled',
      cronSchedule: cron.schedule?.expr || cron.schedule?.everyMs ? formatSchedule(cron.schedule) : null,
      cronName: cron.name || null,
    }
  })
}

export interface CronJob {
  id: string
  name?: string
  description?: string
  enabled: boolean
  schedule: {
    kind: string
    expr?: string
    everyMs?: number
    at?: string
    [key: string]: unknown
  }
  payload: {
    kind: string
    text?: string
    message?: string
    [key: string]: unknown
  }
  delivery?: {
    mode: string
    [key: string]: unknown
  }
  sessionTarget?: string
  lastRunAt?: number
  nextRunAt?: number
}

function formatSchedule(schedule: CronJob['schedule']): string | null {
  if (schedule.kind === 'cron' && schedule.expr) return schedule.expr
  if (schedule.kind === 'every' && schedule.everyMs) {
    const min = Math.round(schedule.everyMs / 60000)
    if (min >= 60) return `every ${Math.round(min / 60)}h`
    return `every ${min}m`
  }
  if (schedule.kind === 'at' && schedule.at) return `at ${schedule.at}`
  return null
}

export function getSkillCounts(skills: SkillMeta[]) {
  const active = skills.filter(s => s.status === 'active').length
  const disabled = skills.filter(s => s.status === 'disabled').length
  const total = skills.length
  const withCron = skills.filter(s => s.cronSchedule).length
  return { active, disabled, total, withCron }
}