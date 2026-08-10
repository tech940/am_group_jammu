/**
 * Admin authentication (server-side).
 *
 * /admin previously had no protection of any kind: no proxy/middleware, no
 * login, no session check. Anyone with the URL could read every customer's
 * name, phone and email and delete inventory.
 *
 * Server Actions are publicly invocable HTTP endpoints, so gating the UI alone
 * is not enough — `requireAdmin()` is called inside every admin action too.
 *
 * This is a single shared passphrase, which suits a small dealership team. It
 * is not multi-user: there are no per-staff accounts, so `assignedTo` on a lead
 * is free text rather than a foreign key.
 */

import { cookies } from 'next/headers'
import { ADMIN_COOKIE, safeEqual, verifySessionToken } from './session.ts'

export { ADMIN_COOKIE, createSessionToken, SESSION_COOKIE_OPTIONS } from './session.ts'

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(candidate, expected)
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}

/**
 * Guard for server actions. Throws rather than returning false, so a missed
 * call site fails loudly instead of silently exposing customer data.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error('Not authorised. Please sign in to the admin area.')
  }
}
