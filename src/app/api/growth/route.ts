import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/growth - List growth metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const days = parseInt(searchParams.get('days') || '30')

    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().split('T')[0]

    let url = `${SUPABASE_URL}/rest/v1/growth_metrics?select=*&order=date.desc`
    if (platform) url += `&platform=eq.${platform}`
    url += `&date=gte.${sinceStr}`

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to fetch growth metrics', details: error }, { status: res.status })
    }

    const metrics = await res.json()

    // Calculate summary
    const summary = {
      total_followers: metrics.reduce((max: number, m: { followers: number }) => Math.max(max, m.followers || 0), 0),
      total_gained: metrics.reduce((sum: number, m: { followers_gained: number }) => sum + (m.followers_gained || 0), 0),
      avg_engagement: metrics.length > 0
        ? metrics.reduce((sum: number, m: { engagement_rate: number }) => sum + (m.engagement_rate || 0), 0) / metrics.filter((m: { engagement_rate: number }) => m.engagement_rate).length
        : 0,
      platforms: [...new Set(metrics.map((m: { platform: string }) => m.platform))],
      days_tracked: days,
    }

    return NextResponse.json({ metrics, summary, count: metrics.length })
  } catch (error) {
    console.error('Growth metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/growth - Add growth metrics entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, date, platform, followers, followers_gained, impressions, reach, engagement_rate, posts_count, notes } = body

    if (!user_id || !date || !platform) {
      return NextResponse.json({ error: 'user_id, date, and platform are required' }, { status: 400 })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/growth_metrics`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id,
        date,
        platform,
        followers: followers || null,
        followers_gained: followers_gained || 0,
        impressions: impressions || 0,
        reach: reach || 0,
        engagement_rate: engagement_rate || null,
        posts_count: posts_count || 0,
        notes: notes || null,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to create growth metric', details: error }, { status: res.status })
    }

    const created = await res.json()
    return NextResponse.json(created[0] || created, { status: 201 })
  } catch (error) {
    console.error('Growth metric creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}