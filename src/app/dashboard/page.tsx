import { PageHeader } from '@/components/ds'
import { MetricCard } from '@/components/ds'
import { GlassCard } from '@/components/ds'
import { StatusDot } from '@/components/ds'
import {
  BookOpen,
  Video,
  Newspaper,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Welcome back, Clementine"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Content Items"
          value="—"
          change="Library ready"
          changeType="neutral"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricCard
          label="Videos"
          value="—"
          change="Catalog ready"
          changeType="neutral"
          icon={<Video className="h-5 w-5" />}
        />
        <MetricCard
          label="Digests"
          value="—"
          change="Starting soon"
          changeType="neutral"
          icon={<Newspaper className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Agents"
          value="3"
          change="All systems go"
          changeType="positive"
          icon={<Zap className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <StatusDot status="working" />
            <h3 className="text-f-lg font-semibold text-white">System Status</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Content Library', status: 'Ready' },
              { name: 'Video Catalog', status: 'Ready' },
              { name: 'News Digests', status: 'Ready' },
              { name: 'Gateway', status: 'Connected' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <span className="text-f-base text-white/80">{item.name}</span>
                <span className="flex items-center gap-2 text-f-sm text-[#22C55E]">
                  <StatusDot status="online" size="sm" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Add Content', href: '/dashboard/content' },
              { label: 'Catalog Video', href: '/dashboard/videos' },
              { label: 'Write Digest', href: '/dashboard/digests' },
              { label: 'View Docs', href: '/dashboard/docs' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between py-3 px-4 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
              >
                <span className="text-f-base text-white/80 group-hover:text-white">{action.label}</span>
                <span className="text-f-sm text-white/30 group-hover:text-white/60">→</span>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-white/40" />
          <h3 className="text-f-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-f-base text-white/40">No activity yet</p>
          <p className="text-f-sm text-white/25 mt-1">Start by adding content or cataloging videos</p>
        </div>
      </GlassCard>
    </div>
  )
}