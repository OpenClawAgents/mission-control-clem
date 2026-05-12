'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { type ContentType, type ContentStatus } from '@/lib/api'

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'script', label: 'Script' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'research', label: 'Research' },
  { value: 'digest', label: 'Digest' },
  { value: 'video_clip', label: 'Video Clip' },
  { value: 'draft', label: 'Draft' },
]

const contentStatuses: { value: ContentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

interface ContentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    type: ContentType
    status: ContentStatus
    tags: string[]
    source_url: string
    body: Record<string, unknown>
  }) => Promise<void>
}

export function ContentForm({ open, onClose, onSubmit }: ContentFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ContentType>('draft')
  const [status, setStatus] = useState<ContentStatus>('draft')
  const [tags, setTags] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        type,
        status,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        source_url: sourceUrl.trim(),
        body: bodyText.trim() ? { text: bodyText.trim() } : {},
      })
      // Reset form
      setTitle('')
      setType('draft')
      setStatus('draft')
      setTags('')
      setSourceUrl('')
      setBodyText('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[14px] border border-white/[0.06] bg-[#0B0F18] p-6 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-f-lg font-semibold text-white">Add Content</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter content title"
              required
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ContentType)}
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base appearance-none"
              >
                {contentTypes.map(ct => (
                  <option key={ct.value} value={ct.value} className="bg-[#0B0F18]">{ct.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ContentStatus)}
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base appearance-none"
              >
                {contentStatuses.map(cs => (
                  <option key={cs.value} value={cs.value} className="bg-[#0B0F18]">{cs.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Tags <span className="text-white/30">(comma separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="psychedelic, law, reform"
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Source URL <span className="text-white/30">(optional)</span></label>
            <input
              type="url"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Content <span className="text-white/30">(optional)</span></label>
            <textarea
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              placeholder="Write or paste content here..."
              rows={4}
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-f-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[12px] border border-white/[0.08] text-white/70 py-2.5 text-f-base font-medium hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[12px] bg-[#F59E0B]/15 text-white py-2.5 text-f-base font-medium hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}