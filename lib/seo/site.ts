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

/** Name used in titles, Open Graph and structured data. */
export const SITE_NAME = 'AM Group'

/** Absolute URL for a site path ("/inventory" → "https://…/inventory"). */
export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** The share image used when a page has no photograph of its own. */
export const OG_IMAGE = {
  url: '/inventory_hero_bg.png',
  width: 1200,
  height: 630,
  alt: 'Used cars for sale at AM Group, Jammu',
}

/**
 * Open Graph + Twitter block for a page.
 *
 * Next.js replaces a parent's `openGraph` wholesale when a page sets its own,
 * so a page that only supplied title and url would silently lose the image,
 * site name and locale. Pages spread this instead.
 */
export function pageSocial({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    openGraph: {
      type: 'website' as const,
      locale: 'en_IN',
      siteName: `${SITE_NAME} Used Cars`,
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
