-- Mission Control Clem - Vector Search Extension
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- CONTENT EMBEDDINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  embedding vector(1536) NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, chunk_index)
);

ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view embeddings" ON public.content_embeddings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage embeddings" ON public.content_embeddings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update embeddings" ON public.content_embeddings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete embeddings" ON public.content_embeddings FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- VECTOR SEARCH INDEX (IVFFlat for approximate nearest neighbor)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_embeddings_vector ON public.content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- SEMANTIC SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.search_content(
  query_embedding vector(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.5,
  filter_type TEXT DEFAULT NULL,
  filter_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  title TEXT,
  type TEXT,
  status TEXT,
  tags TEXT[],
  source_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content_id,
    ce.chunk_text,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    c.title,
    c.type,
    c.status,
    c.tags,
    c.source_url
  FROM public.content_embeddings ce
  JOIN public.content c ON c.id = ce.content_id
  WHERE
    (1 - (ce.embedding <=> query_embedding)) > match_threshold
    AND (filter_type IS NULL OR c.type = filter_type)
    AND (filter_tags IS NULL OR c.tags && filter_tags)
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- VIDEO INGEST LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.video_ingest_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  video_id UUID REFERENCES public.videos(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.video_ingest_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view ingest log" ON public.video_ingest_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can manage ingest log" ON public.video_ingest_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Editors and admins can update ingest log" ON public.video_ingest_log FOR UPDATE USING (auth.role() = 'authenticated');

CREATE TRIGGER set_video_ingest_updated_at BEFORE UPDATE ON public.video_ingest_log FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_embeddings_content ON public.content_embeddings(content_id);
CREATE INDEX IF NOT EXISTS idx_video_ingest_status ON public.video_ingest_log(status);
CREATE INDEX IF NOT EXISTS idx_video_ingest_created ON public.video_ingest_log(created_at DESC);