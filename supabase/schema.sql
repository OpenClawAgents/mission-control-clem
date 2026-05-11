-- Mission Control Clem - Database Schema
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- CONTENT / LIBRARY ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('newsletter', 'script', 'social_post', 'research', 'digest', 'video_clip', 'draft')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  body JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view content" ON public.content FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can insert content" ON public.content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update content" ON public.content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete content" ON public.content FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- VIDEO CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT,
  duration_seconds INTEGER,
  resolution TEXT,
  tags TEXT[] DEFAULT '{}',
  transcript TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view videos" ON public.videos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage videos" ON public.videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update videos" ON public.videos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete videos" ON public.videos FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- DIGESTS (psychedelic law / church updates)
-- ============================================
CREATE TABLE IF NOT EXISTS public.digests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('psychedelic_law', 'church', 'dea', 'state_reform', 'other')),
  summary TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view digests" ON public.digests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can insert digests" ON public.digests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update digests" ON public.digests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete digests" ON public.digests FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_user ON public.content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(slug);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_videos_user ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_digests_date ON public.digests(date DESC);
CREATE INDEX IF NOT EXISTS idx_digests_category ON public.digests(category);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();