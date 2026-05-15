import { NextResponse } from 'next/server'
import { listAgents } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

/**
 * GET /api/agents/local
 * 
 * Returns the agent list from CLI (local-only).
 * This endpoint is used by the Vercel deployment to proxy
 * agent data through the dashboard tunnel, since Vercel
 * can't run `openclaw` CLI directly.
 */
export async function GET() {
  try {
    const agents = await listAgents()
    return NextResponse.json({ ok: true, agents })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch agents'
    return NextResponse.json({ ok: false, error: message, agents: [] }, { status: 500 })
  }
}