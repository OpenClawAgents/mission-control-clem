import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST /api/setup-tables - Create missing tables using direct database connection
// This works by first creating an exec_ddl RPC function, then calling it
export async function POST(request: NextRequest) {
  try {
    // Step 1: Try to create the exec_ddl function using a raw SQL call through the REST API
    // We can't do this directly, so we need to try alternative approaches
    
    // Approach: Use the Supabase Management API with the service key as a personal access token
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
    
    const MIGRATION_SQL = `
-- Create trending_scans table
CREATE TABLE IF NOT EXISTS public.trending_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'general')),
  scan_type TEXT NOT NULL CHECK (scan_type IN ('sounds', 'hashtags', 'challenges', 'creators', 'topics')),
  items JSONB DEFAULT '[]'::jsonb,
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.trending_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage trends" ON public.trending_scans FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view trends" ON public.trending_scans FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_trending_scans_date ON public.trending_scans(scan_date DESC);
    `.trim()

    // Try Supabase Management API
    const mgmtResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    })

    if (mgmtResponse.ok) {
      const result = await mgmtResponse.json()
      return NextResponse.json({ success: true, message: 'Tables created successfully', result })
    }

    const mgmtError = await mgmtResponse.text()
    
    // Fallback: Return SQL for manual execution
    return NextResponse.json({
      error: 'Could not create tables automatically. Supabase Management API requires a personal access token.',
      mgmt_error: mgmtError,
      sql: MIGRATION_SQL,
      supabase_sql_editor_url: `https://supabase.com/dashboard/project/${projectRef}/sql/new`,
      instructions: 'Copy the SQL above and run it in the Supabase SQL Editor linked above.',
    }, { status: 501 })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}

// GET /api/setup-tables - Check if tables exist
export async function GET() {
  try {
    const checks: Record<string, boolean> = {}
    
    for (const table of ['trending_scans', 'growth_metrics', 'priority_channels', 'newsletter_repurpose']) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      })
      checks[table] = res.ok
    }

    // Also check content table for new columns
    const contentRes = await fetch(`${SUPABASE_URL}/rest/v1/content?select=pipeline_stage&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })
    checks['content.pipeline_stage'] = contentRes.ok

    return NextResponse.json({ tables: checks, all_ready: Object.values(checks).every(v => v) })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}