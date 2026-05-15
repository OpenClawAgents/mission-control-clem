'use client'

import { useEffect, useState } from 'react'
import { PageHeader, GlassCard, MetricCard, EmptyState, StatusDot } from '@/components/ds'
import { TrendingUp, Hash, Music, Users, Flame, ExternalLink, Sparkles, RefreshCw } from 'lucide-react'

interface TrendItem {
  name: string
  url?: string
  view_count?: number
  engagement?: number
  trend_score?: number
}

interface TrendScan {
  id: string
  scan_date: string
  platform: string
  scan_type: string
  items: TrendItem[]
  source_url: string | null
  notes: string | null
}

const scanTypeIcons: Record<string, typeof Hash> = {
  sounds: Music,
  hashtags: Hash,
  challenges: Flame,
  creators: Users,
  topics: TrendingUp,
}

const scanTypeLabels: Record<string, string> = {
  sounds: 'Trending Sounds',
  hashtags: 'Hashtags',
  challenges: 'Challenges',
  creators: 'Creators',
  topics: 'Topics',
}

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  tiktok: '#000000',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  general: '#6B7280',
}

export default function TrendingPage() {
  const [scans, setScans] = useState<TrendScan[]>([])
  const [loading, setLoading] = useState(true)
  const [activePlatform, setActivePlatform] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/trending?days=7')
        if (res.ok) {
          const data = await res.json()
          setScans(data.scans || [])
        }
      } catch {
        // May be empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = activePlatform
    ? scans.filter(s => s.platform === activePlatform)
    : scans

  const totalItems = scans.reduce((sum, s) => sum + (s.items?.length || 0), 0)
  const platforms = [...new Set(scans.map(s => s.platform))]
  const scanTypes = [...new Set(scans.map(s => s.scan_type))]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trending Scanner"
        subtitle="Track trending sounds, hashtags, challenges, and creators"
        action={
          <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
            <RefreshCw className="h-4 w-4" />
            Scan Now
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Scans"
          value={loading ? '...' : String(scans.length)}
          change="Last 7 days"
          changeType="neutral"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          label="Trend Items"
          value={String(totalItems)}
          change="Across all platforms"
          changeType="neutral"
          icon={<Flame className="h-5 w-5" />}
        />
        <MetricCard
          label="Platforms"
          value={String(platforms.length)}
          change={platforms.join(', ') || 'None yet'}
          changeType="neutral"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          label="Categories"
          value={String(scanTypes.length)}
          change={scanTypes.map(t => scanTypeLabels[t] || t).join(', ') || 'None'}
          changeType="neutral"
          icon={<Hash className="h-5 w-5" />}
        />
      </div>

      {/* Platform filter */}
      {platforms.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActivePlatform(null)}
            className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all ${
              !activePlatform
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            All platforms
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(activePlatform === p ? null : p)}
              className={`px-3 py-1.5 rounded-[8px] text-f-xs font-medium transition-all capitalize ${
                activePlatform === p
                  ? 'border'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.06]'
              }`}
              style={activePlatform === p ? { backgroundColor: `${platformColors[p] || '#6B7280'}15`, borderColor: `${platformColors[p] || '#6B7280'}30`, color: platformColors[p] || '#6B7280' } : {}}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-12">
            <Sparkles className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        </GlassCard>
      ) : scans.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title="No trending data yet"
            description="Set up the trending scanner to automatically detect trending sounds, hashtags, and challenges across platforms. Configure priority channels to watch specific creators."
            action={
              <button className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all">
                <RefreshCw className="h-4 w-4" />
                Set Up Scanner
              </button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((scan) => {
            const Icon = scanTypeIcons[scan.scan_type] || Hash
            const color = platformColors[scan.platform] || '#6B7280'
            return (
              <GlassCard key={scan.id} hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-[8px] flex items-center justify-center border" style={{ backgroundColor: `${color}10`, borderColor: `${color}20` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-f-base font-semibold text-white capitalize">
                        {scan.platform} · {scanTypeLabels[scan.scan_type] || scan.scan_type}
                      </h3>
                      <p className="text-f-xs text-white/40">
                        {new Date(scan.scan_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {scan.source_url && (
                    <a href={scan.source_url} target="_blank" rel="noopener noreferrer" className="text-f-xs text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors">
                      Source →
                    </a>
                  )}
                </div>

                {scan.items && scan.items.length > 0 ? (
                  <div className="space-y-1.5">
                    {scan.items.slice(0, 8).map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-[6px] hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-f-xs text-white/25 w-5">{i + 1}.</span>
                          <span className="text-f-sm text-white/80 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {item.view_count && (
                            <span className="text-f-xs text-white/30">{item.view_count.toLocaleString()} views</span>
                          )}
                          {item.trend_score && (
                            <span className="text-f-xs text-[#F59E0B]">
                              {item.trend_score > 80 ? '🔥' : item.trend_score > 50 ? '📈' : '📊'} {item.trend_score}
                            </span>
                          )}
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/40 transition-colors">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {scan.items.length > 8 && (
                      <p className="text-f-xs text-white/25 text-center py-1">+{scan.items.length - 8} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-f-sm text-white/30 py-2">No items in this scan</p>
                )}

                {scan.notes && (
                  <p className="mt-2 text-f-xs text-white/40 italic">{scan.notes}</p>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}