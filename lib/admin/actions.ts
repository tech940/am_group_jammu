"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminConfigured,
  SESSION_COOKIE_OPTIONS,
  verifyPassword,
} from './auth.ts'

/** Deters brute forcing of the shared passphrase. */
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW_MS = 15 * 60_000
const MAX_ATTEMPTS = 8

function throttle(key: string): boolean {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now })
    return true
  }
  rec.count++
  return rec.count <= MAX_ATTEMPTS
}

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isAdminConfigured()) {
    return {
      error:
        'Admin access is not configured on this deployment. Set ADMIN_PASSWORD in your environment and restart.',
    }
  }

  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/admin')

  if (!throttle('login')) {
    return { error: 'Too many attempts. Please wait a few minutes and try again.' }
  }

  if (!(await verifyPassword(password))) {
    return { error: 'Incorrect password.' }
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE, await createSessionToken(), SESSION_COOKIE_OPTIONS)
  attempts.delete('login')

  // Only allow same-origin relative paths, so ?next= cannot become an open redirect.
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/admin')
}

export async function logout(): Promise<void> {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
