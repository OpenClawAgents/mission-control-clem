import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen gradient-mesh flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 text-6xl">🎬</div>
        <h1 className="text-f-4xl font-bold text-white mb-4 tracking-tight">
          Mission Control
        </h1>
        <p className="text-f-lg text-white/65 mb-8 leading-relaxed">
          Content creation, research, and video management.<br />
          Built for Clementine & Astra.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-[#FF2DA0]/15 text-white font-semibold rounded-[12px] border border-[#FF2DA0]/20 hover:bg-[#FF2DA0]/25 transition-all"
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