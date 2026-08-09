import type { Metadata, Viewport } from "next";
import { Inter, Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { ConditionalBreadcrumbs } from "@/components/layout/conditional-breadcrumbs";

import { PageLoader } from "@/components/ui/page-loader";
import { UnlockPricePopup } from "@/components/modals/unlock-price-popup";
import { Toaster } from "@/components/ui/toaster";
import { generateLocalBusinessSchema } from "@/lib/seo-schemas";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#023468",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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

import Script from "next/script";
import { Suspense } from "react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateLocalBusinessSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${lato.variable} font-lato antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        <Script
          id="local-business-schema"
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


          <div className="relative flex min-h-screen flex-col">
            <ConditionalNavbar />
            <main className="flex-1">
              <ConditionalBreadcrumbs />
              {children}
            </main>
            <ConditionalFooter />

          </div>
          <UnlockPricePopup />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

