import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteFontVariables } from "@/components/system/fonts";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { ConditionalBreadcrumbs } from "@/components/layout/conditional-breadcrumbs";

import { UnlockPricePopup } from "@/components/modals/unlock-price-popup";
import { Toaster } from "@/components/ui/toaster";
import { generateSiteSchema } from "@/lib/seo-schemas";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { locationNames } from "@/lib/seo/locations";
import { LOCATIONS } from "@/lib/locations";
import { getSeoLinks } from "@/lib/seo/links";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/gtm";
import { LinkTracker } from "@/components/analytics/link-tracker";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";

const SITE_TITLE = "Used Cars in Jammu | Certified Pre-Owned | AM Group";
const SITE_DESCRIPTION =
  `Buy and sell used cars in Jammu with AM Group. Second hand cars with real photos and recorded kilometres, ` +
  `finance and exchange, at ${LOCATIONS.length} Jammu locations: ${locationNames()}.`;
const OG_DESCRIPTION =
  `Second hand cars for sale in Jammu with real photos and recorded kilometres. Sell or exchange your car at ${locationNames()}.`;

export const viewport: Viewport = {
  // --color-deep from app/globals.css. A <meta> value cannot read a CSS
  // variable, so this is the one place the token is repeated as a literal.
  themeColor: "#14181e",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "used cars in Jammu",
    "second hand cars in Jammu",
    "certified pre-owned cars Jammu",
    "sell my car Jammu",
    "used car dealer Jammu",
    "car exchange Jammu",
    "used car finance Jammu",
  ],
  applicationName: `${SITE_NAME} Used Cars`,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: "index, follow",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
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
  // Fetched once in the layout (getInventory is cached for 30 min) so the
  // footer and navbar link graph is present in the SERVER-rendered HTML of
  // every page rather than appearing only after hydration.
  const seoLinks = await getSeoLinks();

  return (
    // Font variables live here, at :root, so app/globals.css can resolve them
    // with a plain `@theme`. They were previously attached to a wrapper div on
    // the homepage only, which forced `@theme inline` and left every inner page
    // on a different typeface.
    <html lang="en" className={siteFontVariables}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      </head>
      {/* Ground, ink and font come from the base layer in globals.css, not from
          utility classes here — so a page that forgets them still inherits the
          system rather than Tailwind's defaults. */}
      <body>
        <GoogleTagManagerNoScript />

        {/* Plain <script>, not next/script: next/script defaults to
            afterInteractive, which injects the JSON-LD only after hydration so
            it is absent from the server-rendered HTML a crawler first sees. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        <UnlockPricePopup />
        <Toaster />
        {/* Delegated tel:/mailto:/directions tracking — most of those anchors
            live in server components and cannot carry an onClick. */}
        <LinkTracker />
        <MobileActionBar />

        <GoogleTagManager />
      </body>
    </html>
  );
}

