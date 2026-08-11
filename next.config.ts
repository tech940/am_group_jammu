import type { NextConfig } from "next";

/**
 * WordPress -> Next.js migration redirects.
 *
 * amgroupind.com is a live WordPress site with ~196 URLs in Google's index. When
 * DNS moves to this app, every legacy URL that is not mapped here becomes a 404
 * and the ranking it holds is lost. The map was built by fetching each live URL
 * and classifying what it actually contains — not by guessing from the slug,
 * which would have been wrong at least once: /amg-autocraft-jammu/ reads like a
 * bodyshop and is in fact an MG Motor dealership.
 *
 * Sources are written WITHOUT a trailing slash. Next normalises `/about-us/` to
 * `/about-us` before redirect matching (trailingSlash defaults to false), so the
 * slashed WordPress form is covered by the unslashed rule.
 *
 * Individual vehicle URLs (/listings/<slug>/) are NOT here — they are resolved
 * dynamically against live stock in app/listings/[...slug]/route.ts, because a
 * static map of today's 27 cars is wrong the first time one sells.
 *
 * Dead Motors-plugin utility pages (compare, add-car, authorization, …) are NOT
 * here either — they get a 410 from proxy.ts, which tells Google to drop them
 * outright rather than passing them equity they never had.
 */

interface LegacyRedirect {
  source: string
  destination: string
  has?: { type: 'query'; key: string; value?: string }[]
  /**
   * Emit 302 instead of 301. Used only for pages whose real replacement has not
   * been built yet — a 301 would permanently reassign that URL's ranking to a
   * stand-in, and we would not get it back when the proper page ships.
   */
  temporary?: boolean
}

const LEGACY_PAGE_REDIRECTS: LegacyRedirect[] = [
  /* Company ------------------------------------------------------------- */
  { source: '/about-us', destination: '/about' },
  // Thin divisions hub; /about carries the same group-level story.
  { source: '/our-businesses', destination: '/about' },

  /* Contact ------------------------------------------------------------- */
  { source: '/contact-us', destination: '/contact' },

  /* Used-car inventory --------------------------------------------------- */
  // The strongest legacy URL on the site: it ranks for "used cars in jammu".
  // /used-cars/jammu is the exact-intent equivalent — same query, same stock.
  { source: '/used-cars-in-jammu', destination: '/used-cars/jammu' },
  // Two more renders of the identical Motors listings archive.
  { source: '/listings', destination: '/inventory' },

  /* Editorial ------------------------------------------------------------ */
  { source: '/news-updates', destination: '/blog' },
  { source: '/category/news', destination: '/blog' },
  { source: '/category/uncategorized', destination: '/blog' },
  // The four real news posts. There are no individual post pages in this app
  // yet, so these land on the index. See MIGRATION.md — they are the clearest
  // case for content that should be rebuilt rather than folded away.
  { source: '/am-hyundai-bags-two-prestigious-awards', destination: '/blog' },
  { source: '/am-hyundai-inaugurates-smart-car-care-clinic', destination: '/blog' },
  { source: '/am-hyundai-launches-indias-first-fully-electric-suv-kona-electric', destination: '/blog' },
  { source: '/am-hyundai-launches-all-new-i20', destination: '/blog' },

  /* Enquiry forms -------------------------------------------------------- */
  // Elementor lead-capture templates, one per franchise. The product differs
  // (these sell new cars and motorcycles) but the user action is identical —
  // send an enquiry to AM Group — and /contact is a working enquiry form.
  { source: '/hyundai-enquiry', destination: '/contact' },
  { source: '/kia-enquiry', destination: '/contact' },
  { source: '/tata-enquiry', destination: '/contact' },
  { source: '/amg-autocraft-jammu-enquiry', destination: '/contact' },
  { source: '/am-bajaj-jammu-enquiry', destination: '/contact' },
  { source: '/honda-enquiry', destination: '/contact' },
  { source: '/ktm-enquiry', destination: '/contact' },
  { source: '/triumph-enquiry', destination: '/contact' },

  /* ------------------------------------------------------------------------
   * TEMPORARY (302) — business AM Group really operates that this site does
   * not yet cover.
   *
   * The WordPress site sells new cars and motorcycles, distributes genuine
   * spare parts, books servicing, brokers insurance, buys cars, and runs two
   * cafés. None of that exists here yet, so none of these has an honest
   * permanent home. They are 302 rather than 301 deliberately: a 302 keeps the
   * original URL in Google's index instead of handing its ranking to a
   * stand-in page, so nothing is lost when the real page ships.
   *
   * Replace each with a 301 to its proper page as that page is built.
   * ---------------------------------------------------------------------- */

  // New-vehicle dealerships. /automobile is the group's vehicle division hub —
  // thin today (it names none of these brands), which is why this is not a 301.
  { source: '/hyundai', destination: '/automobile', temporary: true },
  { source: '/am-kia', destination: '/automobile', temporary: true },
  { source: '/am-tata', destination: '/automobile', temporary: true },
  // Reads like a bodyshop; is actually the MG Motor dealership.
  { source: '/amg-autocraft-jammu', destination: '/automobile', temporary: true },

  // Two-wheeler showrooms. /ktm-jammu is the strongest of the three — the only
  // KTM showroom in Jammu, so it owns a near-uncontested query. Highest-value
  // page on this list to build properly.
  { source: '/ktm-jammu', destination: '/automobile', temporary: true },
  { source: '/honda-two-wheeler', destination: '/automobile', temporary: true },
  { source: '/am-bajaj-jammu', destination: '/automobile', temporary: true },

  // B2B genuine-parts distribution — a different customer entirely, so the
  // vehicle hub would be as wrong as the used-car pages.
  { source: '/am-hyundai-mobis', destination: '/contact', temporary: true },

  // Service actions. Each is an enquiry, which /contact can genuinely take.
  { source: '/book-service', destination: '/contact', temporary: true },
  { source: '/insurance-solutions', destination: '/contact', temporary: true },
  // Inverse intent — a seller must never be dropped on /inventory.
  { source: '/sell-your-car', destination: '/contact', temporary: true },

  // Hospitality. Nothing on this site is close; /about is the group hub and is
  // the least-wrong holding position until these are rebuilt.
  { source: '/milele', destination: '/about', temporary: true },
  { source: '/mocha', destination: '/about', temporary: true },
]

/**
 * Motors taxonomy archives, published as query strings on `/`
 * (e.g. /?taxonomy=make&term=kia). Thin faceted pages, but AIOSEO put all 96 in
 * the sitemap so Google knows them.
 *
 * Terms are enumerated rather than captured with a wildcard for two reasons:
 * an unknown term would redirect into a 404, and the WordPress vocabulary does
 * not match ours — WP says `petrol` where our stock says `gasoline`, so
 * /used-cars/petrol-cars-in-jammu does not exist.
 *
 * Anything not enumerated falls through to the catch-all at the end.
 */
const TAXONOMY_MAP: Record<string, Record<string, string>> = {
  make: {
    hyundai: '/brands/hyundai',
    kia: '/brands/kia',
    'maruti-suzuki': '/brands/maruti-suzuki',
    chevrolet: '/brands/chevrolet',
  },
  body: {
    suv: '/used-cars/suv-in-jammu',
    hatchback: '/used-cars/hatchback-in-jammu',
    sedan: '/used-cars/sedan-in-jammu',
    mpv: '/used-cars/mpv-in-jammu',
    'compact-suv': '/used-cars/compact-suv-in-jammu',
    'premium-hatchback': '/used-cars/premium-hatchback-in-jammu',
    'premium-suv': '/used-cars/premium-suv-in-jammu',
  },
  fuel: {
    // WordPress calls it petrol; our normalised stock calls it gasoline.
    petrol: '/used-cars/gasoline-cars-in-jammu',
    diesel: '/used-cars/diesel-cars-in-jammu',
  },
  transmission: {
    manual: '/used-cars/manual-cars-in-jammu',
    automatic: '/used-cars/automatic-cars-in-jammu',
  },
}

const LEGACY_TAXONOMY_REDIRECTS: LegacyRedirect[] = [
  ...Object.entries(TAXONOMY_MAP).flatMap(([taxonomy, terms]) =>
    Object.entries(terms).map(([term, destination]) => ({
      source: '/',
      has: [
        { type: 'query' as const, key: 'taxonomy', value: taxonomy },
        { type: 'query' as const, key: 'term', value: term },
      ],
      destination,
    })),
  ),
  // Everything else — price bands, mileage bands, model years, engine sizes,
  // exterior colours, condition, drive, and every model (`serie`) term. Those
  // destinations are all stock-derived and vanish when the last matching car
  // sells, so pointing at them would trade a 404 today for a 404 next month.
  // MUST stay last: `has` rules are evaluated in order.
  {
    source: '/',
    has: [{ type: 'query' as const, key: 'taxonomy' }],
    destination: '/inventory',
  },
]

/**
 * Host that actually serves the vehicle photographs.
 *
 * Every listing image is hosted by WordPress. Once this app is serving
 * amgroupind.com, WordPress moves to another hostname (e.g.
 * legacy.amgroupind.com) and MOTORS_BASE_URL must point there — so the image
 * allow-list has to follow it, or next/image rejects every car photo.
 */
const MOTORS_IMAGE_HOST = (() => {
  try {
    return new URL(process.env.MOTORS_BASE_URL || "https://amgroupind.com").hostname
  } catch {
    return "amgroupind.com"
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nhceknbaslqdqofefyla.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "amgroupind.com",
        pathname: "/**",
      },
      // Wherever WordPress lives post-migration. Duplicates the entry above
      // until MOTORS_BASE_URL is set, which is harmless.
      {
        protocol: "https",
        hostname: MOTORS_IMAGE_HOST,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "di-uploads-development.dealerinspire.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Next 16 rejects any `quality` prop not listed here and silently serves the
    // default 75 instead — which is what was happening to the hero's
    // `quality={90}`. 90 is reserved for the few large photographic plates whose
    // source resolution is already marginal; everything else stays at 75.
    qualities: [75, 90],
    // AVIF first, WebP second. The default is WebP only, which left roughly a
    // third of the achievable saving on the table — and the source photography
    // in am_group_files runs to 4229x2506 / 5.8MB per file, so the originals
    // must never reach a browser. next/image fetches each original ONCE on the
    // server, then serves a resized, re-encoded variant per breakpoint.
    formats: ["image/avif", "image/webp"],
    // Optimised variants are immutable per (src, width, quality); the default
    // 60s TTL makes the server re-fetch and re-encode multi-megabyte originals
    // far too often. 30 days.
    minimumCacheTTL: 2592000,
  },

  async redirects() {
    return [...LEGACY_PAGE_REDIRECTS, ...LEGACY_TAXONOMY_REDIRECTS].map(
      ({ temporary, ...rule }) => ({
        ...rule,
        // `permanent: true` emits 308. Google treats 301 and 308 identically,
        // but 301 is what every SEO auditor, log analyser and legacy crawler
        // expects on a content migration, and these are all GET page requests,
        // so there is no request method to preserve.
        statusCode: temporary ? (302 as const) : (301 as const),
      }),
    )
  },
};


export default nextConfig;
