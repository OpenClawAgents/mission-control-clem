/**
 * OpenClaw Gateway HTTP client.
 *
 * The Gateway runs locally at http://127.0.0.1:{GATEWAY_PORT}.
 * Auth uses a bearer token from OPENCLAW_GATEWAY_TOKEN env var or the
 * local config file at ~/.openclaw/openclaw.json.
 *
 * Two access paths:
 * 1. `/tools/invoke` — direct tool invocation (always enabled, but blocks
 *    cron/exec/sessions_spawn/etc for security)
 * 2. CLI — `openclaw cron ...` for privileged operations
 */

import { execFile } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GATEWAY_PORT = Number(process.env.OPENCLAW_GATEWAY_PORT || 18789)
const GATEWAY_HOST = process.env.OPENCLAW_GATEWAY_HOST || '127.0.0.1'
const GATEWAY_BASE = `http://${GATEWAY_HOST}:${GATEWAY_PORT}`

let _cachedToken: string | undefined

async function getGatewayToken(): Promise<string> {
  if (process.env.OPENCLAW_GATEWAY_TOKEN) return process.env.OPENCLAW_GATEWAY_TOKEN
  if (_cachedToken) return _cachedToken

  const configPath = join(homedir(), '.openclaw', 'openclaw.json')
  const raw = await readFile(configPath, 'utf-8')
  const config = JSON.parse(raw)
  const token = config?.gateway?.auth?.token
  if (!token) throw new Error('No gateway auth token found in config')
  _cachedToken = token
  return token
}

// ---------------------------------------------------------------------------
// /tools/invoke — direct tool calls
// ---------------------------------------------------------------------------

export async function invokeTool(tool: string, action: string, args: Record<string, unknown> = {}) {
  const token = await getGatewayToken()
  const res = await fetch(`${GATEWAY_BASE}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tool, action, args }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gateway ${res.status}: ${text}`)
  }

  const json = await res.json()
  if (!json.ok) {
    throw new Error(json.error?.message || `Tool error: ${json.error?.type || 'unknown'}`)
  }

  // Tool results come back as { ok, result: { content: [{ type, text }], details } }
  const result = json.result
  const textContent = result?.content?.find((c: { type: string }) => c.type === 'text')
  const details = result?.details

  // Prefer structured details; fall back to parsed text content
  if (details !== undefined) return details
  if (textContent?.text) {
    try { return JSON.parse(textContent.text) } catch { return textContent.text }
  }
  return result
}

// ---------------------------------------------------------------------------
// CLI — for privileged operations (cron, etc.)
// ---------------------------------------------------------------------------

async function runCLI(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('openclaw', args, {
    timeout: 15_000,
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  return stdout
}

// ---------------------------------------------------------------------------
// High-level API
// ---------------------------------------------------------------------------

/** List active sessions */
export async function listSessions() {
  return invokeTool('sessions_list', 'json', {}) as Promise<{
    count: number
    sessions: Array<{
      key: string
      agentId: string
      kind: string
      channel: string
      model: string
      status: string
      startedAt: number
      updatedAt: number
      totalTokens: number
      contextTokens: number
      estimatedCostUsd: number
    }>
  }>
}

/** Get session status for a given session key */
export async function getSessionStatus(sessionKey: string = 'main') {
  return invokeTool('session_status', 'json', { sessionKey }) as Promise<Record<string, unknown>>
}

/** Search memory */
export async function searchMemory(query: string) {
  return invokeTool('memory_search', 'json', { query }) as Promise<unknown>
}

/** Get gateway status via CLI — returns raw JSON from `openclaw status --json` */
export async function getGatewayStatus(): Promise<Record<string, unknown>> {
  const raw = await runCLI(['status', '--json'])
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Could not parse gateway status')
  }
}

// ---------------------------------------------------------------------------
// Cron management via CLI
// ---------------------------------------------------------------------------

export interface CronJob {
  id: string
  name?: string
  description?: string
  enabled: boolean
  schedule: { kind: string; [key: string]: unknown }
  payload: { kind: string; [key: string]: unknown }
  delivery?: { mode: string; [key: string]: unknown }
  sessionTarget?: string
  lastRunAt?: number
  nextRunAt?: number
}

export interface CronRun {
  id: string
  jobId: string
  startedAt: number
  completedAt?: number
  status: string
  error?: string
}

/** List all cron jobs */
export async function listCronJobs(): Promise<CronJob[]> {
  const raw = await runCLI(['cron', 'list', '--json'])
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : parsed.jobs ?? parsed.data ?? []
  } catch {
    // CLI may output "No cron jobs." when empty
    return []
  }
}

/** Get runs for a cron job */
export async function getCronRuns(jobId: string): Promise<CronRun[]> {
  const raw = await runCLI(['cron', 'runs', jobId, '--json'])
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : parsed.runs ?? parsed.data ?? []
  } catch {
    return []
  }
}

/** Enable or disable a cron job */
export async function setJobEnabled(jobId: string, enabled: boolean): Promise<void> {
  await runCLI(['cron', 'update', jobId, '--json', JSON.stringify({ enabled })])
}

/** Run a cron job immediately */
export async function runCronJob(jobId: string): Promise<void> {
  await runCLI(['cron', 'run', jobId])
}

/** Delete a cron job */
export async function deleteCronJob(jobId: string): Promise<void> {
  await runCLI(['cron', 'remove', jobId])
}

/** Create a new cron job via the Gateway tool API */
export async function createCronJob(opts: { name: string; schedule: string; message: string }): Promise<unknown> {
  return invokeTool('cron', 'add', {
    name: opts.name,
    schedule: { kind: 'cron', expr: opts.schedule, tz: 'America/Chicago' },
    payload: { kind: 'agentTurn', message: opts.message, lightContext: true },
    delivery: { mode: 'announce' },
    sessionTarget: 'isolated',
    enabled: true,
  })
}