import { NextRequest, NextResponse } from 'next/server'
import { listCronJobs, runCronJob, setJobEnabled, deleteCronJob, createCronJob, checkGatewayConnection } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

/** List all cron jobs */
export async function GET() {
  try {
    const gw = await checkGatewayConnection()
    if (!gw.reachable) {
      return NextResponse.json({
        ok: false,
        error: `Gateway not reachable at ${gw.host}:${gw.port}`,
        hint: 'The dashboard must be running on the same machine as the OpenClaw Gateway.',
        jobs: [],
      }, { status: 503 })
    }

    const jobs = await listCronJobs()
    return NextResponse.json({ ok: true, jobs })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list cron jobs'
    return NextResponse.json({ ok: false, error: message, jobs: [] }, { status: 500 })
  }
}

/** Actions: run, enable/disable, create, remove */
export async function POST(request: NextRequest) {
  try {
    const gw = await checkGatewayConnection()
    if (!gw.reachable) {
      return NextResponse.json({
        ok: false,
        error: `Gateway not reachable at ${gw.host}:${gw.port}`,
      }, { status: 503 })
    }

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

    if (action === 'create') {
      const { name, schedule, message } = body as { action: string; name?: string; schedule?: string; message?: string }
      if (!name || !schedule || !message) {
        return NextResponse.json({ ok: false, error: 'Missing required fields: name, schedule, message' }, { status: 400 })
      }
      const job = await createCronJob({ name, schedule, message })
      return NextResponse.json({ ok: true, action: 'create', job })
    }

    if (action === 'remove' && jobId) {
      await deleteCronJob(jobId)
      return NextResponse.json({ ok: true, action: 'remove', jobId })
    }

    return NextResponse.json({ ok: false, error: 'Invalid action. Use: run, setEnabled, remove, create' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to perform cron action'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}