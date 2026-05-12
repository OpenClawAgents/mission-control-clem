import { NextResponse } from 'next/server'
import { getGatewayStatus } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = await getGatewayStatus()

    // Extract structured data from the CLI status output
    const result: Record<string, unknown> = {
      ok: true,
      runtimeVersion: status.runtimeVersion,
      heartbeat: status.heartbeat,
      tasks: status.tasks,
      sessions: status.sessions,
      channelSummary: status.channelSummary,
    }

    // Try to extract uptime from gatewayService
    const gs = (status as Record<string, unknown>).gatewayService as Record<string, unknown> | undefined
    if (gs?.runtime) {
      const runtime = gs.runtime as Record<string, unknown>
      result.gatewayStatus = runtime.status
      result.gatewayPid = runtime.pid
    }
    if (gs?.runtimeShort) {
      // runtimeShort contains uptime info like "running (pid 73006, 4h 6m uptime)"
      result.uptime = String(gs.runtimeShort)
    }

    // Gateway connection info
    const gw = (status as Record<string, unknown>).gateway as Record<string, unknown> | undefined
    if (gw) {
      result.gatewayMode = gw.mode
      result.gatewayReachable = gw.reachable
      result.gatewayLatency = gw.connectLatencyMs
      const self = gw.self as Record<string, unknown> | undefined
      if (self) {
        result.host = self.host
        result.platform = self.platform
      }
    }

    // OS info
    const os = (status as Record<string, unknown>).os as Record<string, unknown> | undefined
    if (os) {
      result.osPlatform = os.platform
      result.osArch = os.arch
      result.osRelease = os.release
    }

    return NextResponse.json(result)
  } catch {
    // Fallback: basic liveness check
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