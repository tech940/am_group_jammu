import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteFontVariables } from "@/components/system/fonts";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { ConditionalBreadcrumbs } from "@/components/layout/conditional-breadcrumbs";

import { EnquiryHost } from "@/components/modals/enquiry-host";
import { generateSiteSchema, jsonLdString } from "@/lib/seo-schemas";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { locationNames } from "@/lib/seo/locations";
import { LOCATIONS } from "@/lib/locations";
import { getSeoLinks } from "@/lib/seo/links";
import { Analytics } from "@/components/analytics/analytics";
import { LinkTracker } from "@/components/analytics/link-tracker";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";

// The fallback title and descriptions, used by any page that sets none of its
// own. They used to say "Certified Pre-Owned" and "recorded kilometres".
// Nothing in the data says what "certified" means here or that readings are
// recorded at intake (both are open questions for the owner), so they now say
// only what a listing shows: the odometer reading.
const SITE_TITLE = "Used Cars in Jammu | AM Group";
const SITE_DESCRIPTION =
  `Buy and sell used cars in Jammu with AM Group. Second hand cars with real photos and the odometer reading shown, ` +
  `finance and exchange, at ${LOCATIONS.length} Jammu locations: ${locationNames()}.`;
const OG_DESCRIPTION =
  `Second hand cars for sale in Jammu with real photos and the odometer reading shown. Sell or exchange your car at ${locationNames()}.`;

export const viewport: Viewport = {
  // --color-deep from app/globals.css: the blue of the header and the phone
  // tab bar, so the browser's own bars continue it. A <meta> value cannot read
  // a CSS variable, so this is the one place the token is repeated as a
  // literal. If the token changes, change this with it.
  themeColor: "#146287",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Search Console and Bing ownership checks. Each prints a <meta> tag only when
  // its code is set, so nothing is emitted until the owner adds one. The DNS
  // method needs neither.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "used cars in Jammu",
    "second hand cars in Jammu",
    "sell my car Jammu",
    "used car dealer Jammu",
    "car exchange Jammu",
    "used car finance Jammu",
  ],
  applicationName: `${SITE_NAME} Used Cars`,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // No `robots` here on purpose. "index, follow" is what a page gets anyway,
  // and stating it in the root layout put it on 404 pages too, next to their
  // own "noindex": two robots tags that contradict each other.
  // No `icons` here on purpose. app/favicon.ico, app/icon.png and
  // app/apple-icon.png each produce their own <link> tag. Listing /icon.png
  // here as well gave every page two sets of icon links, and pointed the
  // apple-touch-icon at the 192px file instead of the 180px one made for it.
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: SITE_TITLE,
    description: OG_DESCRIPTION,
    siteName: `${SITE_NAME} Used Cars`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization + WebSite (with its search action) + one AutoDealer per
  // used-car location, as a single @graph.
  const jsonLd = generateSiteSchema();
  // Fetched once in the layout (getInventory is cached) so the
  // footer and navbar link graph is present in the SERVER-rendered HTML of
  // every page rather than appearing only after hydration.
  const seoLinks = await getSeoLinks();

  return (
    // Font variables live here, at :root, so app/globals.css can resolve them
    // with a plain `@theme`. They were previously attached to a wrapper div on
    // the homepage only, which forced `@theme inline` and left every inner page
    // on a different typeface.
    // en-IN, matching the Open Graph locale: Indian English, rupee prices.
    <html lang="en-IN" className={siteFontVariables}>
      <head>
        {/* No preconnects. The fonts are self-hosted by next/font and every
            photograph is served through /_next/image on this origin, so the
            four hosts that used to be warmed up here were never contacted.
            The analytics hosts are deliberately not preconnected either: a
            visitor who has said "No thanks" must not be made to open a
            connection to them. */}
      </head>
      {/* Ground, ink and font come from the base layer in globals.css, not from
          utility classes here — so a page that forgets them still inherits the
          system rather than Tailwind's defaults. */}
      <body>
        {/* Plain <script>, not next/script: next/script defaults to
            afterInteractive, which injects the JSON-LD only after hydration so
            it is absent from the server-rendered HTML a crawler first sees. */}
        <script
          type="application/ld+json"
          // jsonLdString escapes "<", so no text inside the data can close
          // the script tag early.
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />

        {/* next-themes was removed with the broken `.dark` token block: nothing
            in the app called useTheme, and the provider's only effect was to
            stamp class="dark" on <html> for a theme whose background was light
            but whose cards and popovers were dark. This app is light-ground by
            design. A real dark theme, if it is ever wanted, is built on the
            `deep` family — not resurrected from that block. */}

        {/* The fake `PageLoader` was deleted here, not restyled. It was a
            setTimeout chain reporting 30/70/100% over 600ms on every pathname
            *and* searchParams change — so it claimed a completed navigation
            while a slow route was still fetching, and re-ran on every filter
            click on /inventory. Next 16's only real navigation signal,
            `useLinkStatus`, reads context published by an enclosing <Link>, so
            it cannot be observed from the root layout; React's `useTransition`
            only sees transitions the same component started. With no honest
            signal reachable from here, route-level `loading.tsx` is the correct
            home for navigation feedback. */}

        <div className="relative flex min-h-screen flex-col pb-16 md:pb-0">
          <ConditionalNavbar seoLinks={seoLinks} />
          <main className="flex-1">
            <ConditionalBreadcrumbs />
            {children}
          </main>
          <ConditionalFooter seoLinks={seoLinks} />
        </div>
        {/* The enquiry form and the toaster, loaded when first needed
            rather than with every page. */}
        <EnquiryHost />
        {/* Delegated tel:/mailto:/directions tracking — most of those anchors
            live in server components and cannot carry an onClick. */}
        <LinkTracker />
        <MobileActionBar />

        {/* GA4, Clarity (or the optional GTM container), page views and the
            analytics notice. Decides in the browser whether anything may load:
            never on /admin, in development, on a preview host, or for a
            visitor who said no. See lib/analytics/config.ts. */}
        <Analytics />
      </body>
    </html>
  );
}

