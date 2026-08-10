/**
 * Session token signing/verification.
 *
 * Deliberately free of `next/headers` and any Node built-in so that proxy.ts
 * (which may run in the edge runtime) can import it. Uses Web Crypto only.
 */

export const ADMIN_COOKIE = 'am_admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12 // 12 hours

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sign(value: string): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))
}

/** Length-independent comparison, to avoid leaking timing information. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Token format: `<expiryMs>.<hmac>` */
export async function createSessionToken(): Promise<string> {
  const payload = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  return `${payload}.${await sign(payload)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [payload, mac] = token.split('.')
  if (!payload || !mac) return false

  const expiry = Number.parseInt(payload, 10)
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false

  try {
    return safeEqual(await sign(payload), mac)
  } catch {
    return false
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
}
