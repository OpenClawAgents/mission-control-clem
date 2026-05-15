import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export const dynamic = 'force-dynamic'

/**
 * GET /api/cli
 * 
 * Proxies CLI commands for remote deployments (Vercel) that can't run `openclaw` locally.
 * Supported commands: agents, cron, sessions
 * 
 * Query params:
 *   cmd=agents  → openclaw agents list --json
 *   cmd=cron    → openclaw cron list --json
 *   cmd=sessions → openclaw sessions list --json
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cmd = searchParams.get('cmd')

  const allowedCommands = ['agents', 'cron', 'sessions']
  if (!cmd || !allowedCommands.includes(cmd)) {
    return NextResponse.json({ ok: false, error: `Invalid command. Allowed: ${allowedCommands.join(', ')}` }, { status: 400 })
  }

  try {
    let cliArgs: string[]
    switch (cmd) {
      case 'agents':
        cliArgs = ['agents', 'list', '--json']
        break
      case 'cron':
        cliArgs = ['cron', 'list', '--json']
        break
      case 'sessions':
        cliArgs = ['sessions', 'list', '--json']
        break
      default:
        return NextResponse.json({ ok: false, error: 'Invalid command' }, { status: 400 })
    }

    const { stdout } = await execFileAsync('openclaw', cliArgs, {
      timeout: 15000,
      env: { ...process.env, FORCE_COLOR: '0' },
    })

    try {
      const data = JSON.parse(stdout)
      return NextResponse.json({ ok: true, data })
    } catch {
      return NextResponse.json({ ok: false, error: 'Failed to parse CLI output', raw: stdout.slice(0, 500) }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'CLI command failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}