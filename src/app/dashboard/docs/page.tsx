'use client'

import { useState } from 'react'
import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { ScrollText, Search, Database, Zap, Bot, BookOpen, ChevronRight, ExternalLink, Copy, Check } from 'lucide-react'

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
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">List all content items with optional filters.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Query Parameters</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">type</span> — Filter by content type (newsletter, script, social_post, research, digest, video_clip, draft)</div>
                <div><span className="text-[#F59E0B]">status</span> — Filter by status (draft, review, published, archived)</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'POST /api/content',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Create a new content item.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Required Body</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">user_id</span> — UUID string</div>
                <div><span className="text-[#F59E0B]">title</span> — Content title</div>
                <div><span className="text-[#F59E0B]">type</span> — Content type enum</div>
                <div><span className="text-white/40">status</span> — Default: draft</div>
                <div><span className="text-white/40">tags</span> — String array</div>
                <div><span className="text-white/40">body</span> — JSON object</div>
                <div><span className="text-white/40">source_url</span> — Optional URL</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'GET /api/videos',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">List all videos with metadata.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Query Parameters</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">search</span> — Full-text search on title and transcript</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'GET /api/digests',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">List all digests, ordered by date descending.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Query Parameters</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">category</span> — psychedelic_law, church, dea, state_reform, other</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'GET /api/search',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Semantic search across the digital library. Falls back to text matching when embeddings aren&apos;t available.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Query Parameters</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">q</span> — Search query (required)</div>
                <div><span className="text-[#F59E0B]">limit</span> — Max results (default: 20)</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'GET /api/growth',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Growth metrics for social platforms.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Query Parameters</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">platform</span> — instagram, tiktok, youtube</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'GET /api/trending',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Trending scans from social platforms.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Query Parameters</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">scan_type</span> — sound, hashtag, challenge</div>
                <div><span className="text-[#F59E0B]">platform</span> — instagram, tiktok, youtube</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'GET /api/cron',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">List all Gateway cron jobs with run history.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80">
              <div className="text-f-xs text-white/40 mb-1">Actions</div>
              <div className="space-y-1 text-f-sm">
                <div><span className="text-[#F59E0B]">POST action=create</span> — Create a new cron job</div>
                <div><span className="text-[#22C55E]">POST action=toggle</span> — Enable/disable a job</div>
                <div><span className="text-[#3B82F6]">POST action=run</span> — Trigger a job immediately</div>
              </div>
            </div>
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
          <div className="space-y-2">
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div><span className="text-[#F59E0B]">id</span> <span className="text-white/40">uuid</span> — Primary key</div>
              <div><span className="text-[#F59E0B]">user_id</span> <span className="text-white/40">uuid</span> — Owner reference</div>
              <div><span className="text-[#F59E0B]">title</span> <span className="text-white/40">text</span> — Display title</div>
              <div><span className="text-[#F59E0B]">slug</span> <span className="text-white/40">text</span> — URL-safe identifier</div>
              <div><span className="text-[#F59E0B]">type</span> <span className="text-white/40">enum</span> — newsletter | script | social_post | research | digest | video_clip | draft</div>
              <div><span className="text-[#F59E0B]">status</span> <span className="text-white/40">enum</span> — draft | review | published | archived</div>
              <div><span className="text-[#F59E0B]">body</span> <span className="text-white/40">jsonb</span> — Structured content payload</div>
              <div><span className="text-[#F59E0B]">tags</span> <span className="text-white/40">text[]</span> — Category tags</div>
              <div><span className="text-[#F59E0B]">source_url</span> <span className="text-white/40">text</span> — Original source link</div>
              <div><span className="text-[#F59E0B]">pipeline_stage</span> <span className="text-white/40">enum</span> — idea → script → filming → editing → scheduled → published → tracking</div>
              <div><span className="text-[#F59E0B]">repurpose_type</span> <span className="text-white/40">enum</span> — reel_script | carousel | caption | newsletter_repurpose | long_form</div>
            </div>
          </div>
        ),
      },
      {
        title: 'videos',
        content: (
          <div className="space-y-2">
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div><span className="text-[#F59E0B]">id</span> <span className="text-white/40">uuid</span></div>
              <div><span className="text-[#F59E0B]">user_id</span> <span className="text-white/40">uuid</span></div>
              <div><span className="text-[#F59E0B]">title</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">file_path</span> <span className="text-white/40">text</span> — Storage path</div>
              <div><span className="text-[#F59E0B]">duration_seconds</span> <span className="text-white/40">integer</span></div>
              <div><span className="text-[#F59E0B]">resolution</span> <span className="text-white/40">text</span> — e.g. &quot;1920x1080&quot;</div>
              <div><span className="text-[#F59E0B]">tags</span> <span className="text-white/40">text[]</span></div>
              <div><span className="text-[#F59E0B]">transcript</span> <span className="text-white/40">text</span> — Full transcription</div>
              <div><span className="text-[#F59E0B]">metadata</span> <span className="text-white/40">jsonb</span> — Technical metadata</div>
            </div>
          </div>
        ),
      },
      {
        title: 'digests',
        content: (
          <div className="space-y-2">
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div><span className="text-[#F59E0B]">id</span> <span className="text-white/40">uuid</span></div>
              <div><span className="text-[#F59E0B]">user_id</span> <span className="text-white/40">uuid</span></div>
              <div><span className="text-[#F59E0B]">title</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">date</span> <span className="text-white/40">date</span></div>
              <div><span className="text-[#F59E0B]">category</span> <span className="text-white/40">enum</span> — psychedelic_law | church | dea | state_reform | other</div>
              <div><span className="text-[#F59E0B]">summary</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">source_url</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">source_name</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">is_sent</span> <span className="text-white/40">boolean</span></div>
            </div>
          </div>
        ),
      },
      {
        title: 'growth_metrics',
        content: (
          <div className="space-y-2">
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div><span className="text-[#F59E0B]">id</span> <span className="text-white/40">uuid</span></div>
              <div><span className="text-[#F59E0B]">platform</span> <span className="text-white/40">text</span> — instagram | tiktok | youtube</div>
              <div><span className="text-[#F59E0B]">followers</span> <span className="text-white/40">integer</span></div>
              <div><span className="text-[#F59E0B]">followers_gained</span> <span className="text-white/40">integer</span></div>
              <div><span className="text-[#F59E0B]">impressions</span> <span className="text-white/40">integer</span></div>
              <div><span className="text-[#F59E0B]">reach</span> <span className="text-white/40">integer</span></div>
              <div><span className="text-[#F59E0B]">engagement_rate</span> <span className="text-white/40">float</span> — 0-1 scale</div>
              <div><span className="text-[#F59E0B]">posts_count</span> <span className="text-white/40">integer</span></div>
              <div><span className="text-[#F59E0B]">recorded_at</span> <span className="text-white/40">timestamptz</span></div>
            </div>
          </div>
        ),
      },
      {
        title: 'trending_scans',
        content: (
          <div className="space-y-2">
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div><span className="text-[#F59E0B]">id</span> <span className="text-white/40">uuid</span></div>
              <div><span className="text-[#F59E0B]">platform</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">scan_type</span> <span className="text-white/40">text</span> — sound | hashtag | challenge</div>
              <div><span className="text-[#F59E0B]">items</span> <span className="text-white/40">jsonb[]</span> — Trending items with name, view_count, trend_score, url</div>
              <div><span className="text-[#F59E0B]">notes</span> <span className="text-white/40">text</span></div>
              <div><span className="text-[#F59E0B]">source_url</span> <span className="text-white/40">text</span></div>
            </div>
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">Content</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">Active</span>
            </div>
            <p className="text-f-sm text-white/60">Plans content calendar, repurposes newsletters into social assets, manages publishing queue.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div className="text-f-xs text-white/40 mb-1">Pipeline</div>
              <div className="text-f-sm"><span className="text-[#3B82F6]">Input:</span> Newsletter content, research notes, trending topics</div>
              <div className="text-f-sm"><span className="text-white/40">→ Analyze audience & timing</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Generate content calendar</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Create repurposed assets</span></div>
              <div className="text-f-sm"><span className="text-[#22C55E]">Output:</span> Calendar entries, social posts, reel scripts</div>
            </div>
          </div>
        ),
      },
      {
        title: 'Script Writer',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">Content</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">Active</span>
            </div>
            <p className="text-f-sm text-white/60">Produces viral-ready scripts with hooks, angles, and shot lists from research material.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div className="text-f-xs text-white/40 mb-1">Pipeline</div>
              <div className="text-f-sm"><span className="text-[#3B82F6]">Input:</span> Research topic, angle brief, target platform</div>
              <div className="text-f-sm"><span className="text-white/40">→ Research &amp; fact-check</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Draft hook + angle</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Write script with CTA</span></div>
              <div className="text-f-sm"><span className="text-[#22C55E]">Output:</span> Script with hook, body, CTA, estimated duration</div>
            </div>
          </div>
        ),
      },
      {
        title: 'Research Scout',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7]">Research</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">Active</span>
            </div>
            <p className="text-f-sm text-white/60">Monitors psychedelic law, DEA scheduling, church rulings, and state reform sources.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div className="text-f-xs text-white/40 mb-1">Pipeline</div>
              <div className="text-f-sm"><span className="text-[#3B82F6]">Input:</span> RSS feeds, law databases, DEA updates, church filings</div>
              <div className="text-f-sm"><span className="text-white/40">→ Scan sources for new developments</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Classify by category &amp; urgency</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Compile digest entries</span></div>
              <div className="text-f-sm"><span className="text-[#22C55E]">Output:</span> Digest entries with source links and summaries</div>
            </div>
          </div>
        ),
      },
      {
        title: 'Digest Compiler',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7]">Research</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">Active</span>
            </div>
            <p className="text-f-sm text-white/60">Assembles daily digests from research sources, RSS feeds, and law trackers.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div className="text-f-xs text-white/40 mb-1">Pipeline</div>
              <div className="text-f-sm"><span className="text-[#3B82F6]">Input:</span> Raw digest entries from Research Scout</div>
              <div className="text-f-sm"><span className="text-white/40">→ De-duplicate &amp; prioritize</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Write summaries</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Format for delivery channels</span></div>
              <div className="text-f-sm"><span className="text-[#22C55E]">Output:</span> Formatted daily digest ready for distribution</div>
            </div>
          </div>
        ),
      },
      {
        title: 'Video Cataloger',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">Operations</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-white/[0.06] border border-white/[0.08] text-white/40">Disabled</span>
            </div>
            <p className="text-f-sm text-white/60">Tags and indexes raw footage from /Volumes/ClemVideo/RawFootage with metadata for fast retrieval.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div className="text-f-xs text-white/40 mb-1">Pipeline</div>
              <div className="text-f-sm"><span className="text-[#3B82F6]">Input:</span> New video files in RawFootage directory</div>
              <div className="text-f-sm"><span className="text-white/40">→ Extract duration, resolution, codec</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Generate transcript via Whisper</span></div>
              <div className="text-f-sm"><span className="text-white/40">→ Auto-tag with content labels</span></div>
              <div className="text-f-sm"><span className="text-[#22C55E]">Output:</span> Indexed video record in Supabase</div>
            </div>
          </div>
        ),
      },
      {
        title: 'System Health Check',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">Automation</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">Active</span>
            </div>
            <p className="text-f-sm text-white/60">Monitors Supabase status, API health, and deployment uptime for Mission Control.</p>
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
          <div className="space-y-2">
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 text-f-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Frontend</span>
                <span className="text-white/90">Next.js 16 + React + Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Database</span>
                <span className="text-white/90">Supabase (PostgreSQL + pgvector)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Hosting</span>
                <span className="text-white/90">Vercel (serverless functions)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Agent</span>
                <span className="text-white/90">OpenClaw (Clem) + Gateway cron</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Search</span>
                <span className="text-white/90">PostgreSQL full-text + pgvector semantic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Video Storage</span>
                <span className="text-white/90">/Volumes/ClemVideo/RawFootage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-28">Library</span>
                <span className="text-white/90">/Volumes/ClemDocs/Library</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Pipeline Stages',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Content moves through these stages in the pipeline board:</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 text-f-sm text-white/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">💡 Idea</span>
                <span className="text-white/30">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">📝 Script</span>
                <span className="text-white/30">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">🎬 Filming</span>
                <span className="text-white/30">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">✂️ Editing</span>
                <span className="text-white/30">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">📅 Scheduled</span>
                <span className="text-white/30">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">🚀 Published</span>
                <span className="text-white/30">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-f-xs">📊 Tracking</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Cron Jobs',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Automated jobs running on the Gateway:</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 text-f-sm text-white/80 space-y-2">
              <div>
                <div className="text-white/90 font-medium">Daily Psychedelic Law Digest</div>
                <div className="text-white/40 text-f-xs">Compiles latest law &amp; policy changes</div>
              </div>
              <div>
                <div className="text-white/90 font-medium">Daily Content Idea Generator</div>
                <div className="text-white/40 text-f-xs">Generates content ideas from trends &amp; library</div>
              </div>
              <div>
                <div className="text-white/90 font-medium">Trending Scanner</div>
                <div className="text-white/40 text-f-xs">Scans platforms for trending sounds &amp; hashtags</div>
              </div>
              <div>
                <div className="text-white/90 font-medium">Weekly Growth Metrics</div>
                <div className="text-white/40 text-f-xs">Reminds to log and review growth data</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Supabase Connection',
        content: (
          <div className="space-y-2">
            <p className="text-f-sm text-white/60">Mission Control connects to Supabase using the client-side SDK with anon key authentication.</p>
            <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-f-sm text-white/80 space-y-1">
              <div><span className="text-[#F59E0B]">URL</span> <span className="text-white/40">https://lmboomcjvrohibzqbmaw.supabase.co</span></div>
              <div><span className="text-[#F59E0B]">Schema</span> <span className="text-white/40">public</span> (content, videos, digests, growth_metrics, trending_scans)</div>
              <div><span className="text-[#F59E0B]">RLS</span> <span className="text-white/40">Enabled on all tables</span></div>
            </div>
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
  const filteredItems = searchQuery
    ? activeData.items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeData.items

  // Also search across all sections if query is present
  const allFiltered = searchQuery
    ? sections.flatMap(s =>
        s.items
          .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(item => ({ ...item, sectionId: s.id, sectionTitle: s.title }))
      )
    : []

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
                  <ChevronRight className={`h-4 w-4 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
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
        <div className="flex gap-6">
          {/* Sidebar nav */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="space-y-1 sticky top-6">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setExpandedItem(null) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-f-sm font-medium transition-all text-left ${
                    activeSection === section.id
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                      : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
                  }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden">
            <div className="flex gap-2 flex-wrap mb-4">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setExpandedItem(null) }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20'
                      : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="mb-4">
              <h2 className="text-f-lg font-semibold text-white">{activeData.title}</h2>
              <p className="text-f-sm text-white/50 mt-1">{activeData.description}</p>
            </div>

            {filteredItems.map((item) => {
              const isExpanded = expandedItem === item.title
              return (
                <GlassCard key={item.title}>
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => setExpandedItem(isExpanded ? null : item.title)}
                  >
                    <span className="text-f-base text-white/90 font-medium">{item.title}</span>
                    <ChevronRight className={`h-4 w-4 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
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
      )}
    </div>
  )
}