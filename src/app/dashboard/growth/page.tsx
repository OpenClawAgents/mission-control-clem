'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, MetricCard, EmptyState } from '@/components/ds'
import { BarChart3, Users, Eye, Heart, ArrowUpRight, ArrowDownRight, Sparkles, Film, Hash, Star, Plus } from 'lucide-react'
import { CreateModal } from '@/components/create-modal'

interface GrowthMetric {
  id: string
  date: string
  platform: string
  followers: number | null
  followers_gained: number
  impressions: number
  reach: number
  engagement_rate: number | null
  posts_count: number
  notes: string | null
}

interface GrowthSummary {
  total_followers: number
  total_gained: number
  avg_engagement: number
  platforms: string[]
  days_tracked: number
}

const platformIcons: Record<string, typeof Star> = {
  instagram: Star,
  tiktok: Sparkles,
  youtube: Film,
  facebook: Users,
  twitter: Hash,
  newsletter: BarChart3,
  other: BarChart3,
}

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  tiktok: '#000000',
  youtube: '#FF0000',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  newsletter: '#F59E0B',
  other: '#6B7280',
}

export default function GrowthPage() {
  const [metrics, setMetrics] = useState<GrowthMetric[]>([])
  const [summary, setSummary] = useState<GrowthSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/growth?days=30')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data.metrics || [])
          setSummary(data.summary || null)
        }
      } catch {
        // May be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group by platform
  const byPlatform = metrics.reduce<Record<string, GrowthMetric[]>>((acc, m) => {
    if (!acc[m.platform]) acc[m.platform] = []
    acc[m.platform].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader
        title="Growth Metrics"
        subtitle="Track followers, engagement, and platform performance"
        action={
          <CreateModal
            triggerLabel="Add Metrics"
            triggerIcon={Plus}
            title="Add Growth Metrics"
            description="Log today’s follower counts and engagement data for a platform"
            fields={[
              { name: 'platform', label: 'Platform', type: 'select', required: true, options: [
                { value: 'instagram', label: 'Instagram' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'twitter', label: 'Twitter/X' },
                { value: 'facebook', label: 'Facebook' },
                { value: 'newsletter', label: 'Newsletter' },
              ]},
              { name: 'followers', label: 'Total Followers', type: 'number', placeholder: '12500' },
              { name: 'followers_gained', label: 'Followers Gained (today)', type: 'number', placeholder: '45' },
              { name: 'impressions', label: 'Impressions', type: 'number', placeholder: '8200' },
              { name: 'reach', label: 'Reach', type: 'number', placeholder: '5100' },
              { name: 'engagement_rate', label: 'Engagement Rate (%)', type: 'number', placeholder: '4.2' },
              { name: 'posts_count', label: 'Posts This Period', type: 'number', placeholder: '3' },
              { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any observations...', rows: 2 },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/growth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  platform: values.platform,
                  followers: values.followers ? parseInt(values.followers) : null,
                  followers_gained: values.followers_gained ? parseInt(values.followers_gained) : 0,
                  impressions: values.impressions ? parseInt(values.impressions) : 0,
                  reach: values.reach ? parseInt(values.reach) : 0,
                  engagement_rate: values.engagement_rate ? parseFloat(values.engagement_rate) / 100 : null,
                  posts_count: values.posts_count ? parseInt(values.posts_count) : 0,
                  notes: values.notes || null,
                }),
              })
              if (!res.ok) throw new Error('Failed to add metrics')
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Followers"
          value={loading ? '...' : summary ? String(summary.total_followers) : '0'}
          change={summary && summary.total_gained > 0 ? `+${summary.total_gained} gained` : 'No data yet'}
          changeType={summary && summary.total_gained > 0 ? 'positive' : 'neutral'}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          label="Avg Engagement"
          value={loading ? '...' : summary ? `${(summary.avg_engagement * 100).toFixed(1)}%` : '—'}
          change="Across platforms"
          changeType="neutral"
          icon={<Heart className="h-5 w-5" />}
        />
        <MetricCard
          label="Platforms"
          value={loading ? '...' : summary ? String(summary.platforms.length) : '0'}
          change={summary ? `${summary.days_tracked}d tracked` : 'Add data'}
          changeType="neutral"
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          label="Impressions"
          value={loading ? '...' : metrics.length > 0 ? String(metrics.reduce((sum, m) => sum + (m.impressions || 0), 0)) : '0'}
          change="30 days"
          changeType="neutral"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Sparkles className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : metrics.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<BarChart3 className="h-12 w-12" />}
            title="No growth data yet"
            description="Start tracking your followers, engagement, and platform metrics. Add daily numbers to see trends over time."
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {(Object.entries(byPlatform) as [string, GrowthMetric[]][]).map(([platform, platformMetrics]) => {
            const Icon = platformIcons[platform] || BarChart3
            const color = platformColors[platform] || '#6B7280'
            const latest = platformMetrics[0]
            const prev = platformMetrics[1]
            const gained = latest?.followers_gained || 0
            const isUp = gained >= 0

            return (
              <GlassCard key={platform}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[10px] flex items-center justify-center border" style={{ backgroundColor: `${color}15`, borderColor: `${color}25` }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-f-base font-semibold text-white capitalize">{platform}</h3>
                      <p className="text-f-xs text-white/40">{platformMetrics.length} data points</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-f-lg font-semibold text-white">{latest.followers?.toLocaleString() || '—'}</div>
                    <div className={`text-f-xs flex items-center gap-1 ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {isUp ? '+' : ''}{gained} followers
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3">
                    <div className="text-f-xs text-white/40 mb-1">Impressions</div>
                    <div className="text-f-base font-medium text-white">{latest.impressions?.toLocaleString() || '—'}</div>
                  </div>
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3">
                    <div className="text-f-xs text-white/40 mb-1">Reach</div>
                    <div className="text-f-base font-medium text-white">{latest.reach?.toLocaleString() || '—'}</div>
                  </div>
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3">
                    <div className="text-f-xs text-white/40 mb-1">Engagement</div>
                    <div className="text-f-base font-medium text-white">{latest.engagement_rate ? `${(latest.engagement_rate * 100).toFixed(1)}%` : '—'}</div>
                  </div>
                  <div className="rounded-[8px] bg-white/[0.02] border border-white/[0.04] p-3">
                    <div className="text-f-xs text-white/40 mb-1">Posts</div>
                    <div className="text-f-base font-medium text-white">{latest.posts_count || '—'}</div>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}