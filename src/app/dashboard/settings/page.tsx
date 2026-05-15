import { PageHeader, GlassCard } from '@/components/ds'
import { Settings, Server, Database, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Gateway configuration and system health"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Server className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Gateway</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Status', value: 'Running' },
              { label: 'Version', value: '—' },
              { label: 'Uptime', value: '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <span className="text-f-base text-white/80">{item.label}</span>
                <span className="text-f-sm text-white/50">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-f-lg font-semibold text-white">Database</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Connection', value: '—' },
              { label: 'Tables', value: '—' },
              { label: 'Storage', value: '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-t border-white/[0.04]">
                <span className="text-f-base text-white/80">{item.label}</span>
                <span className="text-f-sm text-white/50">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-white/40" />
          <h3 className="text-f-lg font-semibold text-white">Diagnostics</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-f-base text-white/40">System diagnostics available when connected</p>
        </div>
      </GlassCard>
    </div>
  )
}