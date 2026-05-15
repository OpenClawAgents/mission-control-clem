import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// POST /api/content - Create a new content item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, status, body: contentBody, tags, source_url, user_id } = body

    if (!title || !type || !user_id) {
      return NextResponse.json(
        { error: 'title, type, and user_id are required' },
        { status: 400 }
      )
    }

    const validTypes = ['newsletter', 'script', 'social_post', 'research', 'digest', 'video_clip', 'draft']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const insertBody: Record<string, unknown> = {
      user_id,
      title,
      type,
      status: status || 'draft',
      tags: tags || [],
    }

    if (contentBody) insertBody.body = contentBody
    if (source_url) insertBody.source_url = source_url

    const res = await fetch(`${SUPABASE_URL}/rest/v1/content`, {
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
      return NextResponse.json({ error: 'Failed to create content', details: error }, { status: res.status })
    }

    const created = await res.json()
    return NextResponse.json(created[0] || created, { status: 201 })
  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/content - Update a content item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to update content', details: error }, { status: res.status })
    }

    const updated = await res.json()
    return NextResponse.json(updated[0] || updated)
  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/content - Delete a content item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to delete content', details: error }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}