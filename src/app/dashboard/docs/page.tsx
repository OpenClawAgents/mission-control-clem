import { PageHeader, GlassCard, EmptyState } from '@/components/ds'
import { BookOpen } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        subtitle="API reference and concept docs"
      />

      <GlassCard hover={false}>
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="Docs coming soon"
          description="In-dashboard documentation and API reference will be available here."
        />
      </GlassCard>
    </div>
  )
}