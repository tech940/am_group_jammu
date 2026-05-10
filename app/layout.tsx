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
  metadataBase: new URL("https://amgroup.in"),
  title: {
    default: "AM Group | Premium Automotive Experience",
    template: "%s | AM Group",
  },
  description: "Experience the future of automotive luxury. Discover our premium vehicle collection, world-class service, and innovative finance solutions.",
  keywords: ["luxury cars", "premium automotive", "car dealership", "AM Group", "car service", "finance"],
  authors: [{ name: "AM Group Digital" }],
  creator: "AM Group Digital",
  publisher: "AM Group",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://amgroup.in",
    title: "AM Group | Premium Automotive Experience",
    description: "Experience the future of automotive luxury. Discover our premium vehicle collection.",
    siteName: "AM Group",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AM Group Luxury Automotive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AM Group | Premium Automotive Experience",
    description: "Experience the future of automotive luxury.",
    images: ["/og-image.jpg"],
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

