'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, MetricCard, EmptyState } from '@/components/ds'
import { Mail, ArrowRight, Sparkles, Plus, FileText, Film, Share2, PenTool, Repeat } from 'lucide-react'
import { CreateModal } from '@/components/create-modal'

interface ReelScript {
  hook: string
  body: string
  cta: string
  estimated_seconds?: number
}

interface CarouselSlide {
  slide_number: number
  text: string
  visual_note?: string
}

interface ShortCaption {
  text: string
  platform: string
  hashtags: string[]
}

interface RepurposeEntry {
  id: string
  source_content_id: string | null
  source_title: string
  source_theme: string | null
  reel_scripts: ReelScript[]
  carousel_posts: CarouselSlide[]
  short_captions: ShortCaption[]
  theme_tags: string[]
  recommended_format: string | null
  status: 'draft' | 'review' | 'approved' | 'published'
  created_at: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-white/10 text-white/60',
  review: 'bg-purple-500/20 text-purple-400',
  approved: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  published: 'bg-[#22C55E]/20 text-[#22C55E]',
}

export default function RepurposePage() {
  const [entries, setEntries] = useState<RepurposeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/repurpose')
        if (res.ok) {
          const data = await res.json()
          setEntries(data.items || [])
        }
      } catch {
        // May be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalScripts = entries.reduce((sum, e) => sum + e.reel_scripts.length, 0)
  const totalCarousels = entries.reduce((sum, e) => sum + e.carousel_posts.length, 0)
  const totalCaptions = entries.reduce((sum, e) => sum + e.short_captions.length, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter Repurposing"
        subtitle="Transform newsletters into reels, carousels, and captions"
        action={
          <CreateModal
            triggerLabel="Repurpose Newsletter"
            triggerIcon={Plus}
            title="Repurpose Newsletter"
            description="Import a newsletter and generate reel scripts, carousels, and captions"
            fields={[
              { name: 'source_title', label: 'Newsletter Title', type: 'text', placeholder: 'Issue #42: Psychedelic Church Update', required: true },
              { name: 'source_theme', label: 'Theme', type: 'text', placeholder: 'RFRA protections, psychedelic therapy' },
              { name: 'newsletter_text', label: 'Newsletter Content', type: 'textarea', placeholder: 'Paste the full newsletter text here...', rows: 8, required: true },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/repurpose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source_title: values.source_title,
                  source_theme: values.source_theme || null,
                  theme_tags: values.source_theme ? values.source_theme.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                  newsletter_text: values.newsletter_text,
                }),
              })
              if (!res.ok) throw new Error('Failed to repurpose newsletter')
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Newsletters"
          value={loading ? '...' : String(entries.length)}
          change="Repurposed"
          changeType="neutral"
          icon={<Mail className="h-5 w-5" />}
        />
        <MetricCard
          label="Reel Scripts"
          value={String(totalScripts)}
          change="Generated"
          changeType="positive"
          icon={<Film className="h-5 w-5" />}
        />
        <MetricCard
          label="Carousels"
          value={String(totalCarousels)}
          change="Generated"
          changeType="neutral"
          icon={<Share2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Captions"
          value={String(totalCaptions)}
          change="Generated"
          changeType="neutral"
          icon={<PenTool className="h-5 w-5" />}
        />
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Sparkles className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : entries.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Mail className="h-12 w-12" />}
            title="No repurposed content yet"
            description="Import a newsletter and generate reel scripts, carousels, and captions. Use the Repurpose Newsletter button above to get started."
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id
            return (
              <GlassCard key={entry.id} hover={false}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-[10px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
                      <Repeat className="h-5 w-5 text-[#F59E0B]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-f-base font-semibold text-white truncate">{entry.source_title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.source_theme && (
                          <span className="text-f-xs text-white/40">{entry.source_theme}</span>
                        )}
                        {entry.theme_tags.length > 0 && (
                          <span className="text-f-xs text-white/25">
                            {entry.theme_tags.slice(0, 2).join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-f-2xs font-medium capitalize ${statusColors[entry.status] || 'bg-white/10 text-white/40'}`}>
                      {entry.status}
                    </span>
                    <div className="flex items-center gap-2 text-f-xs text-white/40">
                      <span className="flex items-center gap-1"><Film className="h-3 w-3" />{entry.reel_scripts.length}</span>
                      <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{entry.carousel_posts.length}</span>
                      <span className="flex items-center gap-1"><PenTool className="h-3 w-3" />{entry.short_captions.length}</span>
                    </div>
                    <ArrowRight className={`h-4 w-4 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
                    {entry.reel_scripts.length > 0 && (
                      <div>
                        <h4 className="text-f-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                          <Film className="h-4 w-4 text-[#A855F7]" />
                          Reel Scripts ({entry.reel_scripts.length})
                        </h4>
                        <div className="space-y-2">
                          {entry.reel_scripts.map((script, i) => (
                            <div key={i} className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3">
                              <div className="text-f-sm text-[#F59E0B] font-medium mb-1">Hook: {script.hook}</div>
                              <div className="text-f-sm text-white/60 mb-1">{script.body}</div>
                              <div className="text-f-sm text-[#22C55E]">CTA: {script.cta}</div>
                              {script.estimated_seconds && (
                                <div className="text-f-xs text-white/25 mt-1">~{script.estimated_seconds}s</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.short_captions.length > 0 && (
                      <div>
                        <h4 className="text-f-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                          <PenTool className="h-4 w-4 text-[#3B82F6]" />
                          Short Captions ({entry.short_captions.length})
                        </h4>
                        <div className="space-y-2">
                          {entry.short_captions.map((cap, i) => (
                            <div key={i} className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3">
                              <div className="text-f-sm text-white/80 mb-1">{cap.text}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-f-xs text-white/30 capitalize">{cap.platform}</span>
                                {cap.hashtags.length > 0 && (
                                  <span className="text-f-xs text-[#3B82F6]/60">
                                    {cap.hashtags.slice(0, 5).join(' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}