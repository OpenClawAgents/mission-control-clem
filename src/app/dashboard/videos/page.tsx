'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, EmptyState, MetricCard, ListItem, ListItemTitle, ListItemMeta } from '@/components/ds'
import { Video, Plus, Clock, HardDrive, Tag, Film, Search } from 'lucide-react'
import { getVideos, type Video as VideoType } from '@/lib/api'
import { CreateModal } from '@/components/create-modal'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getVideos()
        setVideos(data)
      } catch {
        // Table may be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = videos.filter((v) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      v.title.toLowerCase().includes(q) ||
      v.tags?.some((t) => t.toLowerCase().includes(q))
    )
  })

  const totalDuration = videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0)
  const taggedCount = videos.filter((v) => v.tags && v.tags.length > 0).length
  const transcriptCount = videos.filter((v) => v.transcript).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Catalog"
        subtitle="Raw footage, clips, and tagged video assets"
        action={
          <CreateModal
            triggerLabel="Add Video"
            triggerIcon={Plus}
            title="Add Video to Catalog"
            description="Manually add a video file to the catalog"
            fields={[
              { name: 'title', label: 'Title', type: 'text', placeholder: 'Interview with church founder...', required: true },
              { name: 'file_path', label: 'File Path', type: 'text', placeholder: '/Volumes/ClemVideo/RawFootage/clip.mp4', required: true },
              { name: 'duration_seconds', label: 'Duration (seconds)', type: 'number', placeholder: '120' },
              { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'interview, church, RFRA' },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...values,
                  user_id: '00000000-0000-0000-0000-000000000000',
                  duration_seconds: values.duration_seconds ? parseInt(values.duration_seconds) : null,
                  tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                }),
              })
              if (!res.ok) throw new Error('Failed to add video')
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Videos"
          value={loading ? '...' : String(videos.length)}
          change={videos.length > 0 ? 'cataloged' : 'Ready to add'}
          changeType={videos.length > 0 ? 'positive' : 'neutral'}
          icon={<Video />}
        />
        <MetricCard
          label="Tagged"
          value={String(taggedCount)}
          change={taggedCount > 0 ? `${Math.round((taggedCount / Math.max(videos.length, 1)) * 100)}%` : '0%'}
          changeType="neutral"
          icon={<Tag />}
        />
        <MetricCard
          label="Transcribed"
          value={String(transcriptCount)}
          change={transcriptCount > 0 ? 'searchable' : 'Not yet'}
          changeType="neutral"
          icon={<Film />}
        />
        <MetricCard
          label="Total Duration"
          value={totalDuration > 0 ? formatDuration(totalDuration) : '0:00'}
          change="Combined"
          changeType="neutral"
          icon={<Clock />}
        />
      </div>

      {videos.length > 0 && (
        <GlassCard>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/[0.06] text-f-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-f-base text-white/40">
              No videos match &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((video) => (
                <ListItem
                  key={video.id}
                  icon={<Film className="h-4 w-4 text-white/30" />}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <ListItemTitle>{video.title}</ListItemTitle>
                    <span className="text-f-xs text-white/30 shrink-0">{formatDate(video.created_at)}</span>
                  </div>
                  <ListItemMeta>
                    {video.duration_seconds && (
                      <span className="text-f-xs text-white/40">{formatDuration(video.duration_seconds)}</span>
                    )}
                    {video.resolution && (
                      <span className="text-f-xs text-white/30">{video.resolution}</span>
                    )}
                    {video.tags && video.tags.length > 0 && (
                      <span className="text-f-xs text-white/25">
                        {video.tags.slice(0, 3).join(' · ')}
                      </span>
                    )}
                  </ListItemMeta>
                </ListItem>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {!loading && videos.length === 0 && (
        <GlassCard hover={false}>
          <EmptyState
            icon={<HardDrive />}
            title="No videos cataloged yet"
            description="AirDrop footage to the Mac Mini and it'll auto-appear here once tagged. Or use the Add Video button above to add manually."
          />
        </GlassCard>
      )}
    </div>
  )
}