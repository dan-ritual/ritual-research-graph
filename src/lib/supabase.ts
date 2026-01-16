/**
 * Supabase Client Configuration
 *
 * Two clients available:
 * - supabase: For browser/user-context operations (respects RLS)
 * - supabaseAdmin: For server/CLI operations (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

/**
 * Standard Supabase client for browser/user operations.
 * Respects Row Level Security policies.
 */
export const supabase = SUPABASE_ANON_KEY
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Admin Supabase client for server/CLI operations.
 * Bypasses Row Level Security - use with caution.
 */
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Get the appropriate client based on context.
 * Throws if no client is available.
 */
export function getSupabaseClient(requireAdmin = false) {
  if (requireAdmin) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available. Set SUPABASE_SERVICE_KEY.');
    }
    return supabaseAdmin;
  }
  
  const client = supabase ?? supabaseAdmin;
  if (!client) {
    throw new Error('No Supabase client available. Set SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY.');
  }
  return client;
}
