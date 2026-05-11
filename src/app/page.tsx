import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 text-6xl">🎬</div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Mission Control
        </h1>
        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
          Content creation, research, and video management.
          <br />
          Built for Clementine &amp; Astra.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
          <a
            href="https://github.com/OpenClawAgents/mission-control-clem"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-gray-500 hover:text-white transition-colors"
          >
            View Source
          </a>
        </div>
      </div>
    </main>
  );
}