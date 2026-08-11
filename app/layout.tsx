import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteFontVariables } from "@/components/system/fonts";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { ConditionalBreadcrumbs } from "@/components/layout/conditional-breadcrumbs";

import { UnlockPricePopup } from "@/components/modals/unlock-price-popup";
import { Toaster } from "@/components/ui/toaster";
import { generateLocalBusinessSchema } from "@/lib/seo-schemas";
import { getSeoLinks } from "@/lib/seo/links";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/gtm";
import { LinkTracker } from "@/components/analytics/link-tracker";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";

export const viewport: Viewport = {
  themeColor: "#133a63",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://amgroupind.com"),
  title: {
    default: "AM Group Jammu | Car Dealerships, Service & Finance in J&K",
    template: "%s | AM Group Jammu",
  },
  description: "AM Group is J&K's trusted automotive conglomerate since 1968 — new & certified used cars in Jammu and Srinagar, authorised showrooms, service workshops, and easy car finance.",
  keywords: ["car dealership Jammu", "new cars Jammu", "used cars Jammu", "AM Group Jammu", "car service Jammu", "car finance J&K"],
  authors: [{ name: "AM Group" }],
  creator: "AM Group",
  publisher: "AM Group",
  robots: "index, follow",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://amgroupind.com",
    title: "AM Group Jammu | Car Dealerships, Service & Finance in J&K",
    description: "New & certified used cars in Jammu and Srinagar, authorised showrooms, service workshops, and easy car finance.",
    siteName: "AM Group Jammu",
    images: [
      {
        url: "/inventory_hero_bg.png",
        width: 1200,
        height: 630,
        alt: "AM Group Jammu - Automotive Dealerships in J&K",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AM Group Jammu | Car Dealerships, Service & Finance in J&K",
    description: "New & certified used cars in Jammu and Srinagar, authorised showrooms, service workshops, and easy car finance.",
    images: ["/inventory_hero_bg.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateLocalBusinessSchema();
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

