"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveCar } from "@/lib/cars/actions"
import {
  BODY_TYPES,
  CONDITIONS,
  FUELS,
  TRANSMISSIONS,
  type CarInput,
  type CarRow,
  type CarStatus,
} from "@/lib/cars/types"
import { LOCATIONS } from "@/lib/locations"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Alert, Badge, Spinner } from "@/components/ui/feedback"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { ChevronGlyph } from "@/components/system/marks"
import { PhotoManager } from "./photo-manager"

/** Every box on the form holds text while it is being typed, numbers included. */
interface FormState {
  title: string
  make: string
  model: string
  variant: string
  year: string
  price: string
  original_price: string
  mileage_km: string
  fuel: string
  transmission: string
  drivetrain: string
  body_type: string
  colour: string
  engine: string
  condition: string
  owners: string
  registration: string
  location_slug: string
  description: string
}

type FieldName = keyof FormState | "images" | "status"

const str = (v: string | number | null | undefined): string => (v === null || v === undefined ? "" : String(v))

function initialState(car: CarRow | null): FormState {
  return {
    title: str(car?.title),
    make: str(car?.make),
    model: str(car?.model),
    variant: str(car?.variant),
    year: str(car?.year),
    price: str(car?.price),
    original_price: str(car?.original_price),
    mileage_km: str(car?.mileage_km),
    fuel: str(car?.fuel),
    transmission: str(car?.transmission),
    drivetrain: str(car?.drivetrain),
    body_type: str(car?.body_type),
    colour: str(car?.colour),
    engine: str(car?.engine),
    condition: str(car?.condition),
    owners: str(car?.owners),
    registration: str(car?.registration),
    location_slug: str(car?.location_slug),
    description: str(car?.description),
  }
}

/**
 * The choices for a select, plus whatever the car already has. An imported car
 * can carry a value that is not on our list ("AMT", "Coupe"); dropping it from
 * the menu would silently blank the field the next time the car was saved.
 */
function withCurrent(options: readonly string[], current: string): string[] {
  return current && !options.includes(current) ? [current, ...options] : [...options]
}

/** An empty box is "not known", never zero. The server checks the ranges. */
function toNumber(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, "")
  if (!cleaned) return null
  const n = Number(cleaned)
  // NaN is sent on so the server reports the field rather than saving a blank.
  return Number.isFinite(n) ? n : Number.NaN
}

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

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-surface p-4 md:p-6">
      <h2 className="font-display text-h4 uppercase text-ink">{title}</h2>
      {hint && <p className="mt-1 text-small text-ink-2">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2"

export function CarForm({ car }: { car: CarRow | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<FormState>(() => initialState(car))
  const [images, setImages] = useState<string[]>(car?.images ?? [])
  const [photosBusy, setPhotosBusy] = useState(false)
  const [error, setError] = useState<{ field: FieldName | null; message: string } | null>(null)
  // Which button was pressed, so only that one shows the spinner.
  const [savingAs, setSavingAs] = useState<CarStatus | null>(null)

  const currentStatus: CarStatus = car?.status ?? "draft"

  const set = (name: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }))
    if (error?.field === name) setError(null)
  }

  const errorFor = (name: FieldName): string | null => (error?.field === name ? error.message : null)

  const save = (status: CarStatus) => {
    const input: CarInput = {
      status,
      title: form.title,
      make: form.make,
      model: form.model,
      variant: form.variant,
      year: toNumber(form.year),
      price: toNumber(form.price),
      original_price: toNumber(form.original_price),
      mileage_km: toNumber(form.mileage_km),
      fuel: form.fuel,
      transmission: form.transmission,
      drivetrain: form.drivetrain,
      body_type: form.body_type,
      colour: form.colour,
      engine: form.engine,
      condition: form.condition,
      owners: toNumber(form.owners),
      registration: form.registration,
      location_slug: form.location_slug || null,
      description: form.description,
      images,
    }

    setError(null)
    setSavingAs(status)
    startTransition(async () => {
      let res: Awaited<ReturnType<typeof saveCar>>
      try {
        res = await saveCar(car?.id ?? null, input)
      } catch {
        // The action itself throws only when the session has ended or the
        // network dropped; the typed form is still on screen either way.
        res = { ok: false, error: "The car was not saved. Check your connection, or sign in again in another tab, then press save once more." }
      }
      setSavingAs(null)
      if (!res.ok) {
        const field = (res.field ?? null) as FieldName | null
        setError({ field, message: res.error })
        toast({ title: "The car was not saved", description: res.error, variant: "destructive" })
        return
      }
      toast({
        title: status === "published" ? "Saved and on the site" : status === "sold" ? "Saved as sold" : "Saved as a draft",
        description: `${res.car.title}${res.car.year ? ` ${res.car.year}` : ""}`,
      })
      router.push("/admin/vehicles")
      router.refresh()
    })
  }

  const blocked = isPending || photosBusy
  const saveButton = (status: CarStatus, label: string, variant: "primary" | "secondary") => (
    <Button
      type="button"
      variant={variant}
      disabled={blocked}
      onClick={() => save(status)}
      className="max-sm:flex-1"
    >
      {savingAs === status && <Spinner label="Saving" />}
      {label}
    </Button>
  )

  return (
    <form
      className="space-y-6"
      // Enter in a text box must not pick a status by accident: saving is
      // always one of the named buttons below.
      onSubmit={(e) => e.preventDefault()}
      noValidate
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/vehicles"
          className="inline-flex min-h-11 items-center gap-1.5 text-label text-ink-2 transition-colors duration-(--duration-1) hover:text-ink"
        >
          <ChevronGlyph direction="left" />
          All cars
        </Link>
        <div className="flex items-center gap-3">
          {car && <span data-num className="text-small text-ink-2">Car {car.id}</span>}
          <Badge tone={STATUS_TONE[currentStatus]}>{car ? STATUS_LABEL[currentStatus] : "New car"}</Badge>
        </div>
      </div>

      {error && error.field === null && <Alert tone="danger">{error.message}</Alert>}

      <Section title="The car" hint="The title is what buyers see, without the year: Hyundai i20.">
        <div className={GRID}>
          <Field label="Title" required error={errorFor("title")} className="sm:col-span-2">
            {(f) => <Input {...f} value={form.title} onChange={set("title")} maxLength={120} autoComplete="off" />}
          </Field>
          <Field label="Make" required error={errorFor("make")}>
            {(f) => <Input {...f} value={form.make} onChange={set("make")} maxLength={60} autoComplete="off" />}
          </Field>
          <Field label="Model" required error={errorFor("model")}>
            {(f) => <Input {...f} value={form.model} onChange={set("model")} maxLength={60} autoComplete="off" />}
          </Field>
          <Field label="Variant" error={errorFor("variant")}>
            {(f) => <Input {...f} value={form.variant} onChange={set("variant")} maxLength={80} autoComplete="off" />}
          </Field>
          <Field label="Year" error={errorFor("year")}>
            {(f) => <Input {...f} value={form.year} onChange={set("year")} inputMode="numeric" maxLength={4} autoComplete="off" />}
          </Field>
        </div>
      </Section>

      <Section title="Price and running">
        <div className={GRID}>
          <Field label="Asking price (₹)" help="Whole rupees, for example 525000." error={errorFor("price")}>
            {(f) => <Input {...f} value={form.price} onChange={set("price")} inputMode="numeric" autoComplete="off" />}
          </Field>
          <Field
            label="Original price (₹)"
            help="Optional. The higher price shown struck through."
            error={errorFor("original_price")}
          >
            {(f) => (
              <Input {...f} value={form.original_price} onChange={set("original_price")} inputMode="numeric" autoComplete="off" />
            )}
          </Field>
          <Field label="Kilometres driven" error={errorFor("mileage_km")}>
            {(f) => <Input {...f} value={form.mileage_km} onChange={set("mileage_km")} inputMode="numeric" autoComplete="off" />}
          </Field>
          <Field label="Number of owners" error={errorFor("owners")}>
            {(f) => <Input {...f} value={form.owners} onChange={set("owners")} inputMode="numeric" maxLength={2} autoComplete="off" />}
          </Field>
        </div>
      </Section>

      <Section title="Details">
        <div className={GRID}>
          <Field label="Fuel" error={errorFor("fuel")}>
            {(f) => (
              <Select {...f} value={form.fuel} onChange={set("fuel")}>
                <option value="">Not set</option>
                {withCurrent(FUELS, form.fuel).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Transmission" error={errorFor("transmission")}>
            {(f) => (
              <Select {...f} value={form.transmission} onChange={set("transmission")}>
                <option value="">Not set</option>
                {withCurrent(TRANSMISSIONS, form.transmission).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Body type" error={errorFor("body_type")}>
            {(f) => (
              <Select {...f} value={form.body_type} onChange={set("body_type")}>
                <option value="">Not set</option>
                {withCurrent(BODY_TYPES, form.body_type).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Condition" error={errorFor("condition")}>
            {(f) => (
              <Select {...f} value={form.condition} onChange={set("condition")}>
                <option value="">Not set</option>
                {withCurrent(CONDITIONS, form.condition).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Drivetrain" help="For example FWD, RWD, 4WD." error={errorFor("drivetrain")}>
            {(f) => <Input {...f} value={form.drivetrain} onChange={set("drivetrain")} maxLength={30} autoComplete="off" />}
          </Field>
          <Field label="Engine" help="For example 1.2L or 1197 cc." error={errorFor("engine")}>
            {(f) => <Input {...f} value={form.engine} onChange={set("engine")} maxLength={60} autoComplete="off" />}
          </Field>
          <Field label="Colour" error={errorFor("colour")}>
            {(f) => <Input {...f} value={form.colour} onChange={set("colour")} maxLength={40} autoComplete="off" />}
          </Field>
          <Field
            label="Registration series"
            help="The series only, for example JK02. Never the full number plate."
            error={errorFor("registration")}
          >
            {(f) => (
              <Input {...f} value={form.registration} onChange={set("registration")} maxLength={8} autoCapitalize="characters" autoComplete="off" />
            )}
          </Field>
          <Field label="Where the car is" error={errorFor("location_slug")} className="sm:col-span-2">
            {(f) => (
              <Select {...f} value={form.location_slug} onChange={set("location_slug")}>
                <option value="">Not set</option>
                {LOCATIONS.map((l) => (
                  <option key={l.slug} value={l.slug}>{l.shortName}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Description" error={errorFor("description")} className="sm:col-span-2">
            {(f) => <Textarea {...f} value={form.description} onChange={set("description")} rows={6} maxLength={5000} />}
          </Field>
        </div>
      </Section>

      <Section
        title="Photos"
        hint="Photos are made smaller on this device before they are sent, so they upload quickly on mobile data."
      >
        <PhotoManager
          carId={car?.id ?? null}
          images={images}
          onChange={(next) => {
            setImages(next)
            if (error?.field === "images") setError(null)
          }}
          onBusyChange={setPhotosBusy}
          error={errorFor("images")}
        />
      </Section>

      {/* Pinned to the bottom of the screen so saving never needs a scroll to
          the end of a long form on a phone. */}
      <div className="sticky bottom-0 z-20 -mx-5 border-t border-line bg-surface px-5 py-3 md:-mx-6 md:px-6">
        {error && error.field !== null && (
          <p role="alert" className="mb-2 text-small text-danger-text">
            {error.message}
          </p>
        )}
        {photosBusy && <p className="mb-2 text-small text-ink-2">Photos are still uploading. You can save when they finish.</p>}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {currentStatus === "published" ? (
            <>
              {saveButton("draft", "Take off the site", "secondary")}
              {saveButton("sold", "Save as sold", "secondary")}
              {saveButton("published", "Save changes", "primary")}
            </>
          ) : currentStatus === "sold" ? (
            <>
              {saveButton("sold", "Save changes", "secondary")}
              {saveButton("published", "Publish again", "primary")}
            </>
          ) : (
            <>
              {saveButton("draft", "Save as draft", "secondary")}
              {saveButton("published", "Publish", "primary")}
            </>
          )}
        </div>
      </div>
    </form>
  )
}
