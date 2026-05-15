import { NextResponse } from 'next/server'
import { listSessions, getSessionStatus } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [sessions, mainStatus] = await Promise.all([
      listSessions(),
      getSessionStatus('main').catch(() => null),
    ])

    return NextResponse.json({
      ok: true,
      sessions: sessions.sessions,
      mainStatus,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sessions'
    return NextResponse.json({ ok: false, error: message, sessions: [], mainStatus: null }, { status: 500 })
  }
}