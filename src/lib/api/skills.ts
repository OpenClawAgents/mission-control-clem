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
 * Clem's Mission Control skills.
 * Maps to real OpenClaw agent skills + automated workflows.
 */
export const SKILLS: SkillMeta[] = [
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    description: 'Plans content calendar, repurposes newsletters into social assets, manages publishing queue',
    status: 'active',
    cronSchedule: '0 9 * * 1',
    cronName: 'content-weekly-plan',
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
    cronSchedule: '0 8 * * *',
    cronName: 'research-daily-scan',
    agents: ['research-scout'],
    category: 'research',
  },
  {
    id: 'digest-compiler',
    name: 'Digest Compiler',
    description: 'Assembles daily digests from research sources, RSS feeds, and law trackers',
    status: 'active',
    cronSchedule: '0 7 * * *',
    cronName: 'digest-daily',
    agents: ['digest-compiler'],
    category: 'research',
  },
  {
    id: 'law-tracker',
    name: 'Law & Policy Tracker',
    description: 'Tracks DEA scheduling changes, FDA designations, and state-level psychedelic reform bills',
    status: 'active',
    cronSchedule: '0 */6 * * *',
    cronName: 'law-tracker-check',
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
    cronSchedule: '0 */4 * * *',
    cronName: 'system-health-check',
    agents: ['clem'],
    category: 'automation',
  },
  {
    id: 'backup-nightly',
    name: 'Nightly Backup',
    description: 'Backs up content, digests, and video metadata from Supabase nightly',
    status: 'active',
    cronSchedule: '0 2 * * *',
    cronName: 'backup-nightly',
    agents: ['clem'],
    category: 'automation',
  },
]

export function getSkillCounts() {
  const active = SKILLS.filter(s => s.status === 'active').length
  const disabled = SKILLS.filter(s => s.status === 'disabled').length
  const total = SKILLS.length
  const withCron = SKILLS.filter(s => s.cronSchedule).length
  return { active, disabled, total, withCron }
}