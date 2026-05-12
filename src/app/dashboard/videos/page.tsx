'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader, GlassCard, EmptyState, MetricCard } from '@/components/ds'
import { Video, Plus, HardDrive, Clock, Tag } from 'lucide-react'
import { getVideos, createVideo, type Video as VideoType } from '@/lib/api'
import { getCurrentUserId } from '@/lib/api/auth'
import { VideoForm } from '@/components/forms/video-form'

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadData = async () => {
    try {
      const data = await getVideos()
      setVideos(data)
    } catch {
      // Auth or empty table is fine
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const totalDuration = videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0)
  const taggedCount = videos.filter(v => v.tags && v.tags.length > 0).length

  const handleCreate = async (data: {
    title: string
    file_path: string
    duration_seconds: number | null
    resolution: string
    tags: string[]
    transcript: string
  }) => {
    const userId = await getCurrentUserId()

    await createVideo({
      user_id: userId,
      title: data.title,
      file_path: data.file_path || null,
      duration_seconds: data.duration_seconds,
      resolution: data.resolution || null,
      tags: data.tags,
      transcript: data.transcript || null,
      metadata: {},
    })
    toast.success('Video cataloged')
    await loadData()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Catalog"
        subtitle="Raw footage, clips, and metadata — searchable beats scrollable"
        action={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <Plus className="h-4 w-4" />
            Catalog Video
          </button>
        }
      />

      <VideoForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Videos" value={loading ? '...' : String(videos.length)} icon={<Video className="h-5 w-5" />} />
        <MetricCard label="Total Duration" value={totalDuration > 0 ? `${Math.round(totalDuration / 60)}m` : '0m'} change={videos.length > 0 ? 'Cataloged' : 'Catalog ready'} changeType="neutral" icon={<Clock className="h-5 w-5" />} />
        <MetricCard label="Tagged" value={loading ? '...' : String(taggedCount)} change={taggedCount > 0 ? `${taggedCount} searchable` : 'Add tags for search'} changeType={taggedCount > 0 ? 'positive' : 'neutral'} icon={<Tag className="h-5 w-5" />} />
        <MetricCard label="Storage" value="—" change="Not connected" changeType="neutral" icon={<HardDrive className="h-5 w-5" />} />
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-4 w-4 text-[#F59E0B]" />
          <h3 className="text-f-lg font-semibold text-white">Storage Paths</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Raw Footage', path: '/Volumes/ClemVideo/RawFootage', status: 'Not mounted' },
            { label: 'Catalog Database', path: '~/Library/video_catalog.db', status: 'SQLite' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div>
                <span className="text-f-base text-white/90 font-medium">{item.label}</span>
                <code className="block text-f-xs text-[#F59E0B]/70 mt-0.5">{item.path}</code>
              </div>
              <span className="text-f-xs text-white/40">{item.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {videos.length > 0 ? (
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Cataloged Videos</h3>
          </div>
          <div className="space-y-2">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center justify-between py-3 px-4 rounded-[10px] border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-f-base text-white/90 font-medium truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {video.duration_seconds && <span className="text-f-xs text-white/40">{Math.round(video.duration_seconds / 60)}m</span>}
                    {video.resolution && <span className="text-f-xs text-white/40">{video.resolution}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 ml-3">
                  {video.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-f-2xs text-white/50">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Video className="h-12 w-12" />}
            title="No videos cataloged"
            description="Tag clips from /Volumes/ClemVideo/RawFootage with metadata for fast search and retrieval. Searchable beats scrollable."
            action={
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
                <Plus className="h-4 w-4" />
                Catalog Your First Video
              </button>
            }
          />
        </GlassCard>
      )}
    </div>
  )
}