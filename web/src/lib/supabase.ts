import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(URL && KEY)

let _client: SupabaseClient | null = null

/** Returns a Supabase client or throws if env isn’t configured. */
export function getSupabase(): SupabaseClient {
  if (!hasSupabaseConfig) {
    throw new Error('Supabase not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)')
  }
  if (!_client) _client = createClient(URL!, KEY!)
  return _client
}

/** Optional soft accessor if you want to feature-gate on env presence. */
export function maybeSupabase(): SupabaseClient | null {
  return hasSupabaseConfig ? getSupabase() : null
}
