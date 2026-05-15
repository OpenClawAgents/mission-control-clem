import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Semantic search endpoint — queries content_embeddings via Supabase RPC
// For now returns content search results; embeddings are generated on content creation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type, tags, limit = 10 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    // For now, do a text-based search on content table
    // When embeddings are set up, this will use the search_content RPC
    let searchUrl = `${SUPABASE_URL}/rest/v1/content?select=id,title,type,status,tags,source_url,created_at,updated_at&order=updated_at.desc&limit=${limit}`

    // Add type filter
    if (type) {
      searchUrl += `&type=eq.${type}`
    }

    // Text search on title and body
    const orConditions = [`title.ilike.%${encodeURIComponent(query)}%`]
    if (tags && Array.isArray(tags) && tags.length > 0) {
      orConditions.push(`tags.cs.{${tags.join(',')}}`)
    }

    searchUrl += `&or=${orConditions.join(',')}`

    const res = await fetch(searchUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: 'Search failed', details: error }, { status: 500 })
    }

    const results = await res.json()
    return NextResponse.json({ results, query, count: results.length })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}