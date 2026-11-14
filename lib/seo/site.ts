/**
 * The site's public origin, in exactly one place.
 *
 * The production domain is not settled yet (the site currently runs on a
 * vercel.app URL while the code assumed amgroupind.com). Every canonical URL,
 * sitemap entry, structured-data @id and llms.txt link is built from SITE_URL,
 * so switching domain is one environment variable:
 *
 *   NEXT_PUBLIC_SITE_URL=https://example.com
 *
 * No trailing slash — callers append paths that start with "/".
 *
 * Free of any `next/*` or alias import so the scripts that load lib/seo
 * directly can use it too.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://amgroupind.com').replace(/\/+$/, '')

/**
 * True only when the owner has named the origin on purpose. While it is false
 * SITE_URL is a guess (the old WordPress domain), so nothing may punish a
 * request for arriving on a "wrong" host: next.config.ts reads this before it
 * marks other hosts noindex.
 */
export const SITE_URL_IS_EXPLICIT = Boolean(process.env.NEXT_PUBLIC_SITE_URL)

/** Host part of SITE_URL ("amgroupind.com"), for host comparisons. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

/** Short name, used by the title template ("… | AM Group"). */
export const SITE_NAME = 'AM Group'

/**
 * The one spelling of the business name, for structured data, llms.txt, the
 * web manifest and the "who we are" copy. Three spellings were in use
 * ("AM Group", "AM Group Used Cars", "AM Group Used Cars Jammu"); this is the
 * one that says what the business is without adding the city to its name.
 */
export const DEALER_NAME = 'AM Group Used Cars'

/**
 * The day the hand-written pages (sell, contact, locations) last changed, for
 * the sitemap. Edit it when their copy changes. It is a constant on purpose: a
 * "now" date on every fetch teaches crawlers to ignore the field.
 */
export const CONTENT_REVISED = '2026-11-15'

/** Absolute URL for a site path ("/inventory" → "https://…/inventory"). */
export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** The share image used when a page has no photograph of its own. */
export const OG_IMAGE = {
  // The existing logo on the blue ground (--color-deep), made with sharp.
  // The file really is 1200x630 (the previous one was a 1024x1024 JPEG named
  // .png and declared as 1200x630).
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'AM Group Used Cars, Jammu',
}

/**
 * Open Graph + Twitter block for a page.
 *
 * Next.js replaces a parent's `openGraph` wholesale when a page sets its own,
 * so a page that only supplied title and url would silently lose the image,
 * site name and locale. Pages spread this instead:
 *
 *   ...pageSocial({ title, description, path: '/inventory' })
 *
 * A page that sets no openGraph at all inherits the root layout's, whose
 * og:url is the homepage, so every indexable route should call this.
 */
export function pageSocial({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    openGraph: {
      type: 'website' as const,
      locale: 'en_IN',
      siteName: DEALER_NAME,
      url: path,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [OG_IMAGE.url],
    },
  }
}
