import { NextResponse } from 'next/server'
import { listSessions, getSessionStatus, checkGatewayConnection } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const gw = await checkGatewayConnection()
    if (!gw.reachable) {
      return NextResponse.json({
        ok: false,
        error: `Gateway not reachable at ${gw.host}:${gw.port}`,
        hint: 'The dashboard must be running on the same machine as the OpenClaw Gateway.',
        sessions: [],
        mainStatus: null,
      }, { status: 503 })
    }

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