import type { Metadata } from "next"
import { listCars } from "@/lib/cars/actions"
import { Alert, ErrorState } from "@/components/ui/feedback"
import { CarsClient } from "./cars-client"

export const metadata: Metadata = {
  title: "Cars",
  robots: "noindex, nofollow",
}

// Access is checked twice before anything renders: proxy.ts turns away a
// browser with no admin session, and listCars() calls requireAdmin() itself.
export default async function AdminCarsPage() {
  const listing = await listCars()

  if (listing.state === "not-configured") {
    return (
      <Alert tone="warning" title="The cars database is not connected">
        This deployment has no database key (SUPABASE_SERVICE_ROLE_KEY), so cars cannot be added or
        edited here. The public site is still showing the cars from WordPress.
      </Alert>
    )
  }

  if (listing.state === "table-missing") {
    return (
      <Alert tone="warning" title="The cars table has not been created yet">
        Cars cannot be added or edited until the database table exists. Nothing is broken: the
        public site is still showing the cars from WordPress. Once the table has been created,
        this page will list every car.
      </Alert>
    )
  }

  if (listing.state === "error") {
    return (
      <ErrorState
        title="The cars could not be loaded"
        description={`The database did not answer. Reload the page to try again. (${listing.error})`}
      />
    )
  }

  return <CarsClient cars={listing.cars} siteSource={listing.siteSource} />
}
