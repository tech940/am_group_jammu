"use client"

import { useEffect } from "react"
import "./globals.css"
import { siteFontVariables } from "@/components/system/fonts"
import { Button } from "@/components/ui/button"
import { PRIMARY_LOCATION } from "@/lib/locations"

/**
 * The last resort: shown when the root layout itself throws, which app/error.tsx
 * cannot catch because it lives inside that layout.
 *
 * It REPLACES the root layout while it is showing, so it brings its own <html>
 * and <body>, the stylesheet and the fonts (bundled Next docs,
 * file-conventions/error.md, "Global Error"). There is no header or footer
 * here on purpose: whatever broke may be one of them. A heading, a way to try
 * again, a link home and the phone number are enough to not leave a visitor
 * stranded.
 *
 * A Client Component cannot export `metadata`, so the title is a plain
 * <title>, which React moves into the head.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en-IN" className={siteFontVariables}>
      <body>
        <title>Something went wrong | AM Group</title>
        <main className="min-h-screen bg-ground px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-h1 uppercase text-ink">
              This page could not be shown
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-ink-2">
              Something went wrong while loading the site. Try again, or call us and we will help
              you directly.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button type="button" variant="primary" size="lg" onClick={() => unstable_retry()}>
                Try again
              </Button>
              <Button asChild variant="secondary" size="lg">
                {/* A plain link, not next/link: a full page load is the surest
                    way out of whatever state broke the layout. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/">Go to the homepage</a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-num>
                  {PRIMARY_LOCATION.phone}
                </a>
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
