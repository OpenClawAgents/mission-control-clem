import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/trending - List trending scan results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const scanType = searchParams.get('type')
    const days = parseInt(searchParams.get('days') || '7')

    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString()

    let url = `${SUPABASE_URL}/rest/v1/trending_scans?select=*&order=scan_date.desc`
    if (platform) url += `&platform=eq.${platform}`
    if (scanType) url += `&scan_type=eq.${scanType}`
    url += `&scan_date=gte.${sinceStr}`

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to fetch trending scans', details: error }, { status: res.status })
    }

    const scans = await res.json()
    return NextResponse.json({ scans, count: scans.length })
  } catch (error) {
    console.error('Trending scan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/trending - Create a trending scan entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, scan_type, items, source_url, notes } = body

    if (!platform || !scan_type || !items) {
      return NextResponse.json({ error: 'platform, scan_type, and items are required' }, { status: 400 })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/trending_scans`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        platform,
        scan_type,
        items,
        source_url: source_url || null,
        notes: notes || null,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to create trending scan', details: error }, { status: res.status })
    }

    const created = await res.json()
    return NextResponse.json(created[0] || created, { status: 201 })
  } catch (error) {
    console.error('Trending scan creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}