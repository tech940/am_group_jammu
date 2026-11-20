/**
 * The site's public origin, in exactly one place.
 *
 * The site's own domain is usedcarsjammu.com, bought by the owner on
 * 2026-11-15. (Before that the code assumed amgroupind.com, which is the
 * group's old WordPress site - so every canonical link pointed search
 * engines at a different website.) Every canonical URL, sitemap entry,
 * structured-data @id and llms.txt link is built from SITE_URL, so a change
 * of domain is one environment variable:
 *
 *   NEXT_PUBLIC_SITE_URL=https://example.com
 *
 * No trailing slash — callers append paths that start with "/".
 *
 * Free of any `next/*` or alias import so the scripts that load lib/seo
 * directly can use it too.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://usedcarsjammu.com').replace(/\/+$/, '')

/**
 * True only when NEXT_PUBLIC_SITE_URL is set in the hosting environment. That
 * is the owner's signal that the domain is connected and live: only then are
 * requests arriving on any other host (the vercel.app address) marked
 * noindex. Setting it before the domain's DNS points here would hide the
 * only working address from search engines.
 */
export const SITE_URL_IS_EXPLICIT = Boolean(process.env.NEXT_PUBLIC_SITE_URL)

/** Host part of SITE_URL ("usedcarsjammu.com"), for host comparisons. */
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

/**
 * A search-result description built from sentences in order of importance,
 * keeping only as many as fit. Google shows roughly 155-160 characters and
 * cuts the rest mid-word; dropping a whole trailing sentence reads better than
 * a sentence that stops halfway. The first sentence is always kept.
 */
export function fitDescription(sentences: (string | false | null | undefined)[], max = 158): string {
  const parts = sentences.filter((x): x is string => Boolean(x && x.trim())).map((x) => x.trim())
  let out = parts[0] ?? ''
  for (const next of parts.slice(1)) {
    if (`${out} ${next}`.length > max) continue
    out = `${out} ${next}`
  }
  return out
}

/** The share image used when a page has no photograph of its own. */
export const OG_IMAGE = {
  // The logo on the forest green, with an oat strip and a tomato rule; made
  // by scripts/make-brand-images.mjs (re-run it when the palette changes).
  // The file really is 1200x630 (the previous one was a 1024x1024 JPEG named
  // .png and declared as 1200x630).
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'AM Group Used Cars, Jammu',
}

/** A share image taken from the page's own stock. */
export interface ShareImage {
  url: string
  alt: string
}

/**
 * The first car photo among the cars a page lists, as its share image.
 *
 * WHY (2026-11-20): Google took the logo card as the thumbnail for a location
 * page ("I don't want this AM Group logo, I want a vehicle"). Search picks the
 * thumbnail from og:image and the page's structured data, so a page that
 * lists cars names one of those cars instead. Pages with no car fall back to
 * OG_IMAGE.
 */
export function shareImageFrom(
  vehicles: { primaryImage: string | null; title: string; year?: number | null }[],
): ShareImage | null {
  const car = vehicles.find((v) => v.primaryImage)
  if (!car?.primaryImage) return null
  return { url: car.primaryImage, alt: `${car.year ? `${car.year} ` : ''}${car.title}, used, at AM Group Jammu` }
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
export function pageSocial({
  title,
  description,
  path,
  image = null,
}: {
  title: string
  description: string
  path: string
  /** A photograph from the page itself (see shareImageFrom); the logo card otherwise. */
  image?: ShareImage | null
}) {
  return {
    openGraph: {
      type: 'website' as const,
      locale: 'en_IN',
      siteName: DEALER_NAME,
      url: path,
      title,
      description,
      images: [image ?? OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [image?.url ?? OG_IMAGE.url],
    },
  }
}
