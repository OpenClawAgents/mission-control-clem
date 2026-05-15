'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid password')
      }
    } catch {
      setError('Connection error. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-[14px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <Play className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-f-lg font-bold tracking-[0.1em] uppercase bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/70 bg-clip-text text-transparent">Mission Control</span>
          </div>
          <p className="text-f-base text-white/40">Clementine & Astra</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-f-base text-white/65 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#F59E0B]/40 focus:ring-1 focus:ring-[#F59E0B]/20 px-4 py-3 pr-10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-f-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-[12px] bg-[#F59E0B]/15 text-white font-medium py-3 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Enter Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}