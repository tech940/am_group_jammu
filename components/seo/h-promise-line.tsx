import { H_PROMISE } from "@/lib/locations"

/**
 * The H Promise (Hyundai certified used cars) phone line.
 *
 * Renders nothing until the company supplies the number — H_PROMISE in
 * lib/locations.ts is null while NEXT_PUBLIC_HPROMISE_PHONE is unset — so no
 * page ever shows a guessed number. Nothing here types a number.
 */
export function HPromiseLine({
  track,
  onDeep = false,
  className = "",
}: {
  /** data-track-location value for the tel: anchor. */
  track: string
  onDeep?: boolean
  className?: string
}) {
  if (!H_PROMISE) return null

  return (
    <p className={`text-small ${onDeep ? "text-on-deep-2" : "text-ink-2"} ${className}`}>
      H Promise (Hyundai certified used cars):{" "}
      <a
        href={`tel:${H_PROMISE.phoneE164}`}
        data-track-location={track}
        data-num
        className={`inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline ${
          onDeep ? "text-on-deep" : "text-ink"
        }`}
      >
        {H_PROMISE.phone}
      </a>
    </p>
  )
}
