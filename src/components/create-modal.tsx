'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

interface Field {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'number'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: string
  rows?: number
}

interface CreateModalProps {
  triggerLabel: string
  triggerIcon?: typeof Plus
  title: string
  description: string
  fields: Field[]
  onSubmit: (values: Record<string, string>) => Promise<void>
  defaultValues?: Record<string, string>
}

export function CreateModal({
  triggerLabel,
  triggerIcon: TriggerIcon = Plus,
  title,
  description,
  fields,
  onSubmit,
  defaultValues,
}: CreateModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    fields.forEach((f) => {
      init[f.name] = defaultValues?.[f.name] || f.defaultValue || ''
    })
    return init
  })
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(values)
      setOpen(false)
      // Reset form
      const init: Record<string, string> = {}
      fields.forEach((f) => {
        init[f.name] = defaultValues?.[f.name] || f.defaultValue || ''
      })
      setValues(init)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#F59E0B]/15 text-white hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 px-4 py-2 text-f-base font-medium transition-all"
          />
        }
      >
        <TriggerIcon className="h-4 w-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0B0B0F] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-white/50">{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-f-sm text-white/60 mb-1.5">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name] || ''}
                  onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 3}
                  className="w-full rounded-[10px] bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-f-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all resize-none"
                />
              ) : field.type === 'select' ? (
                <select
                  value={values[field.name] || ''}
                  onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                  required={field.required}
                  className="w-full rounded-[10px] bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-f-base text-white focus:outline-none focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all appearance-none"
                >
                  <option value="" className="bg-[#0B0B0F]">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0B0B0F]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.name] || ''}
                  onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full rounded-[10px] bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-f-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all"
                />
              )}
            </div>
          ))}
          {error && (
            <p className="text-f-sm text-[#EF4444]">{error}</p>
          )}
          <DialogFooter>
            <DialogClose
              render={<Button variant="ghost" className="text-white/60 hover:text-white" />}
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#F59E0B] text-black hover:bg-[#F59E0B]/80 rounded-[10px]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}