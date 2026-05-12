import { NextRequest, NextResponse } from 'next/server'
import { listCronJobs, runCronJob, setJobEnabled, deleteCronJob } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

/** List all cron jobs */
export async function GET() {
  try {
    const jobs = await listCronJobs()
    return NextResponse.json({ ok: true, jobs })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list cron jobs'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

/** Actions: run, enable/disable */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, jobId, enabled } = body as { action: string; jobId?: string; enabled?: boolean }

    if (action === 'run' && jobId) {
      await runCronJob(jobId)
      return NextResponse.json({ ok: true, action: 'run', jobId })
    }

    if (action === 'setEnabled' && jobId && typeof enabled === 'boolean') {
      await setJobEnabled(jobId, enabled)
      return NextResponse.json({ ok: true, action: 'setEnabled', jobId, enabled })
    }

    if (action === 'remove' && jobId) {
      await deleteCronJob(jobId)
      return NextResponse.json({ ok: true, action: 'remove', jobId })
    }

    return NextResponse.json({ ok: false, error: 'Invalid action. Use: run, setEnabled, remove' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to perform cron action'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}