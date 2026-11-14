import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCar } from "@/lib/cars/actions"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/feedback"
import { CarForm } from "./car-form"

export const metadata: Metadata = {
  title: "Car",
  robots: "noindex, nofollow",
}

// One form for both jobs: /admin/vehicles/new adds a car, /admin/vehicles/123
// edits car 123. It is a page rather than a dialog because the form is long
// and staff fill it in on a phone, where a stray tap outside a dialog would
// throw away everything typed and every photo uploaded.
export default async function AdminCarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === "new") return <CarForm car={null} />

  if (!/^\d{1,15}$/.test(id)) notFound()
  const result = await getCar(Number(id))

  if (!result.ok) {
    return (
      <ErrorState
        title="This car could not be opened"
        description={result.error}
        action={
          <Button asChild variant="secondary">
            <Link href="/admin/vehicles">Back to all cars</Link>
          </Button>
        }
        className="rounded-md"
      />
    )
  }

  return <CarForm car={result.car} />
}
