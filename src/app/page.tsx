import Link from 'next/link'
import { Play } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen gradient-mesh flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-[16px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
            <Play className="h-7 w-7 text-[#F59E0B] fill-[#F59E0B]" />
          </div>
        </div>
        <h1 className="text-f-4xl font-bold text-white mb-4 tracking-tight">
          Mission Control
        </h1>
        <p className="text-f-lg text-white/65 mb-2 leading-relaxed">
          Content creation, research, and video management.
        </p>
        <p className="text-f-base text-white/40 mb-8">
          Built for Clementine & Astra.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-[#F59E0B]/15 text-white font-semibold rounded-[12px] border border-[#F59E0B]/20 hover:bg-[#F59E0B]/25 transition-all"
          >
            Sign In
          </Link>
          <a
            href="https://github.com/OpenClawAgents/mission-control-clem"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-white/[0.08] text-white/70 font-semibold rounded-[12px] hover:border-white/[0.15] hover:text-white transition-all"
          >
            View Source
          </a>
        </div>
      </div>
    </main>
  )
}