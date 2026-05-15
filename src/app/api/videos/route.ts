import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// POST /api/videos - Catalog a new video (called by ingest watcher or manual upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, file_path, duration_seconds, resolution, tags, transcript, metadata, user_id } = body

    if (!title || !user_id) {
      return NextResponse.json(
        { error: 'title and user_id are required' },
        { status: 400 }
      )
    }

    const insertBody: Record<string, unknown> = {
      user_id,
      title,
      file_path: file_path || null,
      duration_seconds: duration_seconds || null,
      resolution: resolution || null,
      tags: tags || [],
      transcript: transcript || null,
      metadata: metadata || {},
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/videos`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(insertBody),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to catalog video', details: error }, { status: res.status })
    }

    const created = await res.json()

    // Log to ingest log
    await fetch(`${SUPABASE_URL}/rest/v1/video_ingest_log`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: title,
        file_path: file_path || '',
        status: 'completed',
        video_id: created[0]?.id,
      }),
    })

    return NextResponse.json(created[0] || created, { status: 201 })
  } catch (error) {
    console.error('Video catalog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/videos - List videos with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '50'

    let url = `${SUPABASE_URL}/rest/v1/videos?select=*&order=created_at.desc&limit=${limit}`

    if (tag) {
      url += `&tags=cs.{${tag}}`
    }

    if (search) {
      url += `&title=ilike.%${encodeURIComponent(search)}%`
    }

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to fetch videos', details: error }, { status: res.status })
    }

    const videos = await res.json()
    return NextResponse.json({ videos, count: videos.length })
  } catch (error) {
    console.error('Video list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}