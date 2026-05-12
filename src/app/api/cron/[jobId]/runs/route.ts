import { NextRequest, NextResponse } from 'next/server'
import { getCronRuns } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

/** Get runs for a specific cron job */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const runs = await getCronRuns(jobId)
    return NextResponse.json({ ok: true, runs })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch cron runs'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}