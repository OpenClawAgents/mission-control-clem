import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/digests - List digests with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const date = searchParams.get('date')
    const limit = searchParams.get('limit') || '50'

    let url = `${SUPABASE_URL}/rest/v1/digests?select=*&order=date.desc&limit=${limit}`

    if (category) {
      url += `&category=eq.${category}`
    }

    if (date) {
      url += `&date=eq.${date}`
    }

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to fetch digests', details: error }, { status: res.status })
    }

    const digests = await res.json()
    return NextResponse.json({ digests, count: digests.length })
  } catch (error) {
    console.error('Digest list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/digests - Create a new digest entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, date, category, summary, source_url, source_name, is_sent, user_id } = body

    if (!title || !date || !category || !summary || !user_id) {
      return NextResponse.json(
        { error: 'title, date, category, summary, and user_id are required' },
        { status: 400 }
      )
    }

    const validCategories = ['psychedelic_law', 'church', 'dea', 'state_reform', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/digests`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id,
        title,
        date,
        category,
        summary,
        source_url: source_url || null,
        source_name: source_name || null,
        is_sent: is_sent || false,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to create digest', details: error }, { status: res.status })
    }

    const created = await res.json()
    return NextResponse.json(created[0] || created, { status: 201 })
  } catch (error) {
    console.error('Digest creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}