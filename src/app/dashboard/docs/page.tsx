'use client'

import { useState } from 'react'
import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { Search, Database, Zap, Bot, BookOpen, ChevronRight, Copy, Check } from 'lucide-react'

type DocSection = {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  items: DocItem[]
}

type DocItem = {
  title: string
  content: React.ReactNode
}

function SchemaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-1.5 text-f-sm">
      {children}
    </div>
  )
}

function SchemaRow({ name, type, desc }: { name: string; type: string; desc?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[#F59E0B] shrink-0 font-mono text-f-sm">{name}</span>
      <span className="text-white/40 shrink-0 font-mono text-f-xs mt-0.5">{type}</span>
      {desc && <span className="text-white/70 text-f-sm">— {desc}</span>}
    </div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium border"
      style={{ backgroundColor: `${color}10`, borderColor: `${color}20`, color }}
    >
      {children}
    </span>
  )
}

const sections: DocSection[] = [
  {
    id: 'api',
    title: 'API Endpoints',
    icon: <Zap className="h-4 w-4" />,
    description: 'REST API routes available in Mission Control',
    items: [
      {
        title: 'GET /api/content',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">List all content items with optional filters.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Query Parameters</div>
              <SchemaRow name="type" type="enum" desc="newsletter, script, social_post, research, digest, video_clip, draft" />
              <SchemaRow name="status" type="enum" desc="draft, review, published, archived" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'POST /api/content',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Create a new content item.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Required Fields</div>
              <SchemaRow name="user_id" type="uuid" />
              <SchemaRow name="title" type="text" />
              <SchemaRow name="type" type="enum" desc="Content type" />
              <div className="text-f-xs text-white/40 mt-3 mb-2 font-semibold uppercase tracking-wider">Optional Fields</div>
              <SchemaRow name="status" type="enum" desc="Default: draft" />
              <SchemaRow name="tags" type="text[]" />
              <SchemaRow name="body" type="jsonb" desc="Structured content payload" />
              <SchemaRow name="source_url" type="text" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'GET /api/videos',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">List all videos with metadata.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Query Parameters</div>
              <SchemaRow name="search" type="text" desc="Full-text search on title and transcript" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'GET /api/digests',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">List all digests, ordered by date descending.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Query Parameters</div>
              <SchemaRow name="category" type="enum" desc="psychedelic_law, church, dea, state_reform, other" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'GET /api/search',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Semantic search across the digital library. Falls back to text matching when embeddings aren&apos;t available.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Query Parameters</div>
              <SchemaRow name="q" type="text" desc="Search query (required)" />
              <SchemaRow name="limit" type="integer" desc="Max results (default: 20)" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'GET /api/growth',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Growth metrics for social platforms.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Query Parameters</div>
              <SchemaRow name="platform" type="text" desc="instagram, tiktok, youtube" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'GET /api/trending',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Trending scans from social platforms.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Query Parameters</div>
              <SchemaRow name="scan_type" type="text" desc="sound, hashtag, challenge" />
              <SchemaRow name="platform" type="text" desc="instagram, tiktok, youtube" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'GET /api/cron',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">List all Gateway cron jobs with run history.</p>
            <SchemaBlock>
              <div className="text-f-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">POST Actions</div>
              <SchemaRow name="action=create" type="POST" desc="Create a new cron job" />
              <SchemaRow name="action=toggle" type="POST" desc="Enable/disable a job" />
              <SchemaRow name="action=run" type="POST" desc="Trigger a job immediately" />
            </SchemaBlock>
          </div>
        ),
      },
    ],
  },
  {
    id: 'data',
    title: 'Data Models',
    icon: <Database className="h-4 w-4" />,
    description: 'Supabase table schemas and type definitions',
    items: [
      {
        title: 'content',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Primary content store. Supports multiple types and pipeline stages.</p>
            <SchemaBlock>
              <SchemaRow name="id" type="uuid" desc="Primary key" />
              <SchemaRow name="user_id" type="uuid" desc="Owner reference" />
              <SchemaRow name="title" type="text" desc="Display title" />
              <SchemaRow name="slug" type="text" desc="URL-safe identifier" />
              <SchemaRow name="type" type="enum" desc="newsletter | script | social_post | research | digest | video_clip | draft" />
              <SchemaRow name="status" type="enum" desc="draft | review | published | archived" />
              <SchemaRow name="body" type="jsonb" desc="Structured content payload" />
              <SchemaRow name="tags" type="text[]" desc="Category tags" />
              <SchemaRow name="source_url" type="text" desc="Original source link" />
              <SchemaRow name="pipeline_stage" type="enum" desc="idea → script → filming → editing → scheduled → published → tracking" />
              <SchemaRow name="repurpose_type" type="enum" desc="reel_script | carousel | caption | newsletter_repurpose | long_form" />
              <SchemaRow name="created_at" type="timestamptz" />
              <SchemaRow name="updated_at" type="timestamptz" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'videos',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Video catalog with transcripts and metadata.</p>
            <SchemaBlock>
              <SchemaRow name="id" type="uuid" />
              <SchemaRow name="user_id" type="uuid" />
              <SchemaRow name="title" type="text" />
              <SchemaRow name="file_path" type="text" desc="Storage path" />
              <SchemaRow name="duration_seconds" type="integer" />
              <SchemaRow name="resolution" type="text" desc='e.g. "1920x1080"' />
              <SchemaRow name="tags" type="text[]" />
              <SchemaRow name="transcript" type="text" desc="Full transcription" />
              <SchemaRow name="metadata" type="jsonb" desc="Technical metadata" />
              <SchemaRow name="created_at" type="timestamptz" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'digests',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Daily research digests compiled by the Research Scout agent.</p>
            <SchemaBlock>
              <SchemaRow name="id" type="uuid" />
              <SchemaRow name="user_id" type="uuid" />
              <SchemaRow name="title" type="text" />
              <SchemaRow name="date" type="date" />
              <SchemaRow name="category" type="enum" desc="psychedelic_law | church | dea | state_reform | other" />
              <SchemaRow name="summary" type="text" />
              <SchemaRow name="source_url" type="text" />
              <SchemaRow name="source_name" type="text" />
              <SchemaRow name="is_sent" type="boolean" />
              <SchemaRow name="created_at" type="timestamptz" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'growth_metrics',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Platform growth data tracked over time.</p>
            <SchemaBlock>
              <SchemaRow name="id" type="uuid" />
              <SchemaRow name="platform" type="text" desc="instagram | tiktok | youtube" />
              <SchemaRow name="followers" type="integer" />
              <SchemaRow name="followers_gained" type="integer" />
              <SchemaRow name="impressions" type="integer" />
              <SchemaRow name="reach" type="integer" />
              <SchemaRow name="engagement_rate" type="float" desc="0–1 scale" />
              <SchemaRow name="posts_count" type="integer" />
              <SchemaRow name="recorded_at" type="timestamptz" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'trending_scans',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Trending items captured by the scanner agent.</p>
            <SchemaBlock>
              <SchemaRow name="id" type="uuid" />
              <SchemaRow name="platform" type="text" />
              <SchemaRow name="scan_type" type="text" desc="sound | hashtag | challenge" />
              <SchemaRow name="items" type="jsonb[]" desc="Trending items with name, view_count, trend_score, url" />
              <SchemaRow name="notes" type="text" />
              <SchemaRow name="source_url" type="text" />
              <SchemaRow name="scan_date" type="timestamptz" />
            </SchemaBlock>
          </div>
        ),
      },
    ],
  },
  {
    id: 'skills',
    title: 'Skills & Pipelines',
    icon: <Bot className="h-4 w-4" />,
    description: 'Agent skill definitions and their pipeline stages',
    items: [
      {
        title: 'Content Strategist',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="#F59E0B">Content</Badge>
              <Badge color="#22C55E">Active</Badge>
            </div>
            <p className="text-f-sm text-white/70">Plans content calendar, repurposes newsletters into social assets, manages publishing queue.</p>
            <SchemaBlock>
              <div className="text-f-xs text-[#3B82F6] font-semibold uppercase tracking-wider mb-2">Input</div>
              <div className="text-f-sm text-white/80">Newsletter content, research notes, trending topics</div>
              <div className="text-f-xs text-white/40 font-semibold uppercase tracking-wider mt-3 mb-2">Steps</div>
              <div className="text-f-sm text-white/70">Analyze audience &amp; timing → Generate content calendar → Create repurposed assets</div>
              <div className="text-f-xs text-[#22C55E] font-semibold uppercase tracking-wider mt-3 mb-2">Output</div>
              <div className="text-f-sm text-white/80">Calendar entries, social posts, reel scripts</div>
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'Script Writer',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="#F59E0B">Content</Badge>
              <Badge color="#22C55E">Active</Badge>
            </div>
            <p className="text-f-sm text-white/70">Produces viral-ready scripts with hooks, angles, and shot lists from research material.</p>
            <SchemaBlock>
              <div className="text-f-xs text-[#3B82F6] font-semibold uppercase tracking-wider mb-2">Input</div>
              <div className="text-f-sm text-white/80">Research topic, angle brief, target platform</div>
              <div className="text-f-xs text-white/40 font-semibold uppercase tracking-wider mt-3 mb-2">Steps</div>
              <div className="text-f-sm text-white/70">Research &amp; fact-check → Draft hook + angle → Write script with CTA</div>
              <div className="text-f-xs text-[#22C55E] font-semibold uppercase tracking-wider mt-3 mb-2">Output</div>
              <div className="text-f-sm text-white/80">Script with hook, body, CTA, estimated duration</div>
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'Research Scout',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="#A855F7">Research</Badge>
              <Badge color="#22C55E">Active</Badge>
            </div>
            <p className="text-f-sm text-white/70">Monitors psychedelic law, DEA scheduling, church rulings, and state reform sources.</p>
            <SchemaBlock>
              <div className="text-f-xs text-[#3B82F6] font-semibold uppercase tracking-wider mb-2">Input</div>
              <div className="text-f-sm text-white/80">RSS feeds, law databases, DEA updates, church filings</div>
              <div className="text-f-xs text-white/40 font-semibold uppercase tracking-wider mt-3 mb-2">Steps</div>
              <div className="text-f-sm text-white/70">Scan sources for new developments → Classify by category &amp; urgency → Compile digest entries</div>
              <div className="text-f-xs text-[#22C55E] font-semibold uppercase tracking-wider mt-3 mb-2">Output</div>
              <div className="text-f-sm text-white/80">Digest entries with source links and summaries</div>
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'Digest Compiler',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="#A855F7">Research</Badge>
              <Badge color="#22C55E">Active</Badge>
            </div>
            <p className="text-f-sm text-white/70">Assembles daily digests from research sources, RSS feeds, and law trackers.</p>
            <SchemaBlock>
              <div className="text-f-xs text-[#3B82F6] font-semibold uppercase tracking-wider mb-2">Input</div>
              <div className="text-f-sm text-white/80">Raw digest entries from Research Scout</div>
              <div className="text-f-xs text-white/40 font-semibold uppercase tracking-wider mt-3 mb-2">Steps</div>
              <div className="text-f-sm text-white/70">De-duplicate &amp; prioritize → Write summaries → Format for delivery channels</div>
              <div className="text-f-xs text-[#22C55E] font-semibold uppercase tracking-wider mt-3 mb-2">Output</div>
              <div className="text-f-sm text-white/80">Formatted daily digest ready for distribution</div>
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'Video Cataloger',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="#22C55E">Operations</Badge>
              <Badge color="#6B7280">Disabled</Badge>
            </div>
            <p className="text-f-sm text-white/70">Tags and indexes raw footage from /Volumes/ClemVideo/RawFootage with metadata for fast retrieval.</p>
            <SchemaBlock>
              <div className="text-f-xs text-[#3B82F6] font-semibold uppercase tracking-wider mb-2">Input</div>
              <div className="text-f-sm text-white/80">New video files in RawFootage directory</div>
              <div className="text-f-xs text-white/40 font-semibold uppercase tracking-wider mt-3 mb-2">Steps</div>
              <div className="text-f-sm text-white/70">Extract duration, resolution, codec → Generate transcript via Whisper → Auto-tag with content labels</div>
              <div className="text-f-xs text-[#22C55E] font-semibold uppercase tracking-wider mt-3 mb-2">Output</div>
              <div className="text-f-sm text-white/80">Indexed video record in Supabase</div>
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'System Health Check',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="#3B82F6">Automation</Badge>
              <Badge color="#22C55E">Active</Badge>
            </div>
            <p className="text-f-sm text-white/70">Monitors Supabase status, API health, and deployment uptime for Mission Control.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'System design and infrastructure reference',
    items: [
      {
        title: 'Tech Stack',
        content: (
          <div className="space-y-3">
            <SchemaBlock>
              <SchemaRow name="Frontend" type="" desc="Next.js 16 + React + Tailwind CSS" />
              <SchemaRow name="Database" type="" desc="Supabase (PostgreSQL + pgvector)" />
              <SchemaRow name="Hosting" type="" desc="Vercel (serverless functions)" />
              <SchemaRow name="Agent" type="" desc="OpenClaw (Clem) + Gateway cron" />
              <SchemaRow name="Search" type="" desc="PostgreSQL full-text + pgvector semantic" />
              <SchemaRow name="Video Storage" type="" desc="/Volumes/ClemVideo/RawFootage" />
              <SchemaRow name="Library" type="" desc="/Volumes/ClemDocs/Library" />
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'Pipeline Stages',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Content moves through these stages in the pipeline board:</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Idea', color: '#F59E0B' },
                { label: 'Script', color: '#A855F7' },
                { label: 'Filming', color: '#3B82F6' },
                { label: 'Editing', color: '#6366F1' },
                { label: 'Scheduled', color: '#06B6D4' },
                { label: 'Published', color: '#22C55E' },
                { label: 'Tracking', color: '#64748B' },
              ].map((stage, i) => (
                <span
                  key={stage.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-f-sm font-medium border"
                  style={{ backgroundColor: `${stage.color}10`, borderColor: `${stage.color}20`, color: stage.color }}
                >
                  {stage.label}
                  {i < 6 && <span className="text-white/30 text-f-xs">→</span>}
                </span>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: 'Cron Jobs',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Automated jobs running on the Gateway:</p>
            <SchemaBlock>
              <div className="space-y-3">
                <div>
                  <div className="text-f-sm text-white/90 font-medium">Daily Psychedelic Law Digest</div>
                  <div className="text-f-sm text-white/50">Compiles latest law &amp; policy changes</div>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div>
                  <div className="text-f-sm text-white/90 font-medium">Daily Content Idea Generator</div>
                  <div className="text-f-sm text-white/50">Generates content ideas from trends &amp; library</div>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div>
                  <div className="text-f-sm text-white/90 font-medium">Trending Scanner</div>
                  <div className="text-f-sm text-white/50">Scans platforms for trending sounds &amp; hashtags</div>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div>
                  <div className="text-f-sm text-white/90 font-medium">Weekly Growth Metrics</div>
                  <div className="text-f-sm text-white/50">Reminds to log and review growth data</div>
                </div>
              </div>
            </SchemaBlock>
          </div>
        ),
      },
      {
        title: 'Supabase Connection',
        content: (
          <div className="space-y-3">
            <p className="text-f-sm text-white/70">Mission Control connects to Supabase using the client-side SDK with anon key authentication.</p>
            <SchemaBlock>
              <SchemaRow name="URL" type="" desc="https://lmboomcjvrohibzqbmaw.supabase.co" />
              <SchemaRow name="Schema" type="" desc="public (content, videos, digests, growth_metrics, trending_scans)" />
              <SchemaRow name="RLS" type="" desc="Enabled on all tables" />
            </SchemaBlock>
            <p className="text-f-xs text-white/40">Row-level security ensures each user can only access their own data. The anon key is safe for client-side use with RLS policies in place.</p>
          </div>
        ),
      },
    ],
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="shrink-0 h-6 w-6 rounded-[6px] flex items-center justify-center bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-[#22C55E]" /> : <Copy className="h-3 w-3 text-white/40" />}
    </button>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeData = sections.find(s => s.id === activeSection)!

  // Search across all sections
  const allFiltered = searchQuery
    ? sections.flatMap(s =>
        s.items
          .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(item => ({ ...item, sectionId: s.id, sectionTitle: s.title }))
      )
    : []

  const sectionNav = (
    <div className="flex gap-2 flex-wrap lg:flex-col lg:flex-nowrap">
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => { setActiveSection(section.id); setExpandedItem(null) }}
          className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-f-sm font-medium transition-all text-left ${
            activeSection === section.id
              ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          {section.icon}
          {section.title}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        subtitle="API reference, data models, and system architecture"
      />

      {/* Search */}
      <GlassCard>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/[0.06] text-f-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all"
          />
        </div>
      </GlassCard>

      {searchQuery && allFiltered.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Search />}
            title="No results"
            description={`No docs matching "${searchQuery}"`}
          />
        </GlassCard>
      ) : searchQuery ? (
        /* Search results — flat list across all sections */
        <div className="space-y-3">
          {allFiltered.map((item) => {
            const section = sections.find(s => s.id === item.sectionId)!
            const isExpanded = expandedItem === `${item.sectionId}-${item.title}`
            return (
              <GlassCard key={`${item.sectionId}-${item.title}`}>
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setExpandedItem(isExpanded ? null : `${item.sectionId}-${item.title}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-[8px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50">
                      {section.icon}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-f-base text-white/90 font-medium">{item.title}</div>
                      <div className="text-f-xs text-white/40">{section.title}</div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-white/30 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    {item.content}
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      ) : (
        /* Normal view — sidebar + content */
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <div className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-6">
              {sectionNav}
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden">
            {sectionNav}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-f-lg font-semibold text-white">{activeData.title}</h2>
              <p className="text-f-sm text-white/50 mt-1">{activeData.description}</p>
            </div>

            <div className="space-y-3">
              {activeData.items.map((item) => {
                const isExpanded = expandedItem === item.title
                return (
                  <GlassCard key={item.title}>
                    <button
                      className="w-full flex items-center justify-between"
                      onClick={() => setExpandedItem(isExpanded ? null : item.title)}
                    >
                      <span className="text-f-base text-white/90 font-medium">{item.title}</span>
                      <ChevronRight className={`h-4 w-4 text-white/30 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        {item.content}
                      </div>
                    )}
                  </GlassCard>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}