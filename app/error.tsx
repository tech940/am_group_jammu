"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PRIMARY_LOCATION } from "@/lib/locations"

/**
 * What a visitor sees when a page throws while it is being drawn.
 *
 * Without this file Next falls back to its own bare error screen, with no way
 * on and no phone number. This one sits inside the root layout, so the header,
 * the footer and the phone tab bar are all still there around it.
 *
 * Props are the ones the bundled Next docs give for this version
 * (file-conventions/error.md): `unstable_retry` draws the page again.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // Kept in the console so the cause can be found; the visitor is not shown it.
    console.error(error)
  }, [error])

  return (
    <section aria-labelledby="page-error" className="bg-ground px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 id="page-error" className="font-display text-h1 uppercase text-ink">
          This page could not be shown
        </h1>
        <p className="mt-5 max-w-xl text-body-lg text-ink-2">
          Something went wrong while loading it. Try again, or call us and we will help you
          directly.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" size="lg" onClick={() => unstable_retry()}>
            Try again
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="error-page" data-num>
              {PRIMARY_LOCATION.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
