'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface VideoFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    file_path: string
    duration_seconds: number | null
    resolution: string
    tags: string[]
    transcript: string
  }) => Promise<void>
}

export function VideoForm({ open, onClose, onSubmit }: VideoFormProps) {
  const [title, setTitle] = useState('')
  const [filePath, setFilePath] = useState('')
  const [duration, setDuration] = useState('')
  const [resolution, setResolution] = useState('')
  const [tags, setTags] = useState('')
  const [transcript, setTranscript] = useState('')
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
        file_path: filePath.trim(),
        duration_seconds: duration ? parseInt(duration, 10) : null,
        resolution: resolution.trim(),
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        transcript: transcript.trim(),
      })
      setTitle('')
      setFilePath('')
      setDuration('')
      setResolution('')
      setTags('')
      setTranscript('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to catalog video')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[14px] border border-white/[0.06] bg-[#0B0F18] p-6 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-f-lg font-semibold text-white">Catalog Video</h2>
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
              placeholder="Bicycle Day 2025 — Full Talk"
              required
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">File Path</label>
            <input
              type="text"
              value={filePath}
              onChange={e => setFilePath(e.target.value)}
              placeholder="/Volumes/ClemVideo/RawFootage/video.mp4"
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Duration <span className="text-white/30">(seconds)</span></label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="3600"
                min="0"
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
              />
            </div>
            <div>
              <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Resolution</label>
              <input
                type="text"
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder="1920x1080"
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Tags <span className="text-white/30">(comma separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="psychedelic, conference, 2025"
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-2.5 outline-none transition-all text-f-base"
            />
          </div>

          <div>
            <label className="block text-f-sm text-white/65 mb-1.5 font-medium">Transcript <span className="text-white/30">(optional)</span></label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste transcript text..."
              rows={3}
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
              {submitting ? 'Cataloging...' : 'Catalog Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}