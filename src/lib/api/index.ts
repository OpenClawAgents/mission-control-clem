import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ==========================================
// TYPES
// ==========================================

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'
export type ContentType = 'newsletter' | 'script' | 'social_post' | 'research' | 'digest' | 'video_clip' | 'draft'
export type PipelineStage = 'idea' | 'script' | 'filming' | 'editing' | 'scheduled' | 'published' | 'tracking'
export type RepurposeType = 'reel_script' | 'carousel' | 'caption' | 'newsletter_repurpose' | 'long_form'
export type DigestCategory = 'psychedelic_law' | 'church' | 'dea' | 'state_reform' | 'other'

export interface ContentItem {
  id: string
  user_id: string
  title: string
  slug: string | null
  type: ContentType
  status: ContentStatus
  body: Record<string, unknown>
  tags: string[]
  source_url: string | null
  published_at: string | null
  pipeline_stage?: PipelineStage | null
  source_content_id?: string | null
  repurpose_type?: RepurposeType | null
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  title: string
  file_path: string | null
  duration_seconds: number | null
  resolution: string | null
  tags: string[]
  transcript: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Digest {
  id: string
  user_id: string
  title: string
  date: string
  category: DigestCategory
  summary: string
  source_url: string | null
  source_name: string | null
  is_sent: boolean
  created_at: string
}

// ==========================================
// CONTENT
// ==========================================

export async function getContent(filters?: { type?: ContentType; status?: ContentStatus }) {
  let query = supabase.from('content').select('*').order('updated_at', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return data as ContentItem[]
}

export async function getContentById(id: string) {
  const { data, error } = await supabase.from('content').select('*').eq('id', id).single()
  if (error) throw error
  return data as ContentItem
}

export async function createContent(item: Partial<ContentItem> & { user_id: string; title: string; type: ContentType }) {
  const { data, error } = await supabase.from('content').insert(item).select().single()
  if (error) throw error
  return data as ContentItem
}

export async function updateContent(id: string, updates: Partial<ContentItem>) {
  const { data, error } = await supabase.from('content').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as ContentItem
}

export async function deleteContent(id: string) {
  const { error } = await supabase.from('content').delete().eq('id', id)
  if (error) throw error
}

export async function getContentCounts() {
  const { data, error } = await supabase.from('content').select('type, status')
  if (error) throw error
  return data as Pick<ContentItem, 'type' | 'status'>[]
}

// ==========================================
// VIDEOS
// ==========================================

export async function getVideos() {
  const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Video[]
}

export async function createVideo(video: Partial<Video> & { user_id: string; title: string }) {
  const { data, error } = await supabase.from('videos').insert(video).select().single()
  if (error) throw error
  return data as Video
}

export async function updateVideo(id: string, updates: Partial<Video>) {
  const { data, error } = await supabase.from('videos').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Video
}

export async function deleteVideo(id: string) {
  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) throw error
}

// ==========================================
// DIGESTS
// ==========================================

export async function getDigests(filters?: { category?: DigestCategory }) {
  let query = supabase.from('digests').select('*').order('date', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  const { data, error } = await query
  if (error) throw error
  return data as Digest[]
}

export async function createDigest(digest: Partial<Digest> & { user_id: string; title: string; date: string; category: DigestCategory; summary: string }) {
  const { data, error } = await supabase.from('digests').insert(digest).select().single()
  if (error) throw error
  return data as Digest
}

export async function updateDigest(id: string, updates: Partial<Digest>) {
  const { data, error } = await supabase.from('digests').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Digest
}

export async function deleteDigest(id: string) {
  const { error } = await supabase.from('digests').delete().eq('id', id)
  if (error) throw error
}

export async function getDigestCounts() {
  const { data, error } = await supabase.from('digests').select('category')
  if (error) throw error
  return data as Pick<Digest, 'category'>[]
}