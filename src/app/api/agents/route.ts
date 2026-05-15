import { NextResponse } from 'next/server'
import { listAgents, listCronJobs, listSessions } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [agents, cronJobs, sessions] = await Promise.all([
      listAgents(),
      listCronJobs(),
      listSessions(),
    ])

    // Map each agent to its cron jobs and session status
    const enriched = agents.map(agent => {
      const agentCrons = cronJobs.filter(j => j.agentId === agent.agentId || (agent.agentId === 'main' && !j.agentId))
      const activeSessions = sessions.sessions?.filter(s => s.agentId === agent.agentId) ?? []
      const hasActive = activeSessions.some(s => s.status === 'active' || s.status === 'running')

      return {
        ...agent,
        status: hasActive ? 'online' : (agentCrons.some(j => j.enabled) ? 'idle' : 'offline') as 'online' | 'idle' | 'offline',
        cronJobs: agentCrons.map(j => ({
          id: j.id,
          name: j.name || j.id,
          enabled: j.enabled,
          schedule: j.schedule,
          lastRunAt: j.state?.lastRunAtMs ?? null,
          lastRunStatus: j.state?.lastRunStatus ?? null,
          nextRunAt: j.state?.nextRunAtMs ?? null,
        })),
        activeSessions: activeSessions.length,
      }
    })

    return NextResponse.json({ agents: enriched })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch agents'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}