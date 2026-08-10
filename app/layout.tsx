import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { ConditionalBreadcrumbs } from "@/components/layout/conditional-breadcrumbs";

import { PageLoader } from "@/components/ui/page-loader";
import { UnlockPricePopup } from "@/components/modals/unlock-price-popup";
import { Toaster } from "@/components/ui/toaster";
import { generateLocalBusinessSchema } from "@/lib/seo-schemas";
import { getSeoLinks } from "@/lib/seo/links";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/gtm";
import { LinkTracker } from "@/components/analytics/link-tracker";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  // Lato only publishes 100/300/400/700/900. Weight 100 is used nowhere in the
  // app, and Inter was previously loaded alongside this but referenced by
  // nothing — globals.css maps --font-sans to --font-lato, so every byte of it
  // was wasted on the critical path.
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#023468",
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

import { Suspense } from "react";


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
    <html lang="en" suppressHydrationWarning>
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
      <body
        className={`${lato.variable} font-lato antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        <GoogleTagManagerNoScript />

        {/* Plain <script>, not next/script: next/script defaults to
            afterInteractive, which injects the JSON-LD only after hydration so
            it is absent from the server-rendered HTML a crawler first sees. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>


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
        </ThemeProvider>

        <GoogleTagManager />
      </body>
    </html>
  );
}

