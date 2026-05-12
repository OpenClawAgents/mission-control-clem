import { createClient } from '@/lib/supabase/client'

/**
 * Get the current authenticated user's ID from Supabase.
 * Returns empty string if not authenticated.
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? ''
  } catch {
    return ''
  }
}