'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/dashboard')
      } else {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGitHubSignIn = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (!error && data.url) {
      window.location.href = data.url
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF2DA0]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[14px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mc-bubble mb-4">
            <span className="mc-text-gradient text-f-xl font-bold tracking-[0.15em] uppercase">MC</span>
            <span className="text-f-sm font-medium text-white/50 tracking-[0.1em] uppercase ml-1">Clem</span>
          </div>
          <p className="text-f-base text-white/40">Mission Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-f-base text-white/65 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#FF2DA0]/40 focus:ring-1 focus:ring-[#FF2DA0]/20 px-4 py-3 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-f-base text-white/65 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[#FF2DA0]/40 focus:ring-1 focus:ring-[#FF2DA0]/20 px-4 py-3 outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-400 text-f-base">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] bg-[#FF2DA0]/15 text-white font-medium py-3 hover:bg-[#FF2DA0]/25 border border-[#FF2DA0]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-f-sm">
            <span className="px-4 bg-[#080C14] text-white/30">or</span>
          </div>
        </div>

        <button
          onClick={handleGitHubSignIn}
          className="w-full rounded-[12px] border border-white/[0.08] bg-white/[0.03] text-white/70 font-medium py-3 hover:bg-white/[0.06] hover:text-white transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  )
}