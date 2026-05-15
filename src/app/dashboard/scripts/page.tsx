'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, EmptyState, MetricCard, StatusDot } from '@/components/ds'
import { CreateModal } from '@/components/create-modal'
import {
  FileText,
  Plus,
  Sparkles,
  Target,
  Clapperboard,
  Clock,
  PenTool,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { getContent, type ContentItem, type ContentType } from '@/lib/api'

const stageConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  idea: { icon: Lightbulb, label: 'Idea', color: '#A855F7' },
  draft: { icon: PenTool, label: 'Draft', color: '#F59E0B' },
  review: { icon: TrendingUp, label: 'Review', color: '#3B82F6' },
  published: { icon: Clapperboard, label: 'Published', color: '#22C55E' },
  archived: { icon: BookOpen, label: 'Archived', color: '#6B7280' },
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getContent()
        setScripts(data.filter((item: ContentItem) => item.type === 'script'))
      } catch {
        // Table may be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = activeStage
    ? scripts.filter((s) => s.status === activeStage)
    : scripts

  const draftCount = scripts.filter((s) => s.status === 'draft').length
  const reviewCount = scripts.filter((s) => s.status === 'review').length
  const publishedCount = scripts.filter((s) => s.status === 'published').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scripts"
        subtitle="Viral-ready scripts with hooks, angles, and shot lists"
        action={
          <CreateModal
            triggerLabel="New Script"
            triggerIcon={Plus}
            title="Write Script"
            description="Create a new video or content script"
            fields={[
              { name: 'title', label: 'Script Title', type: 'text', placeholder: 'Why RFRA protects psychedelic churches', required: true },
              { name: 'type', label: 'Format', type: 'select', required: true, options: [
                { value: 'reel', label: 'Reel (60s)' },
                { value: 'short', label: 'Short (3min)' },
                { value: 'long', label: 'Long-form (10min+)' },
                { value: 'carousel', label: 'Carousel' },
              ]},
              { name: 'hook', label: 'Hook / Opening Line', type: 'text', placeholder: 'What if your church was illegal?' },
              { name: 'body', label: 'Script Content', type: 'textarea', placeholder: 'Write your script here...', rows: 8 },
              { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'psychedelic law, church, RFRA' },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: values.title,
                  type: 'script',
                  user_id: '00000000-0000-0000-0000-000000000000',
                  status: 'draft',
                  tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                  body: {
                    format: values.type,
                    hook: values.hook || undefined,
                    script: values.body || undefined,
                  },
                }),
              })
              if (!res.ok) throw new Error('Failed to create script')
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Scripts"
          value={loading ? '...' : String(scripts.length)}
          change={scripts.length > 0 ? `${publishedCount} published` : 'Start writing'}
          changeType={publishedCount > 0 ? 'positive' : 'neutral'}
          icon={<FileText />}
        />
        <MetricCard
          label="Drafts"
          value={String(draftCount)}
          change="In progress"
          changeType="neutral"
          icon={<PenTool />}
        />
        <MetricCard
          label="In Review"
          value={String(reviewCount)}
          change="Awaiting approval"
          changeType="neutral"
          icon={<Target />}
        />
        <MetricCard
          label="Published"
          value={String(publishedCount)}
          change="Live"
          changeType={publishedCount > 0 ? 'positive' : 'neutral'}
          icon={<Clapperboard />}
        />
      </div>

      {/* Script writing guide */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-[8px] flex items-center justify-center bg-[#A855F7]/10 border border-[#A855F7]/20">
            <Lightbulb className="h-4 w-4 text-[#A855F7]" />
          </div>
          <h3 className="text-f-lg font-semibold text-white">Script Framework</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Hook', desc: 'Open with a provocative question or bold claim that stops the scroll', color: '#F59E0B' },
            { label: 'Body', desc: 'Deliver the value — story, evidence, or insight that fulfills the hook', color: '#3B82F6' },
            { label: 'CTA', desc: 'Close with a clear call to action — share, follow, or comment', color: '#22C55E' },
          ].map((stage) => (
            <div
              key={stage.label}
              className="rounded-[10px] border p-4"
              style={{ backgroundColor: `${stage.color}05`, borderColor: `${stage.color}15` }}
            >
              <div className="text-f-sm font-semibold mb-1" style={{ color: stage.color }}>{stage.label}</div>
              <p className="text-f-xs text-white/50">{stage.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : scripts.length > 0 ? (
        <>
          {/* Stage filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveStage(null)}
              className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
                !activeStage
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              All
            </button>
            {(Object.entries(stageConfig) as [string, typeof stageConfig[string]][]).map(([stage, config]) => {
              const Icon = config.icon
              const count = scripts.filter((s) => s.status === stage).length
              if (count === 0) return null
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(activeStage === stage ? null : stage)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
                    activeStage === stage
                      ? 'border'
                      : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.06]'
                  }`}
                  style={activeStage === stage ? { backgroundColor: `${config.color}15`, borderColor: `${config.color}30`, color: config.color } : {}}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                  <span className="opacity-60">({count})</span>
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.map((script) => {
              const config = stageConfig[script.status] || stageConfig.draft
              const Icon = config.icon
              const hook = (script.body as Record<string, string>)?.hook
              return (
                <GlassCard key={script.id} hover={true}>
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-[10px] flex items-center justify-center border shrink-0"
                      style={{ backgroundColor: `${config.color}10`, borderColor: `${config.color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-f-base text-white font-medium truncate">{script.title}</h3>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium border"
                          style={{ backgroundColor: `${config.color}10`, borderColor: `${config.color}20`, color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                      {hook && (
                        <p className="text-f-sm text-white/40 italic line-clamp-1">&ldquo;{hook}&rdquo;</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-f-xs text-white/30">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(script.created_at).toLocaleDateString()}
                        </span>
                        {script.tags && script.tags.length > 0 && (
                          <span>{script.tags.slice(0, 3).join(' · ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </>
      ) : (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Clapperboard />}
            title="No scripts yet"
            description="Create viral-ready scripts with hooks, angles, and shot lists. Repurpose from your content library or start fresh."
          />
        </GlassCard>
      )}
    </div>
  )
}