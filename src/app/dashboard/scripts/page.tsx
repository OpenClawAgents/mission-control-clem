'use client'

import { useState } from 'react'
import { PageHeader, GlassCard, EmptyState, MetricCard } from '@/components/ds'
import { CreateModal } from '@/components/create-modal'
import { FileText, Plus, Sparkles, Target, Clapperboard } from 'lucide-react'

export default function ScriptsPage() {
  const [created, setCreated] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scripts"
        subtitle="Viral-ready scripts with hooks, angles, and shot lists"
        action={
          <CreateModal
            triggerLabel="New Script"
            triggerIcon={Plus}
            title="Write Script"
            description="Create a new video or content script"
            fields={[
              { name: 'title', label: 'Script Title', type: 'text', placeholder: 'Why RFRA protects psychedelic churches', required: true },
              { name: 'type', label: 'Format', type: 'select', required: true, options: [
                { value: 'reel', label: 'Reel (60s)' },
                { value: 'short', label: 'Short (3min)' },
                { value: 'long', label: 'Long-form (10min+)' },
                { value: 'carousel', label: 'Carousel' },
              ]},
              { name: 'hook', label: 'Hook / Opening Line', type: 'text', placeholder: 'What if your church was illegal?' },
              { name: 'body', label: 'Script Content', type: 'textarea', placeholder: 'Write your script here...', rows: 8 },
              { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'psychedelic law, church, RFRA' },
            ]}
            onSubmit={async (values) => {
              const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: values.title,
                  type: 'script',
                  user_id: '00000000-0000-0000-0000-000000000000',
                  status: 'draft',
                  tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                  body: {
                    format: values.type,
                    hook: values.hook || undefined,
                    script: values.body || undefined,
                  },
                }),
              })
              if (!res.ok) throw new Error('Failed to create script')
              setCreated(true)
              window.location.reload()
            }}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Scripts"
          value="0"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Ready to Shoot"
          value="0"
          change="Write your first"
          changeType="neutral"
          icon={<Clapperboard className="h-5 w-5" />}
        />
        <MetricCard
          label="Avg Hook Score"
          value="—"
          change="No data yet"
          changeType="neutral"
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      <GlassCard hover={false}>
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="No scripts yet"
          description="Create viral-ready scripts with hooks, angles, and shot lists. Repurpose from your content library or start fresh."
        />
      </GlassCard>
    </div>
  )
}