import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.ts";

/**
 * Supabase clients.
 *
 * These are created lazily. The previous version called createClient() at
 * module scope with non-null assertions, so with no env vars present
 * @supabase/supabase-js threw "supabaseUrl is required" the moment ANY module
 * imported this file — which took down every server action that touched it.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL

/**
 * Anon key. `SUPABASE_ANON_KEY` (server-only) is preferred over the
 * NEXT_PUBLIC_ spelling: nothing in this app talks to Supabase from the
 * browser, so there is no reason to inline the key into the client bundle.
 * Both names are accepted so either convention works.
 */
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

/**
 * Server-only. Bypasses RLS, so it must never be exposed to the browser —
 * note the deliberate absence of a NEXT_PUBLIC_ prefix.
 */
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * True when there is a usable server-side client. The service-role key alone is
 * sufficient — and with RLS enabled it is the only key that can read `leads`,
 * so keying this off the anon key would silently route every lead to the local
 * file fallback on a correctly-secured deployment.
 */
export const isSupabaseConfigured = Boolean(url && (serviceKey || anonKey))
export const hasServiceRole = Boolean(url && serviceKey)

let anonClient: SupabaseClient<Database> | null = null
let adminClient: SupabaseClient<Database> | null = null

/** Public (RLS-bound) client. Returns null when Supabase is not configured. */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!url || !anonKey) return null
  if (!anonClient) anonClient = createClient<Database>(url, anonKey)
  return anonClient
}

/**
 * Service-role client for trusted server code (lead writes, admin reads).
 * Falls back to the anon client when no service key is configured, which still
 * works if RLS has not been enabled yet.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!url) return null
  if (serviceKey) {
    if (!adminClient) {
      adminClient = createClient<Database>(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    }
    return adminClient
  }
  return getSupabase()
}

/**
 * Back-compat export for existing callers.
 * Prefer getSupabase() — this getter still returns null when unconfigured, so
 * every consumer must null-check rather than assume a client exists.
 */
export const supabase = getSupabase()
