'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { type DigestCategory } from '@/lib/api'

const digestCategories: { value: DigestCategory; label: string }[] = [
  { value: 'psychedelic_law', label: 'Psychedelic Law' },
  { value: 'church', label: 'Church of Singularism' },
  { value: 'dea', label: 'DEA Scheduling' },
  { value: 'state_reform', label: 'State Reform' },
  { value: 'other', label: 'Other' },
]

interface DigestFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    date: string
    category: DigestCategory
    summary: string
    source_url: string
    source_name: string
  }) => Promise<void>
}

export function DigestForm({ open, onClose, onSubmit }: DigestFormProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<DigestCategory>('psychedelic_law')
  const [summary, setSummary] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim()) {
      setError('Title and summary are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        date,
        category,
        summary: summary.trim(),
        source_url: sourceUrl.trim(),
        source_name: sourceName.trim(),
      })
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      setCategory('psychedelic_law')
      setSummary('')
      setSourceUrl('')
      setSourceName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create digest')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[14px] border border-white/[0.06] bg-[#0B0F18] p-6 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-f-lg font-semibold text-white">New Digest</h2>
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
              placeholder="DEA reschedules psilocybin to Schedule III"
              required
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DigestCategory)}
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base appearance-none"
              >
                {digestCategories.map(dc => (
                  <option key={dc.value} value={dc.value} className="bg-[#0B0F18]">{dc.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Summary</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Summarize the key developments..."
              rows={4}
              required
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Source Name <span className="text-white/30">(optional)</span></label>
              <input
                type="text"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                placeholder="DEA Press Release"
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
              {submitting ? 'Creating...' : 'Create Digest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}