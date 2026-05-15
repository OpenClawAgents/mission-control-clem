import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/repurpose - List repurposed content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') || '50'

    let url = `${SUPABASE_URL}/rest/v1/newsletter_repurpose?select=*&order=created_at.desc&limit=${limit}`
    if (status) url += `&status=eq.${status}`

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Failed to fetch repurposed content', details: error }, { status: res.status })
    }

    const items = await res.json()
    return NextResponse.json({ items, count: items.length })
  } catch (error) {
    console.error('Repurpose list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/repurpose - Create a new repurpose entry (from a newsletter)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source_content_id, user_id, source_title, source_theme, reel_scripts, carousel_posts, short_captions, theme_tags, recommended_format } = body

    if (!user_id || !source_title) {
      return NextResponse.json({ error: 'user_id and source_title are required' }, { status: 400 })
    }

    const insertBody: Record<string, unknown> = {
      user_id,
      source_title,
      source_theme: source_theme || null,
      source_content_id: source_content_id || null,
      reel_scripts: reel_scripts || [],
      carousel_posts: carousel_posts || [],
      short_captions: short_captions || [],
      theme_tags: theme_tags || [],
      recommended_format: recommended_format || null,
      status: 'draft',
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_repurpose`, {
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
      return NextResponse.json({ error: 'Failed to create repurpose entry', details: error }, { status: res.status })
    }

    const created = await res.json()

    // Also create content pipeline entries for each generated asset
    if (reel_scripts?.length > 0) {
      for (const script of reel_scripts) {
        await fetch(`${SUPABASE_URL}/rest/v1/content`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id,
            title: `Reel: ${script.hook || source_title}`,
            type: 'script',
            status: 'draft',
            pipeline_stage: 'script',
            source_content_id: source_content_id || null,
            repurpose_type: 'reel_script',
            tags: theme_tags || [],
            body: script,
          }),
        })
      }
    }

    if (carousel_posts?.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/content`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          title: `Carousel: ${source_title}`,
          type: 'social_post',
          status: 'draft',
          pipeline_stage: 'idea',
          source_content_id: source_content_id || null,
          repurpose_type: 'carousel',
          tags: theme_tags || [],
          body: { slides: carousel_posts },
        }),
      })
    }

    if (short_captions?.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/content`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          title: `Captions: ${source_title}`,
          type: 'social_post',
          status: 'draft',
          pipeline_stage: 'idea',
          source_content_id: source_content_id || null,
          repurpose_type: 'caption',
          tags: theme_tags || [],
          body: { captions: short_captions },
        }),
      })
    }

    return NextResponse.json(created[0] || created, { status: 201 })
  } catch (error) {
    console.error('Repurpose creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}