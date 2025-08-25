// web/src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create the client if both env vars exist.
// This avoids the "supabaseUrl is required" crash on first paint.
export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null

// Helper you can use in code paths that truly require Supabase.
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase
}
