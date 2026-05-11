import { PageHeader, GlassCard, StatusDot } from '@/components/ds'
import {
  Monitor,
  Database,
  Server,
  ExternalLink,
} from 'lucide-react'

const infrastructure = [
  { label: 'Platform', value: 'Mission Control Clem', icon: Monitor },
  { label: 'Database', value: 'Supabase', icon: Database },
  { label: 'Deployment', value: 'Vercel', icon: Server },
]

const configLinks = [
  { label: 'OpenClaw Docs', href: 'https://docs.openclaw.ai', description: 'Platform documentation', external: true },
  { label: 'GitHub Repo', href: 'https://github.com/OpenClawAgents/mission-control-clem', description: 'Source code', external: true },
  { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard', description: 'Database & auth management', external: true },
  { label: 'Vercel Dashboard', href: 'https://vercel.com', description: 'Deployment & domains', external: true },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="System configuration and infrastructure"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="text-f-lg font-semibold text-white mb-4">Infrastructure</h3>
          <div className="space-y-3">
            {infrastructure.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-t border-white/[0.04]">
                <Icon className="h-4 w-4 text-white/40" />
                <span className="text-f-base text-white/65">{label}</span>
                <span className="ml-auto text-f-base text-white/90 font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2">
            <StatusDot status="online" />
            <span className="text-f-sm text-white/60">All systems operational</span>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-f-lg font-semibold text-white mb-4">Quick Links</h3>
          <div className="space-y-2">
            {configLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between py-3 px-4 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-[#F59E0B]/20 transition-all group"
              >
                <div>
                  <span className="text-f-base text-white/80 group-hover:text-white">{link.label}</span>
                  <p className="text-f-xs text-white/40">{link.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-white/60" />
              </a>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <h3 className="text-f-lg font-semibold text-white mb-4">Data Paths</h3>
        <div className="space-y-3">
          {[
            { label: 'Digital Library', path: '/Volumes/ClemDocs/Library', desc: 'Newsletters, research, scripts' },
            { label: 'Raw Footage', path: '/Volumes/ClemVideo/RawFootage', desc: 'Video clips and recordings' },
            { label: 'Video Catalog DB', path: '~/Library/video_catalog.db', desc: 'SQLite metadata index' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div>
                <span className="text-f-base text-white/90 font-medium">{item.label}</span>
                <p className="text-f-xs text-white/40">{item.desc}</p>
              </div>
              <code className="text-f-xs text-[#F59E0B]/70 bg-[#F59E0B]/10 px-2 py-1 rounded-md">{item.path}</code>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}