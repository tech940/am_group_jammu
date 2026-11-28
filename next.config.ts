import type { NextConfig } from "next";
import { SITE_HOST, SITE_URL_IS_EXPLICIT } from "./lib/seo/site";

/**
 * WordPress -> Next.js migration redirects.
 *
 * amgroupind.com is a live WordPress site with ~196 URLs in Google's index. When
 * DNS moves to this app, every legacy URL that is not handled becomes a 404 and
 * the ranking it holds is lost. The map was built by fetching each live URL and
 * classifying what it actually contains — not by guessing from the slug, which
 * would have been wrong at least once: /amg-autocraft-jammu/ reads like a
 * bodyshop and is in fact an MG Motor dealership.
 *
 * WHERE EACH KIND OF OLD URL IS HANDLED
 *   here                  an old page with a true equivalent on this site that
 *                         always exists (contact, the Jammu stock page, about)
 *   proxy.ts              (a) old pages with no home here: 410 Gone, not a
 *                         redirect to the homepage, which Google treats as a
 *                         soft 404; (b) old URLs whose destination only exists
 *                         while a matching car is in stock (/hyundai,
 *                         /?taxonomy=make&term=kia): checked against the live
 *                         site at request time, and redirected without the old
 *                         query string, which a rule in this file cannot do
 *   app/listings/[...slug] individual cars (/listings/<slug>/), matched
 *                         against live stock
 *
 * Redirects here run BEFORE proxy.ts. Do not list a URL in both.
 *
 * Sources are written WITHOUT a trailing slash. Next normalises `/about-us/` to
 * `/about-us` before redirect matching (trailingSlash defaults to false), so the
 * slashed WordPress form is covered by the unslashed rule.
 */

interface LegacyRedirect {
  source: string
  destination: string
  /**
   * Emit 302 instead of 301. Used only for pages whose real replacement has not
   * been built yet — a 301 would permanently reassign that URL's ranking to a
   * stand-in, and we would not get it back when the proper page ships.
   */
  temporary?: boolean
}

const LEGACY_PAGE_REDIRECTS: LegacyRedirect[] = [
  /* Company ------------------------------------------------------------- */
  // The "About AM Group Used Cars" section on /locations is the one place this
  // site says who the dealer is, so the old company-profile URLs go there.
  { source: '/about-us', destination: '/locations#about' },
  { source: '/about', destination: '/locations#about' },

  /* Contact ------------------------------------------------------------- */
  { source: '/contact-us', destination: '/contact' },

  /* Used-car inventory --------------------------------------------------- */
  // The strongest legacy URL on the site: it ranks for "used cars in jammu".
  // /used-cars/jammu is the exact-intent equivalent — same query, same stock.
  { source: '/used-cars-in-jammu', destination: '/inventory' },
  // Two more renders of the identical Motors listings archive.
  { source: '/listings', destination: '/inventory' },

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
   * TEMPORARY (302) — things AM Group really does that this site does not
   * cover, where the visitor's next step is still an enquiry and /contact can
   * take it. 302 rather than 301: it keeps the original URL in Google's index
   * instead of handing its ranking to a stand-in, so nothing is lost if the
   * group gives these a proper page somewhere.
   * ---------------------------------------------------------------------- */
  // B2B genuine-parts distribution.
  { source: '/am-hyundai-mobis', destination: '/contact', temporary: true },
  // Service actions.
  { source: '/book-service', destination: '/contact', temporary: true },
  { source: '/insurance-solutions', destination: '/contact', temporary: true },
  // /sell-your-car is a real page now (app/sell-your-car), so it has no
  // redirect — an entry here would shadow it.

  /* Renamed or retired pages of this site -------------------------------- */
  // The fuel landing page was named after the feed's word for petrol.
  { source: '/used-cars/gasoline-cars-in-jammu', destination: '/used-cars/petrol-cars-in-jammu' },
  // City pages and the Srinagar location were retired with the move to three
  // Jammu sites.
  { source: '/used-cars/srinagar', destination: '/inventory' },
  { source: '/used-cars/kathua', destination: '/inventory' },
  { source: '/used-cars/udhampur', destination: '/inventory' },
  { source: '/locations/srinagar', destination: '/locations' },

  // NOT HERE ON PURPOSE (all handled in proxy.ts):
  //   the news index and posts, /blog, /gallery, /our-businesses, /automobile,
  //   /hp-indian-oil, /real-estate, /s-mega-mart, /milele, /mocha, and the MG,
  //   Honda, KTM and Bajaj showroom URLs  -> 410 Gone
  //   /hyundai, /am-kia, /am-tata          -> that make's used cars, while in stock
  //   /?taxonomy=...&term=...              -> the matching landing page, while in stock
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
    // Nothing wider than 1920: car photographs are stored at 1280 to 1600px,
    // so 2048 and 3840 only made every srcset longer and asked the optimiser
    // to upscale.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
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
    return LEGACY_PAGE_REDIRECTS.map(({ temporary, ...rule }) => ({
      ...rule,
      // `permanent: true` emits 308. Google treats 301 and 308 identically,
      // but 301 is what every SEO auditor, log analyser and legacy crawler
      // expects on a content migration, and these are all GET page requests,
      // so there is no request method to preserve.
      statusCode: temporary ? (302 as const) : (301 as const),
    }))
  },

  /**
   * Keep copies of the site on other hostnames out of search results.
   *
   * Once the real domain is live, the same pages are still reachable at the
   * project's vercel.app address and at every preview deployment. Each page's
   * canonical tag already points at the real domain, but a canonical is a
   * hint; "X-Robots-Tag: noindex" is an instruction. So every response served
   * on a host OTHER than the one in NEXT_PUBLIC_SITE_URL carries it.
   *
   * The guard matters more than the rule. While NEXT_PUBLIC_SITE_URL is unset,
   * lib/seo/site.ts falls back to the old WordPress domain, which this app
   * does not serve yet. Applying the rule then would mark the only live copy
   * of the site (the vercel.app one) noindex and remove it from Google. So
   * with the variable unset this returns nothing, and today's site is left
   * exactly as it is.
   *
   * Setting the variable is therefore the switch. Set it to the address
   * visitors really use: to the vercel.app URL while that is the public
   * address, to the custom domain on the day the domain points here. Setting
   * it to a domain that does not serve this app yet would noindex the copy
   * that does.
   *
   * A "www." or non-"www." twin of the chosen host is treated as another host.
   * That is right as long as the twin redirects to the chosen one, which is
   * how Vercel sets up a domain pair.
   */
  async headers() {
    if (!SITE_URL_IS_EXPLICIT) return []
    return [
      {
        source: '/:path*',
        // `value` is read as a regular expression, so the dots are escaped.
        missing: [{ type: 'host' as const, value: SITE_HOST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ]
  },
};


export default nextConfig;
