-- Mission Control Clem - Newsletter Repurposing & Content Pipeline
-- Run this in Supabase SQL Editor

-- ============================================
-- CONTENT PIPELINE STAGES
-- ============================================
-- We use the existing content table's 'status' field to track pipeline stage:
-- draft = Idea, review = Scripting/In Progress, published = Published, archived = Archived
-- For more granular tracking, we add a pipeline_stage column.

ALTER TABLE public.content ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'idea'
  CHECK (pipeline_stage IN ('idea', 'script', 'filming', 'editing', 'scheduled', 'published', 'tracking'));

ALTER TABLE public.content ADD COLUMN IF NOT EXISTS source_content_id UUID REFERENCES public.content(id);
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS repurpose_type TEXT
  CHECK (repurpose_type IS NULL OR repurpose_type IN ('reel_script', 'carousel', 'caption', 'newsletter_repurpose', 'long_form'));

-- ============================================
-- NEWSLETTER REPURPOSING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_repurpose (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Source info
  source_title TEXT NOT NULL,
  source_theme TEXT,
  
  -- Generated outputs
  reel_scripts JSONB DEFAULT '[]'::jsonb,      -- Array of {hook, body, cta, estimated_seconds}
  carousel_posts JSONB DEFAULT '[]'::jsonb,     -- Array of {slide_number, text, visual_note}
  short_captions JSONB DEFAULT '[]'::jsonb,     -- Array of {text, platform, hashtags}
  
  -- Metadata
  theme_tags TEXT[] DEFAULT '{}',
  recommended_format TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.newsletter_repurpose ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view repurpose" ON public.newsletter_repurpose FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage repurpose" ON public.newsletter_repurpose FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update repurpose" ON public.newsletter_repurpose FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete repurpose" ON public.newsletter_repurpose FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TRIGGER set_newsletter_repurpose_updated_at BEFORE UPDATE ON public.newsletter_repurpose FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- GROWTH METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.growth_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'newsletter', 'other')),
  
  -- Core metrics
  followers INTEGER,
  followers_gained INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate FLOAT,
  
  -- Content metrics
  posts_count INTEGER DEFAULT 0,
  top_post_id TEXT,
  top_post_views INTEGER DEFAULT 0,
  top_post_engagement FLOAT DEFAULT 0,
  
  -- Growth tracking
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date, platform, user_id)
);

ALTER TABLE public.growth_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view growth" ON public.growth_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage growth" ON public.growth_metrics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update growth" ON public.growth_metrics FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- TRENDING SCANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trending_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'general')),
  scan_type TEXT NOT NULL CHECK (scan_type IN ('sounds', 'hashtags', 'challenges', 'creators', 'topics')),
  
  -- Scan results
  items JSONB DEFAULT '[]'::jsonb,  -- Array of {name, url, view_count, engagement, trend_score}
  source_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trending_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view trends" ON public.trending_scans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage trends" ON public.trending_scans FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- PRIORITY CHANNELS (creator watchlist)
-- ============================================
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
CREATE POLICY "Authenticated users can view channels" ON public.priority_channels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage channels" ON public.priority_channels FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update channels" ON public.priority_channels FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_pipeline_stage ON public.content(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_content_source ON public.content(source_content_id);
CREATE INDEX IF NOT EXISTS idx_content_repurpose_type ON public.content(repurpose_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_repurpose_source ON public.newsletter_repurpose(source_content_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_repurpose_status ON public.newsletter_repurpose(status);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date ON public.growth_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_platform ON public.growth_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_trending_scans_date ON public.trending_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_priority_channels_platform ON public.priority_channels(platform);