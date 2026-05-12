import { NextResponse } from 'next/server'
import { getGatewayStatus } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Try CLI status first (most detailed)
    const status = await getGatewayStatus()
    return NextResponse.json({ ok: true, ...status })
  } catch {
    // Fallback: basic liveness check via /tools/invoke
    try {
      const { listSessions } = await import('@/lib/openclaw')
      await listSessions()
      return NextResponse.json({
        ok: true,
        overview: { state: 'running' },
        sessions: [],
        channels: [],
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gateway unreachable'
      return NextResponse.json({ ok: false, error: message }, { status: 503 })
    }
  }
}