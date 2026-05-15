import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MIGRATION_SQL = `
-- Mission Control Clem - Content Pipeline Migration
-- Creates: trending_scans, growth_metrics, priority_channels, newsletter_repurpose tables
-- and adds columns to content table

ALTER TABLE public.content ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'idea'
  CHECK (pipeline_stage IN ('idea', 'script', 'filming', 'editing', 'scheduled', 'published', 'tracking'));
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS source_content_id UUID REFERENCES public.content(id);
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS repurpose_type TEXT
  CHECK (repurpose_type IS NULL OR repurpose_type IN ('reel_script', 'carousel', 'caption', 'newsletter_repurpose', 'long_form'));

CREATE TABLE IF NOT EXISTS public.newsletter_repurpose (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_title TEXT NOT NULL,
  source_theme TEXT,
  reel_scripts JSONB DEFAULT '[]'::jsonb,
  carousel_posts JSONB DEFAULT '[]'::jsonb,
  short_captions JSONB DEFAULT '[]'::jsonb,
  theme_tags TEXT[] DEFAULT '{}',
  recommended_format TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.newsletter_repurpose ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage repurpose" ON public.newsletter_repurpose FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view repurpose" ON public.newsletter_repurpose FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.growth_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'newsletter', 'other')),
  followers INTEGER,
  followers_gained INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate FLOAT,
  posts_count INTEGER DEFAULT 0,
  top_post_id TEXT,
  top_post_views INTEGER DEFAULT 0,
  top_post_engagement FLOAT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, platform, user_id)
);
ALTER TABLE public.growth_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage growth" ON public.growth_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view growth" ON public.growth_metrics FOR SELECT USING (true);

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

CREATE TABLE IF NOT EXISTS public.priority_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  scan_frequency TEXT DEFAULT 'daily' CHECK (scan_frequency IN ('daily', 'weekly', 'manual')),
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.priority_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage channels" ON public.priority_channels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view channels" ON public.priority_channels FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_content_pipeline_stage ON public.content(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_content_source ON public.content(source_content_id);
CREATE INDEX IF NOT EXISTS idx_content_repurpose_type ON public.content(repurpose_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_repurpose_source ON public.newsletter_repurpose(source_content_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_repurpose_status ON public.newsletter_repurpose(status);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date ON public.growth_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_platform ON public.growth_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_trending_scans_date ON public.trending_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_priority_channels_platform ON public.priority_channels(platform);
`;

// POST /api/migrate - Run migration 003
export async function POST(request: NextRequest) {
  try {
    // Use the Supabase Management API database query endpoint
    // This requires the project ref and service role key
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
    
    // Try the Supabase Management API /database/query endpoint
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
      return NextResponse.json({ success: true, migration: '003_content_pipeline', result })
    }

    const mgmtError = await mgmtResponse.text()
    
    // Fallback: Try using pg_net extension's http function to create an RPC
    // First try to create an exec_ddl function, then call it
    // This won't work because we can't run DDL without an existing RPC...
    
    // Return the SQL for manual execution
    return NextResponse.json({
      error: 'Automatic migration failed. Run the SQL manually in Supabase SQL Editor.',
      mgmt_error: mgmtError,
      sql: MIGRATION_SQL.trim(),
      supabase_sql_editor_url: `https://supabase.com/dashboard/project/${projectRef}/sql/new`,
    }, { status: 501 })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/migrate - Check migration status
export async function GET() {
  try {
    // Check if the trending_scans table exists by trying to query it
    const response = await fetch(`${SUPABASE_URL}/rest/v1/trending_scans?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    const trendingExists = response.ok

    // Check growth_metrics
    const growthResponse = await fetch(`${SUPABASE_URL}/rest/v1/growth_metrics?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    const growthExists = growthResponse.ok

    // Check priority_channels
    const channelsResponse = await fetch(`${SUPABASE_URL}/rest/v1/priority_channels?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    const channelsExists = channelsResponse.ok

    // Check newsletter_repurpose
    const repurposeResponse = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_repurpose?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    const repurposeExists = repurposeResponse.ok

    return NextResponse.json({
      migration_003: {
        trending_scans: trendingExists,
        growth_metrics: growthExists,
        priority_channels: channelsExists,
        newsletter_repurpose: repurposeExists,
      },
      sql_editor_url: 'https://supabase.com/dashboard/project/lmboomcjvrohibzqbmaw/sql/new',
    })
  } catch (error) {
    console.error('Migration status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}