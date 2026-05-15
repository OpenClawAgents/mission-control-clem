/**
 * OpenClaw Gateway HTTP client.
 *
 * Primary: Gateway HTTP API at http://{HOST}:{PORT}/tools/invoke
 * Fallback: CLI (`openclaw`) for operations not available via HTTP
 *
 * On Vercel (no local Gateway), API routes return graceful errors.
 * On the Mac Mini, everything works because the Gateway is local.
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
const DASHBOARD_URL = process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL || ''
// If host is a full domain (Cloudflare tunnel), use HTTPS without port
// Otherwise use local HTTP with the configured port
const GATEWAY_BASE = GATEWAY_HOST.includes('.')
  ? `https://${GATEWAY_HOST}`
  : `http://${GATEWAY_HOST}:${GATEWAY_PORT}`

let _cachedToken: string | undefined

async function getGatewayToken(): Promise<string> {
  if (process.env.OPENCLAW_GATEWAY_TOKEN) return process.env.OPENCLAW_GATEWAY_TOKEN
  if (_cachedToken) return _cachedToken

  // Only read config file on local machine (not Vercel)
  const configPath = join(homedir(), '.openclaw', 'openclaw.json')
  const raw = await readFile(configPath, 'utf-8')
  const config = JSON.parse(raw)
  const token = config?.gateway?.auth?.token
  if (!token) throw new Error('No gateway auth token found in config')
  _cachedToken = token
  return token
}

/** Proxy a CLI command through the local dashboard server */
async function proxyCLICmd(cmd: 'agents' | 'cron' | 'sessions'): Promise<unknown> {
  if (!DASHBOARD_URL) return null
  try {
    const res = await fetch(`${DASHBOARD_URL}/api/cli?cmd=${cmd}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.ok) return json.data
  } catch {
    // Proxy not available
  }
  return null
}

/** Check if Gateway is reachable */
async function isGatewayReachable(): Promise<boolean> {
  try {
    const token = await getGatewayToken()
    const res = await fetch(`${GATEWAY_BASE}/health`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
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

  const result = json.result
  const textContent = result?.content?.find((c: { type: string }) => c.type === 'text')
  const details = result?.details

  if (details !== undefined) return details
  if (textContent?.text) {
    try { return JSON.parse(textContent.text) } catch { return textContent.text }
  }
  return result
}

// ---------------------------------------------------------------------------
// CLI — fallback for operations not available via HTTP API
// ---------------------------------------------------------------------------

async function runCLI(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('openclaw', args, {
    timeout: 15_000,
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  return stdout
}

/** Check if CLI is available */
function isCLIAvailable(): boolean {
  return process.platform !== 'win32' // CLI is available on macOS/Linux
}

// ---------------------------------------------------------------------------
// High-level API — Sessions (via Gateway HTTP)
// ---------------------------------------------------------------------------

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

export async function getSessionStatus(sessionKey: string = 'main') {
  return invokeTool('session_status', 'json', { sessionKey }) as Promise<Record<string, unknown>>
}

/** Get gateway status — tries CLI first, falls back to health check */
export async function getGatewayStatus(): Promise<Record<string, unknown>> {
  try {
    if (isCLIAvailable()) {
      const raw = await runCLI(['status', '--json'])
      try {
        return JSON.parse(raw)
      } catch {
        // Fall through to health check
      }
    }
  } catch {
    // Fall through to health check
  }

  // Fallback: just check if Gateway is reachable
  const reachable = await isGatewayReachable()
  return { status: reachable ? 'online' : 'offline', gateway: { port: GATEWAY_PORT, host: GATEWAY_HOST } }
}

// ---------------------------------------------------------------------------
// Cron management — tries CLI, falls back to Gateway tool
// ---------------------------------------------------------------------------

export interface CronJob {
  id: string
  agentId?: string
  name?: string
  description?: string
  enabled: boolean
  schedule: { kind: string; [key: string]: unknown }
  payload: { kind: string; [key: string]: unknown }
  delivery?: { mode: string; [key: string]: unknown }
  sessionTarget?: string
  state?: {
    lastRunAtMs?: number
    lastRunStatus?: string
    lastError?: string
    nextRunAtMs?: number
    [key: string]: unknown
  }
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

/** List all cron jobs — normalizes fields */
export async function listCronJobs(): Promise<CronJob[]> {
  // Try CLI first (most reliable)
  try {
    if (isCLIAvailable()) {
      const raw = await runCLI(['cron', 'list', '--json'])
      const parsed = JSON.parse(raw)
      const jobs = Array.isArray(parsed) ? parsed : parsed.jobs ?? parsed.data ?? []
      if (jobs.length > 0) {
        return jobs.map((j: Record<string, unknown>) => ({
          ...j,
          agentId: j.agentId ?? undefined,
          state: j.state ?? undefined,
        }))
      }
    }
  } catch {
    // CLI not available or failed
  }

  // Fallback: try Gateway tool
  try {
    const result = await invokeTool('cron', 'list', {}) as { jobs?: CronJob[] }
    return result?.jobs ?? []
  } catch {
    // Gateway tool not available
  }

  // Try proxy through local dashboard server (for Vercel deployments)
  try {
    const data = await proxyCLICmd('cron')
    if (data && typeof data === 'object') {
      // CLI returns { jobs: [...], total, offset, limit, hasMore } or an array
      const jobs = Array.isArray(data) ? data : (data as Record<string, unknown>).jobs as Record<string, unknown>[] | undefined
      if (jobs && jobs.length > 0) {
        return jobs.map((j: Record<string, unknown>) => ({
          ...j,
          agentId: (j.agentId as string | undefined) ?? undefined,
          state: (j.state as Record<string, unknown> | undefined) ?? undefined,
        } as CronJob))
      }
    }
  } catch {
    // Proxy not available
  }

  return []
}

/** Get runs for a cron job */
export async function getCronRuns(jobId: string): Promise<CronRun[]> {
  try {
    if (isCLIAvailable()) {
      const raw = await runCLI(['cron', 'runs', jobId, '--json'])
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : parsed.runs ?? parsed.data ?? []
    }
  } catch {
    // Fall through
  }

  try {
    const result = await invokeTool('cron', 'runs', { jobId }) as { runs?: CronRun[] }
    return result?.runs ?? []
  } catch {
    return []
  }
}

/** Enable or disable a cron job */
export async function setJobEnabled(jobId: string, enabled: boolean): Promise<void> {
  try {
    if (isCLIAvailable()) {
      await runCLI(['cron', 'update', jobId, '--json', JSON.stringify({ enabled })])
      return
    }
  } catch {
    // Fall through
  }
  await invokeTool('cron', 'update', { jobId, enabled })
}

/** Run a cron job immediately */
export async function runCronJob(jobId: string): Promise<void> {
  try {
    if (isCLIAvailable()) {
      await runCLI(['cron', 'run', jobId])
      return
    }
  } catch {
    // Fall through
  }
  await invokeTool('cron', 'run', { jobId })
}

/** Delete a cron job */
export async function deleteCronJob(jobId: string): Promise<void> {
  try {
    if (isCLIAvailable()) {
      await runCLI(['cron', 'remove', jobId])
      return
    }
  } catch {
    // Fall through
  }
  await invokeTool('cron', 'remove', { jobId })
}

/** Create a new cron job */
export async function createCronJob(opts: { name: string; schedule: string; message: string }): Promise<unknown> {
  // Try CLI first
  try {
    if (isCLIAvailable()) {
      const raw = await runCLI(['cron', 'add', '--json', JSON.stringify({
        name: opts.name,
        schedule: { kind: 'cron', expr: opts.schedule, tz: 'America/Chicago' },
        payload: { kind: 'agentTurn', message: opts.message, lightContext: true },
        delivery: { mode: 'announce' },
        sessionTarget: 'isolated',
        enabled: true,
      })])
      try { return JSON.parse(raw) } catch { return { ok: true } }
    }
  } catch {
    // Fall through
  }

  // Fallback: Gateway tool
  return invokeTool('cron', 'add', {
    name: opts.name,
    schedule: { kind: 'cron', expr: opts.schedule, tz: 'America/Chicago' },
    payload: { kind: 'agentTurn', message: opts.message, lightContext: true },
    delivery: { mode: 'announce' },
    sessionTarget: 'isolated',
    enabled: true,
  })
}

// ---------------------------------------------------------------------------
// Agent management
// ---------------------------------------------------------------------------

export interface AgentInfo {
  agentId: string
  name?: string
  emoji?: string
  workspace?: string
  model?: string
  routing?: Record<string, unknown>
}

/** List all configured agents — normalizes 'id' field to 'agentId' */
export async function listAgents(): Promise<AgentInfo[]> {
  // CLI is the primary way to list agents
  try {
    if (isCLIAvailable()) {
      const raw = await runCLI(['agents', 'list', '--json'])
      const parsed = JSON.parse(raw)
      const agents = Array.isArray(parsed) ? parsed : parsed.agents ?? parsed.data ?? []
      return agents.map((a: Record<string, unknown>) => ({
        agentId: a.agentId ?? a.id,
        name: (a.identityName as string) ?? (a.name as string) ?? (a.id as string),
        emoji: (a.identityEmoji as string) ?? (a.emoji as string),
        workspace: a.workspace as string | undefined,
        model: a.model as string | undefined,
        routing: a.routing as Record<string, unknown> | undefined,
      }))
    }
  } catch {
    // CLI not available
  }

  // Try Gateway HTTP
  try {
    const result = await invokeTool('agents', 'list', {})
    const agents = Array.isArray(result) ? result : (result as Record<string, unknown>)?.agents ?? (result as Record<string, unknown>)?.data ?? []
    return (agents as Record<string, unknown>[]).map((a: Record<string, unknown>) => ({
      agentId: (a.agentId as string) ?? (a.id as string),
      name: (a.identityName as string) ?? (a.name as string) ?? (a.id as string),
      emoji: (a.identityEmoji as string) ?? (a.emoji as string),
      workspace: a.workspace as string | undefined,
      model: a.model as string | undefined,
      routing: a.routing as Record<string, unknown> | undefined,
    }))
  } catch {
    // Gateway doesn't support agents tool
  }

  // Try proxy through local dashboard server (for Vercel deployments)
  try {
    const data = await proxyCLICmd('agents')
    if (data && typeof data === 'object') {
      // CLI returns an array of agents
      const agents = Array.isArray(data) ? data : (data as Record<string, unknown>).agents as Record<string, unknown>[] | undefined
      if (agents && agents.length > 0) {
        return agents.map((a: Record<string, unknown>) => ({
          agentId: (a.agentId as string) ?? (a.id as string),
          name: (a.identityName as string) ?? (a.name as string) ?? (a.id as string),
          emoji: (a.identityEmoji as string) ?? (a.emoji as string),
          workspace: a.workspace as string | undefined,
          model: a.model as string | undefined,
          routing: a.routing as Record<string, unknown> | undefined,
        }))
      }
    }
  } catch {
    // Proxy not available
  }

  return []
}

// ---------------------------------------------------------------------------
// Gateway reachability check
// ---------------------------------------------------------------------------

export async function checkGatewayConnection(): Promise<{
  reachable: boolean
  host: string
  port: number
  baseUrl: string
  error?: string
}> {
  try {
    const reachable = await isGatewayReachable()
    return { reachable, host: GATEWAY_HOST, port: GATEWAY_PORT, baseUrl: GATEWAY_BASE }
  } catch (err) {
    return {
      reachable: false,
      host: GATEWAY_HOST,
      port: GATEWAY_PORT,
      baseUrl: GATEWAY_BASE,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}