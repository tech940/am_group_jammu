"use client"

import { useEffect, useRef, useState } from "react"
import { startPhotoUpload } from "@/lib/cars/actions"
import { Button } from "@/components/ui/button"
import { Alert, Spinner } from "@/components/ui/feedback"
import { ChevronGlyph, CloseGlyph } from "@/components/system/marks"

/** Longest edge of a stored photo. The public gallery never shows one larger. */
const MAX_EDGE = 1600
const JPEG_QUALITY = 0.82
/** Must match the cap the server enforces in lib/cars/actions.ts. */
const MAX_PHOTOS = 40

/** A decoded photo, from whichever decoder this browser has. */
type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void }

async function decode(file: File): Promise<Decoded> {
  // `from-image` applies the rotation a phone records in the file, so a
  // portrait photo is not stored lying on its side.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() }
    } catch {
      // Fall through: some browsers can show a format they cannot bitmap.
    }
  }
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = objectUrl
    await img.decode()
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(objectUrl),
    }
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw new Error("this phone or browser cannot open that kind of photo. Save it as a JPEG and try again")
  }
}

/**
 * Shrink a photo in the browser before it is sent. A phone photo is 4 to 8 MB;
 * at 1600px and JPEG quality 0.82 it is a few hundred KB, which is the
 * difference between an upload that works on mobile data and one that does not.
 */
async function shrinkToJpeg(file: File): Promise<Blob> {
  const photo = await decode(file)
  try {
    if (photo.width === 0 || photo.height === 0) throw new Error("the photo is empty")
    const scale = Math.min(1, MAX_EDGE / Math.max(photo.width, photo.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(photo.width * scale))
    canvas.height = Math.max(1, Math.round(photo.height * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("this browser could not resize the photo")
    // JPEG has no transparency: without a white base, the clear parts of a PNG
    // come out as solid black.
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(photo.source, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY))
    if (!blob) throw new Error("this browser could not resize the photo")
    return blob
  } finally {
    photo.release()
  }
}

/**
 * Send one photo straight to storage.
 *
 * This is the same request @supabase/storage-js makes in `uploadToSignedUrl`
 * for a Blob: a PUT of multipart form data holding `cacheControl` and the file
 * under an empty field name, with an `x-upsert` header. The one-time token is
 * already in the address, so no key of ours is in the browser.
 */
async function sendToStorage(signedUrl: string, blob: Blob): Promise<void> {
  const body = new FormData()
  // A year. Every photo gets a fresh random name, so an address never changes
  // what it shows and can be cached for as long as a browser likes.
  body.append("cacheControl", "31536000")
  body.append("", blob)
  const res = await fetch(signedUrl, { method: "PUT", headers: { "x-upsert": "false" }, body })
  if (!res.ok) throw new Error(`storage refused the photo (${res.status})`)
}

export function PhotoManager({
  carId,
  images,
  onChange,
  onBusyChange,
  error,
}: {
  /** Null for a car that has not been saved yet. */
  carId: number | null
  images: string[]
  onChange: (next: string[]) => void
  /** Lets the form hold Save while photos are still going up. */
  onBusyChange: (busy: boolean) => void
  error?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  // The folder this car's photos go in. A car with no id yet gets a throwaway
  // name, made once and reused so one car's photos stay together.
  const keyRef = useRef<string | null>(carId === null ? null : String(carId))
  // Kept in a ref as well as in props: several photos finish one after another
  // inside a single handler, and each must add to the list the one before left.
  const latest = useRef(images)
  useEffect(() => {
    latest.current = images
  }, [images])

  const [remaining, setRemaining] = useState(0)
  const [problems, setProblems] = useState<string[]>([])

  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_PHOTOS - latest.current.length
    const chosen = [...files].slice(0, Math.max(0, room))
    const failed: string[] = []
    if (files.length > chosen.length) {
      failed.push(`A car can have ${MAX_PHOTOS} photos. ${files.length - chosen.length} of the photos you picked were left out.`)
    }
    if (!keyRef.current) {
      keyRef.current = `new-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
    }

    setProblems([])
    setRemaining(chosen.length)
    onBusyChange(true)

    // One at a time. On mobile data, several uploads at once each crawl and
    // then time out together; in sequence each one finishes.
    for (const [i, file] of chosen.entries()) {
      try {
        const blob = await shrinkToJpeg(file)
        const target = await startPhotoUpload(keyRef.current, file.name, "image/jpeg")
        if (!target.ok) throw new Error(target.error)
        await sendToStorage(target.signedUrl, blob)
        const next = [...latest.current, target.publicUrl]
        latest.current = next
        onChange(next)
      } catch (err) {
        failed.push(`${file.name}: ${err instanceof Error ? err.message : "the upload failed"}.`)
      }
      setRemaining(chosen.length - i - 1)
    }

    setProblems(failed)
    onBusyChange(false)
    // Clear the input so picking the same file again still fires a change.
    if (inputRef.current) inputRef.current.value = ""
  }

  const move = (index: number, by: -1 | 1) => {
    const to = index + by
    if (to < 0 || to >= images.length) return
    const next = [...images]
    ;[next[index], next[to]] = [next[to], next[index]]
    onChange(next)
  }

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index))

  const uploading = remaining > 0
  const TILE_BUTTON =
    "flex h-11 flex-1 cursor-pointer items-center justify-center transition-colors duration-(--duration-1) " +
    "hover:bg-ground-2 disabled:cursor-not-allowed disabled:text-ink-3"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void pick(e.target.files)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={uploading || images.length >= MAX_PHOTOS}
          onClick={() => inputRef.current?.click()}
        >
          {uploading && <Spinner label="Uploading" />}
          {uploading ? `Uploading, ${remaining} to go` : "Add photos"}
        </Button>
        <p className="text-small text-ink-2">
          {images.length === 0
            ? "No photos yet. You can pick several at once."
            : "The first photo is the cover shown on the listing."}
        </p>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {problems.length > 0 && (
        <Alert tone="danger" title="Some photos were not added">
          <ul className="space-y-1">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Alert>
      )}

      {images.length > 0 && (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, i) => (
            <li key={url} className="overflow-hidden rounded-sm border border-line bg-surface">
              <div className="relative aspect-[4/3] bg-ground-2">
                {/* Plain <img>: an imported car's photos can sit on a host
                    next/image is not configured for. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-sm bg-surface px-2 py-0.5 text-meta uppercase text-ink">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex divide-x divide-line border-t border-line">
                <button
                  type="button"
                  className={`${TILE_BUTTON} text-ink`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label={`Move photo ${i + 1} earlier`}
                >
                  <ChevronGlyph direction="left" />
                </button>
                <button
                  type="button"
                  className={`${TILE_BUTTON} text-ink`}
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`Move photo ${i + 1} later`}
                >
                  <ChevronGlyph direction="right" />
                </button>
                <button
                  type="button"
                  className={`${TILE_BUTTON} text-danger-text`}
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <CloseGlyph />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
