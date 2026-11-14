"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { removeCar, setCarStatus } from "@/lib/cars/actions"
import { CAR_STATUSES, type CarRow, type CarStatus } from "@/lib/cars/types"
import { LOCATIONS } from "@/lib/locations"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/dialog"
import { Alert, Badge, EmptyState, Spinner } from "@/components/ui/feedback"
import { Field, Input, Select } from "@/components/ui/field"

const STATUS_LABEL: Record<CarStatus, string> = {
  draft: "Draft",
  published: "On the site",
  sold: "Sold",
}

const STATUS_TONE: Record<CarStatus, "neutral" | "success" | "warning"> = {
  draft: "neutral",
  published: "success",
  sold: "warning",
}

/* The desk gets used on phones, so row actions keep the 44px touch floor
   below md and only tighten to the dense 36px size where a pointer is likely. */
const ROW_ACTION = "h-11 px-3.5 md:h-9"

function rupees(value: number | null): string {
  return value === null ? "No price" : `₹${value.toLocaleString("en-IN")}`
}

function locationName(slug: string | null): string {
  if (!slug) return "Location not set"
  return LOCATIONS.find((l) => l.slug === slug)?.shortName ?? slug
}

export function CarsClient({
  cars,
  siteSource,
}: {
  cars: CarRow[]
  siteSource: "database" | "wordpress" | "unavailable"
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<CarStatus | "all">("all")
  // Which row a quick action is running on, so only that row shows as busy.
  const [busyId, setBusyId] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CarRow | null>(null)

  const counts = useMemo(() => {
    const c: Record<CarStatus, number> = { draft: 0, published: 0, sold: 0 }
    for (const car of cars) c[car.status] += 1
    return c
  }, [cars])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cars.filter((car) => {
      if (status !== "all" && car.status !== status) return false
      if (!q) return true
      const haystack = [car.title, car.make, car.model, car.variant, car.year, car.registration, car.id]
        .filter((v) => v !== null && v !== undefined)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [cars, search, status])

  const changeStatus = (car: CarRow, next: CarStatus, done: string) => {
    setBusyId(car.id)
    startTransition(async () => {
      const res = await setCarStatus(car.id, next)
      setBusyId(null)
      if (res.ok) {
        toast({ title: done, description: `${car.title}${car.year ? ` ${car.year}` : ""}` })
        router.refresh()
      } else {
        toast({ title: "That did not save", description: res.error, variant: "destructive" })
      }
    })
  }

  const confirmDelete = () => {
    const car = pendingDelete
    if (!car) return
    setBusyId(car.id)
    startTransition(async () => {
      const res = await removeCar(car.id)
      setBusyId(null)
      setPendingDelete(null)
      if (res.ok) {
        toast({ title: "Car deleted", description: car.title })
        router.refresh()
      } else {
        toast({ title: "The car was not deleted", description: res.error, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-6">
      {siteSource === "wordpress" && (
        <Alert tone={cars.length === 0 ? "warning" : "info"} title="The public site is still reading WordPress">
          {cars.length === 0
            ? "No cars have been added here yet. As soon as the first car is saved here, even as a draft, the site stops reading WordPress and shows only the cars published from this page."
            : "It will switch to the cars on this page within a few minutes."}
        </Alert>
      )}
      {siteSource === "unavailable" && (
        <Alert tone="danger" title="The public site cannot load its cars right now">
          The database is not answering the website. Visitors are being asked to call instead.
        </Alert>
      )}

      {/* Toolbar */}
      <div className="rounded-md border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Field label="Search cars" hideLabel className="flex-1">
            {(field) => (
              <Input
                {...field}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by make, model, year or registration"
              />
            )}
          </Field>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as CarStatus | "all")}
            aria-label="Filter by status"
            className="md:w-56"
          >
            <option value="all">All cars ({cars.length})</option>
            {CAR_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]} ({counts[s]})
              </option>
            ))}
          </Select>
          <Button asChild>
            <Link href="/admin/vehicles/new">Add car</Link>
          </Button>
        </div>
      </div>

      {/* List. Rows, not a table: seven columns do not fit a phone, and staff
          add and mark cars from the yard. */}
      {visible.length === 0 ? (
        <EmptyState
          title={cars.length === 0 ? "No cars yet" : "No cars match"}
          description={
            cars.length === 0
              ? "Add the first car and it will appear here. It goes on the public site only when you publish it."
              : "Try a different search, or switch the status filter back to all cars."
          }
          action={
            cars.length === 0 ? (
              <Button asChild>
                <Link href="/admin/vehicles/new">Add car</Link>
              </Button>
            ) : undefined
          }
          className="rounded-md"
        />
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line bg-surface">
          {visible.map((car) => {
            const busy = busyId === car.id && isPending
            const cover = car.images[0]
            return (
              <li key={car.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
                <Link href={`/admin/vehicles/${car.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                  <span className="flex h-[72px] w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-ground-2">
                    {cover ? (
                      // Plain <img>: imported cars still carry photo addresses on
                      // hosts next/image is not configured for, and it would
                      // throw on those rather than show the photo.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-caption text-ink-2">No photo</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-table font-semibold text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                        {car.title}
                        {car.year ? ` ${car.year}` : ""}
                      </span>
                      <Badge tone={STATUS_TONE[car.status]}>{STATUS_LABEL[car.status]}</Badge>
                    </span>
                    <span data-num className="mt-1 block text-small text-ink-2">
                      {rupees(car.price)}
                      {car.mileage_km !== null && ` · ${car.mileage_km.toLocaleString("en-IN")} km`}
                    </span>
                    <span className="block text-small text-ink-2">
                      {locationName(car.location_slug)}
                      {` · ${car.images.length} photo${car.images.length === 1 ? "" : "s"}`}
                    </span>
                  </span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  {busy && <Spinner label="Saving" className="text-ink-2" />}
                  <Button asChild variant="secondary" className={ROW_ACTION}>
                    <Link href={`/admin/vehicles/${car.id}`}>Edit</Link>
                  </Button>
                  {car.status !== "published" && (
                    <Button
                      type="button"
                      variant="secondary"
                      className={ROW_ACTION}
                      disabled={isPending}
                      onClick={() => changeStatus(car, "published", "Published to the site")}
                    >
                      Publish
                    </Button>
                  )}
                  {car.status !== "sold" && (
                    <Button
                      type="button"
                      variant="secondary"
                      className={ROW_ACTION}
                      disabled={isPending}
                      onClick={() => changeStatus(car, "sold", "Marked as sold")}
                    >
                      Mark sold
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className={`${ROW_ACTION} text-danger-text`}
                    disabled={isPending}
                    onClick={() => setPendingDelete(car)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this car?"
        description={
          pendingDelete
            ? `${pendingDelete.title}${pendingDelete.year ? ` ${pendingDelete.year}` : ""} and its ${pendingDelete.images.length} photo${pendingDelete.images.length === 1 ? "" : "s"} will be removed. If the car was sold, use Mark sold instead, which keeps the record.`
            : ""
        }
        confirmLabel="Delete car"
        pending={isPending && pendingDelete !== null}
      />
    </div>
  )
}
