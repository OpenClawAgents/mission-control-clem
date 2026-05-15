'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, StatusDot, MetricCard } from '@/components/ds'
import { CreateModal } from '@/components/create-modal'
import { Plus, Lightbulb, PenTool, Camera, Film, Calendar, Globe, BarChart3, Sparkles } from 'lucide-react'
import { getContent, type ContentItem, type ContentType, type ContentStatus } from '@/lib/api'

type PipelineStage = 'idea' | 'script' | 'filming' | 'editing' | 'scheduled' | 'published' | 'tracking'

const stages: { key: PipelineStage; label: string; icon: typeof Lightbulb; color: string }[] = [
  { key: 'idea', label: 'Ideas', icon: Lightbulb, color: '#A855F7' },
  { key: 'script', label: 'Scripting', icon: PenTool, color: '#F59E0B' },
  { key: 'filming', label: 'Filming', icon: Camera, color: '#EC4899' },
  { key: 'editing', label: 'Editing', icon: Film, color: '#3B82F6' },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar, color: '#22C55E' },
  { key: 'published', label: 'Published', icon: Globe, color: '#14B8A6' },
  { key: 'tracking', label: 'Tracking', icon: BarChart3, color: '#6B7280' },
]

// Map content status to pipeline stage
function statusToStage(status: ContentStatus): PipelineStage {
  switch (status) {
    case 'draft': return 'idea'
    case 'review': return 'script'
    case 'published': return 'published'
    case 'archived': return 'tracking'
    default: return 'idea'
  }
}

// Map content type to a pipeline-appropriate label
function typeLabel(type: ContentType): string {
  const map: Record<ContentType, string> = {
    newsletter: 'Newsletter',
    script: 'Script',
    social_post: 'Social',
    research: 'Research',
    digest: 'Digest',
    video_clip: 'Clip',
    draft: 'Draft',
  }
  return map[type] || type
}

export default function PipelinePage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getContent()
        setItems(data)
      } catch {
        // Table may be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group items by pipeline stage
  const pipelineItems: Record<PipelineStage, ContentItem[]> = {
    idea: [],
    script: [],
    filming: [],
    editing: [],
    scheduled: [],
    published: [],
    tracking: [],
  }

  items.forEach((item) => {
    const stage = statusToStage(item.status)
    pipelineItems[stage].push(item)
  })

  const totalActive = items.filter((i) => i.status !== 'archived').length
  const inProgress = items.filter((i) => i.status === 'draft' || i.status === 'review').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Pipeline"
        subtitle="Track content from idea to published"
        action={
          <CreateModal
            triggerLabel="New Idea"
            triggerIcon={Plus}
            title="Add Content Idea"
            description="Start a new content idea in the pipeline"
            fields={[
              { name: 'title', label: 'Title', type: 'text', placeholder: 'RFRA protections for psychedelic churches', required: true },
              { name: 'type', label: 'Type', type: 'select', required: true, options: [
                { value: 'draft', label: 'Idea' },
                { value: 'script', label: 'Script' },
                { value: 'social_post', label: 'Social Post' },
                { value: 'newsletter', label: 'Newsletter' },
                { value: 'research', label: 'Research' },
              ]},
              { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'psychedelic law, church, content angle' },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...values,
                  user_id: '00000000-0000-0000-0000-000000000000',
                  tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                  status: 'draft',
                  pipeline_stage: 'idea',
                }),
              })
              if (!res.ok) throw new Error('Failed to create idea')
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Items"
          value={loading ? '...' : String(items.length)}
          change={`${totalActive} active`}
          changeType="neutral"
          icon={<Lightbulb className="h-5 w-5" />}
        />
        <MetricCard
          label="In Progress"
          value={String(inProgress)}
          change="Draft & review"
          changeType="neutral"
          icon={<PenTool className="h-5 w-5" />}
        />
        <MetricCard
          label="Published"
          value={String(pipelineItems.published.length)}
          change="Live"
          changeType="positive"
          icon={<Globe className="h-5 w-5" />}
        />
        <MetricCard
          label="Ideas"
          value={String(pipelineItems.idea.length)}
          change="Backlog"
          changeType="neutral"
          icon={<Lightbulb className="h-5 w-5" />}
        />
      </div>

      {/* Kanban columns */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Sparkles className="h-5 w-5 text-white/20 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard hover={false}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Lightbulb className="h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-f-lg font-semibold text-white/80">Pipeline is empty</h3>
            <p className="mt-2 text-f-base text-white/50 max-w-md">
              Start by adding content ideas. They'll move through stages as you script, film, edit, and publish.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {stages.map((stage) => {
            const Icon = stage.icon
            const stageItems = pipelineItems[stage.key]
            return (
              <div key={stage.key} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div
                    className="h-6 w-6 rounded-[6px] flex items-center justify-center border"
                    style={{ backgroundColor: `${stage.color}10`, borderColor: `${stage.color}20` }}
                  >
                    <Icon className="h-3 w-3" style={{ color: stage.color }} />
                  </div>
                  <span className="text-f-sm font-medium text-white/70">{stage.label}</span>
                  <span className="ml-auto text-f-xs text-white/30">{stageItems.length}</span>
                </div>
                <div className="flex flex-col gap-2 min-h-[60px]">
                  {stageItems.length === 0 ? (
                    <div className="rounded-[10px] border border-dashed border-white/[0.06] bg-white/[0.01] p-3 flex items-center justify-center">
                      <span className="text-f-xs text-white/20">Empty</span>
                    </div>
                  ) : (
                    stageItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[10px] bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer group"
                      >
                        <div className="text-f-sm text-white/90 font-medium truncate group-hover:text-white">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-f-2xs text-white/40">{typeLabel(item.type)}</span>
                          {item.tags && item.tags.length > 0 && (
                            <span className="text-f-2xs text-white/25">
                              {item.tags[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}