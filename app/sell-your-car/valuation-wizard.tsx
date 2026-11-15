"use client"

import { rememberEnquirySent } from "@/lib/leads/enquiry-memory"
import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/field"
import { CheckGlyph, ChevronGlyph } from "@/components/system/marks"
import { submitLead } from "@/lib/leads/actions"
import { CONSENT_TEXT, type CreateLeadInput } from "@/lib/leads/types"
import { validateLead } from "@/lib/leads/validation"
import { pushEvent } from "@/lib/analytics/gtm"
import { attributionParams, getAttribution } from "@/lib/analytics/attribution"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { MAKES, MODELS_SHOWN_FIRST, OLDEST_YEAR_OFFERED } from "./car-models"

/**
 * "What's your car worth?" — the valuation form, in three short steps.
 *
 *   1  Your car      make, model, year            (three taps, no typing)
 *   2  Details       when we can see it, whether you are also buying, km
 *   3  Your number   name and mobile, then send
 *
 * WHY STEPS, NOT ONE FORM. The old page had a button that opened the general
 * enquiry sheet with an empty message box. A seller had to know to type the
 * make, model, year and kilometres, and most did not, so the sales desk's
 * first call was spent collecting them. Here each answer is a tap, the phone
 * number is asked for LAST (after the seller has already invested a minute),
 * and the lead arrives with everything the evaluator needs.
 *
 * WHAT IS SENT. An ordinary lead through `submitLead`, intent "Sell Your Car",
 * with the answers written into the message in plain lines. No new table and
 * no new column: the admin lead screen and the lead email already show the
 * message.
 *
 * It does NOT show a price. The page says an evaluator calls and the price
 * follows a look at the car, and that is all the form promises.
 */

type Stage = "make" | "model" | "year" | "details" | "contact"

interface Answers {
  make: string
  model: string
  year: string
  when: string
  alsoBuying: "" | "Yes" | "No"
  km: string
}

const EMPTY: Answers = { make: "", model: "", year: "", when: "", alsoBuying: "", km: "" }

const STEP_OF: Record<Stage, 1 | 2 | 3> = { make: 1, model: 1, year: 1, details: 2, contact: 3 }
const STEP_NAME = { 1: "Your car", 2: "Details", 3: "Your number" } as const

type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string; fields: Record<string, string>; name: string; phone: string }
  | { status: "success"; duplicate: boolean; leadId: string; name: string }

/** A tap target in a grid of choices. */
const CHOICE =
  "min-h-11 rounded-sm border border-line bg-ground-2 px-2 py-2 text-center text-label text-ink " +
  "transition-colors duration-(--duration-1) hover:border-pop hover:bg-pop-bg cursor-pointer " +
  "aria-pressed:border-pop aria-pressed:bg-pop-bg aria-pressed:text-pop-text"

const TEXT_LINK =
  "inline-flex min-h-11 items-center text-label text-ink underline underline-offset-4 " +
  "transition-colors duration-(--duration-1) hover:text-accent cursor-pointer"

/**
 * The next seven days. Sundays are included: AM Hyundai Gandhi Nagar is open
 * on Sundays (owner-confirmed, 2026-11-15), so a seller can be seen then.
 */
function openDays(): { value: string; top: string; bottom: string }[] {
  const out: { value: string; top: string; bottom: string }[] = []
  const day = new Date()
  for (let i = 0; out.length < 7 && i < 14; i++) {
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate() + i)
    const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    const weekday = d.toLocaleDateString("en-IN", { weekday: "short" })
    const top = i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekday
    out.push({ value: `${weekday} ${date}`, top, bottom: date })
  }
  return out
}

export function ValuationWizard({ sourceLabel = "sell-wizard" }: { sourceLabel?: string }) {
  const pathname = usePathname()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const kmId = useId()

  const [stage, setStage] = useState<Stage>("make")
  const [answers, setAnswers] = useState<Answers>(EMPTY)
  const [allModels, setAllModels] = useState(false)
  /** "Other brand" / "Other model": a typed answer instead of a tap. */
  const [typing, setTyping] = useState<"" | "make" | "model">("")
  const [typed, setTyped] = useState("")
  const started = useRef(false)

  // The days are worked out in the browser only, after mount: "today" on the
  // server (UTC) is not always today in Jammu, and rendering it on both sides
  // would make the two HTMLs disagree.
  const [days, setDays] = useState<ReturnType<typeof openDays>>([])
  const [thisYear, setThisYear] = useState<number | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only values, set once after mount
    setDays(openDays())
    setThisYear(new Date().getFullYear())
  }, [])

  const make = useMemo(() => MAKES.find((m) => m.name === answers.make) ?? null, [answers.make])
  // Make and model only. The year is its own line: "Older than 2012" is a
  // valid answer, and it does not read as part of a car's name.
  const car = [answers.make, answers.model].filter(Boolean).join(" ")
  /** A make typed under "Other brand" has no list of models to tap. */
  const typedMake = Boolean(answers.make) && !make

  const go = (next: Stage, direction: "forward" | "back" = "forward") => {
    setStage(next)
    // A typed make has no model buttons, so its model step is always the text
    // box - going back to it must not clear the box away and leave nothing.
    const typedModelStep = next === "model" && Boolean(answers.make) && !MAKES.some((m) => m.name === answers.make)
    setTyping(typedModelStep ? "model" : "")
    setTyped(typedModelStep ? answers.model : "")
    // Move focus to the new question so a keyboard or screen-reader user is
    // told what changed. A timer, not an animation frame: frames do not arrive
    // in a tab that is not being painted.
    window.setTimeout(() => headingRef.current?.focus(), 0)
    if (direction === "forward") pushEvent("sell_form_step", { form_id: "sell-wizard", step: next })
  }

  const begin = () => {
    if (started.current) return
    started.current = true
    pushEvent("form_start", { form_id: "sell-wizard", lead_intent: "Sell Your Car", lead_source_label: sourceLabel })
  }

  // Changing the make clears the model and year (they belonged to the old
  // make) but keeps the day, the kilometres and the buying answer, which are
  // about the seller, not the car. Tapping the same answer again changes nothing.
  const pickMake = (name: string) => {
    begin()
    if (name !== answers.make) setAnswers((a) => ({ ...a, make: name, model: "", year: "" }))
    setAllModels(false)
    setStage("model")
    setTyping("")
    setTyped("")
    window.setTimeout(() => headingRef.current?.focus(), 0)
    pushEvent("sell_form_step", { form_id: "sell-wizard", step: "model" })
  }
  const pickModel = (name: string) => {
    setAnswers((a) => (a.model === name ? a : { ...a, model: name, year: "" }))
    setStage("year")
    setTyping("")
    setTyped("")
    window.setTimeout(() => headingRef.current?.focus(), 0)
    pushEvent("sell_form_step", { form_id: "sell-wizard", step: "year" })
  }
  const pickYear = (year: string) => {
    setAnswers((a) => ({ ...a, year }))
    go("details")
  }

  const submitTyped = () => {
    const value = typed.trim().slice(0, 60)
    if (!value) return
    if (typing === "make") {
      begin()
      // If they typed a make that is on the list, treat it as a tap on it.
      const listed = MAKES.find((m) => m.name.toLowerCase() === value.toLowerCase())
      if (listed) {
        pickMake(listed.name)
        return
      }
      // Otherwise there is no model list, so the model is asked for as text.
      if (value !== answers.make) setAnswers((a) => ({ ...a, make: value, model: "", year: "" }))
      setStage("model")
      setTyping("model")
      setTyped("")
      window.setTimeout(() => headingRef.current?.focus(), 0)
      pushEvent("sell_form_step", { form_id: "sell-wizard", step: "model" })
    } else {
      pickModel(value)
    }
  }

  /** Back, including out of the "Other brand" / "Other model" text box. */
  const goBack = () => {
    if (stage === "make" && typing === "make") {
      setTyping("")
      setTyped("")
      window.setTimeout(() => headingRef.current?.focus(), 0)
      return
    }
    if (stage === "model" && typing === "model" && !typedMake) {
      // "Other model" for a listed make: back to that make's buttons.
      setTyping("")
      setTyped("")
      window.setTimeout(() => headingRef.current?.focus(), 0)
      return
    }
    const previous: Record<Stage, Stage | null> = {
      make: null,
      model: "make",
      year: "model",
      details: "year",
      contact: "details",
    }
    const to = previous[stage]
    if (to) go(to, "back")
  }

  const [state, formAction, sending] = useActionState(
    async (_prev: SubmitState, fd: FormData): Promise<SubmitState> => {
      const name = String(fd.get("name") ?? "")
      const phone = String(fd.get("phone") ?? "")
      const km = answers.km.replace(/[^\d]/g, "")

      const lines = [
        "Sent from the car valuation form.",
        `Car: ${car || "not given"}`,
        `Year: ${answers.year ? answers.year.replace(/^Older/, "older") : "not given"}`,
        `Kilometres: ${km ? Number(km).toLocaleString("en-IN") : "not given"}`,
        `Can show the car: ${answers.when || "to be agreed on the call"}`,
        `Also looking at a car from us: ${answers.alsoBuying || "not answered"}`,
      ]

      const input: CreateLeadInput = {
        name,
        phone,
        message: lines.join("\n"),
        intent: "Sell Your Car",
        sourcePath: pathname,
        sourceLabel,
        // What the sentence at the send button says, and no more than that.
        consent: true,
        consentScope: "enquiry",
        attribution: getAttribution(),
        companyWebsite: String(fd.get("companyWebsite") ?? ""),
        vehicle: null,
      }

      // The same validator the server runs, run here first so a mistake is
      // shown against its field without a round trip.
      const check = validateLead(input)
      if (!check.ok && !check.errors._bot) {
        return {
          status: "error",
          message: Object.values(check.errors)[0] ?? "Please check your name and number.",
          fields: check.errors,
          name,
          phone,
        }
      }

      // A dropped connection or a tab left open across a deploy rejects the
      // request itself. Caught here so the answers stay on screen; uncaught,
      // the page's error boundary would replace the form and lose them.
      let result: Awaited<ReturnType<typeof submitLead>>
      try {
        result = await submitLead(input)
      } catch {
        return {
          status: "error",
          message: "We could not send this. Please check your connection and try again.",
          fields: {},
          name,
          phone,
        }
      }
      if (!result.ok) return { status: "error", message: result.error, fields: {}, name, phone }
      return { status: "success", duplicate: result.data.duplicate, leadId: result.data.id, name: name.trim() }
    },
    { status: "idle" },
  )

  // Count the conversion once per real new lead. A honeypot hit answers ok
  // with the id "ignored", and a repeat is folded into the earlier lead;
  // neither is a new enquiry.
  const reported = useRef<SubmitState | null>(null)
  useEffect(() => {
    // Keyed on the state object, so changing an answer while an error is on
    // screen does not report the same error again.
    if (reported.current === state) return
    reported.current = state
    if (state.status === "success") {
      // Someone who has just sent this is not shown the timed enquiry form.
      rememberEnquirySent()
      if (state.leadId !== "ignored" && !state.duplicate) {
        pushEvent("generate_lead", {
          lead_intent: "Sell Your Car",
          lead_source_label: sourceLabel,
          lead_source_path: pathname,
          form_id: "sell-wizard",
          value: 0,
          // Only a make from the list. A typed one is free text, and nothing a
          // visitor types is sent to analytics.
          sell_make: make ? make.name : "other",
          sell_year: answers.year,
          ...attributionParams(),
        })
      }
      window.setTimeout(() => headingRef.current?.focus(), 0)
    }
    if (state.status === "error") {
      pushEvent("form_error", { form_id: "sell-wizard", error_fields: Object.keys(state.fields).join(",") || "form" })
    }
  }, [state, make, answers.year, pathname, sourceLabel])

  const fields = state.status === "error" ? state.fields : {}
  const formError = state.status === "error" && Object.keys(state.fields).length === 0 ? state.message : null
  const step = STEP_OF[stage]

  /* ---------------------------------------------------------------- */

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 shadow-overlay md:p-7" data-clarity-mask="true">
        <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-success-bg text-h3 text-success-text">
          <CheckGlyph />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-h2 uppercase text-ink outline-none">
          Thank you{state.name ? `, ${state.name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-2 text-body text-ink-2">
          We have the details of your {car || "car"}. An AM Group evaluator will call you to fix a day, time and
          place to see the car. The evaluation is free, and whether you sell is up to you.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button asChild variant="secondary">
            <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="sell-wizard-done">
              Call {PRIMARY_LOCATION.phone}
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/inventory">See cars in stock</Link>
          </Button>
        </div>
      </div>
    )
  }

  const chips = [
    answers.make && { label: answers.make, to: "make" as Stage },
    answers.model && { label: answers.model, to: "model" as Stage },
    answers.year && { label: answers.year, to: "year" as Stage, name: "year" },
    step === 3 && answers.km && { label: `${Number(answers.km).toLocaleString("en-IN")} km`, to: "details" as Stage },
  ].filter(Boolean) as { label: string; to: Stage; name?: string }[]

  const canGoBack = stage !== "make" || typing === "make"

  const years: string[] = []
  if (thisYear) for (let y = thisYear; y >= OLDEST_YEAR_OFFERED; y--) years.push(String(y))

  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-overlay md:p-7" data-clarity-mask="true">
      {/* Where you are. The bar is the same information as the words. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-meta uppercase text-ink-2">
          Step {step} of 3 <span aria-hidden>·</span> {STEP_NAME[step]}
        </p>
        {canGoBack && (
          <button type="button" onClick={goBack} className={`${TEXT_LINK} -my-3`}>
            Back
          </button>
        )}
      </div>
      <div aria-hidden className="mt-2 h-1 overflow-hidden rounded-full bg-ground-2">
        <div
          className="h-full rounded-full bg-pop transition-[width] duration-(--duration-3) ease-(--ease-out)"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* What has been chosen so far; each one goes back to its question. */}
      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Your car so far">
          {chips.map((chip) => (
            <li key={chip.to}>
              <button
                type="button"
                onClick={() => go(chip.to, "back")}
                aria-label={`Change ${chip.name ?? chip.label}`}
                className="inline-flex min-h-11 items-center rounded-sm bg-ground-2 px-2.5 text-meta uppercase text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-(--duration-1) hover:bg-pop-bg cursor-pointer"
              >
                {chip.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5" aria-live="polite">
        {/* ---------- 1a. Make ---------- */}
        {stage === "make" && typing !== "make" && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 text-ink outline-none">
              Which car do you have?
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {MAKES.map((m) => (
                <button key={m.name} type="button" onClick={() => pickMake(m.name)} className={CHOICE}>
                  {m.name}
                </button>
              ))}
              <button type="button" onClick={() => setTyping("make")} className={`${TEXT_LINK} justify-center`}>
                Other brand
              </button>
            </div>
          </>
        )}

        {/* ---------- 1b. Model ---------- */}
        {stage === "model" && typing !== "model" && make && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 text-ink outline-none">
              Which {make.name}?
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(allModels ? make.models : make.models.slice(0, MODELS_SHOWN_FIRST)).map((model) => (
                <button key={model} type="button" onClick={() => pickModel(model)} className={CHOICE}>
                  {model}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5">
              {!allModels && make.models.length > MODELS_SHOWN_FIRST && (
                <button type="button" onClick={() => setAllModels(true)} className={TEXT_LINK}>
                  {make.models.length - MODELS_SHOWN_FIRST} more {make.name} models
                </button>
              )}
              <button type="button" onClick={() => setTyping("model")} className={TEXT_LINK}>
                Other model
              </button>
            </div>
          </>
        )}

        {/* ---------- Typed make or model ---------- */}
        {((stage === "make" && typing === "make") || (stage === "model" && (typing === "model" || typedMake))) && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitTyped()
            }}
          >
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 text-ink outline-none">
              {stage === "make" ? "Which brand is it?" : `Which ${answers.make} model?`}
            </h2>
            <Field label={stage === "make" ? "Brand" : "Model"} className="mt-4">
              {(a11y) => (
                <Input
                  {...a11y}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoFocus
                  maxLength={60}
                  autoComplete="off"
                  placeholder={stage === "make" ? "e.g. Renault" : "e.g. Kwid"}
                />
              )}
            </Field>
            <Button type="submit" size="lg" full className="mt-4" disabled={!typed.trim()}>
              Continue
            </Button>
          </form>
        )}

        {/* ---------- 1c. Year ---------- */}
        {stage === "year" && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 text-ink outline-none">
              What year is your {answers.model}?
            </h2>
            <p className="mt-1 text-small text-ink-2">The year it was made. It is on the RC.</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {years.map((y) => (
                <button key={y} type="button" onClick={() => pickYear(y)} className={CHOICE} data-num>
                  {y}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => pickYear(`Older than ${OLDEST_YEAR_OFFERED}`)}
              className={`${TEXT_LINK} mt-2`}
            >
              Older than {OLDEST_YEAR_OFFERED}
            </button>
          </>
        )}

        {/* ---------- 2. Details ---------- */}
        {stage === "details" && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              go("contact")
            }}
          >
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 text-ink outline-none">
              When can we see the car?
            </h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {days.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={answers.when === d.value}
                  onClick={() => setAnswers((a) => ({ ...a, when: d.value }))}
                  className={`${CHOICE} flex flex-col items-center justify-center gap-0.5`}
                >
                  <span className="text-meta text-ink-2">{d.top}</span>
                  <span data-num>{d.bottom}</span>
                </button>
              ))}
              <button
                type="button"
                aria-pressed={answers.when === "Another day"}
                onClick={() => setAnswers((a) => ({ ...a, when: "Another day" }))}
                className={CHOICE}
              >
                Another day
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-label text-ink">Also looking at a car from us?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["Yes", "No"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={answers.alsoBuying === v}
                    onClick={() => setAnswers((a) => ({ ...a, alsoBuying: v }))}
                    className={CHOICE}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <label htmlFor={kmId} className="text-label text-ink">
                Kilometres driven
              </label>
              <div className="relative mt-2">
                <Input
                  id={kmId}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="e.g. 45,000"
                  value={answers.km ? Number(answers.km).toLocaleString("en-IN") : ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, km: e.target.value.replace(/[^\d]/g, "").slice(0, 7) }))
                  }
                  className="pr-12"
                />
                <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-small text-ink-2">
                  km
                </span>
              </div>
              <p className="mt-1.5 text-small text-ink-2">The meter reading. Roughly is fine.</p>
            </div>

            <Button type="submit" size="lg" full className="mt-5">
              Continue
              <ChevronGlyph />
            </Button>
          </form>
        )}

        {/* ---------- 3. Contact ---------- */}
        {stage === "contact" && (
          <form action={formAction} noValidate>
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 text-ink outline-none">
              Who should we call?
            </h2>

            <Field label="Your name" error={fields.name} required className="mt-4">
              {(a11y) => (
                <Input
                  {...a11y}
                  name="name"
                  autoComplete="name"
                  defaultValue={state.status === "error" ? state.name : ""}
                  maxLength={120}
                />
              )}
            </Field>

            <Field
              label="Mobile number"
              error={fields.phone}
              help="Your number stays with AM Group."
              required
              className="mt-4"
            >
              {(a11y) => (
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-body text-ink-2 max-md:text-[length:var(--text-h4)]">
                    +91
                  </span>
                  <Input
                    {...a11y}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="10-digit number"
                    defaultValue={state.status === "error" ? state.phone : ""}
                    maxLength={22}
                    className="pl-12"
                  />
                </div>
              )}
            </Field>

            {/* Honeypot. A person never sees or fills this; the field name is a
                contract with submitLead, which answers a hit as if it worked. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Company website
                <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <p className="mt-4 text-small text-ink-2">
              Free. An AM Group evaluator calls you to fix a time and place, and gives you the price after
              a short look at the car.
            </p>

            {formError && (
              <p role="alert" className="mt-3 rounded-sm border border-danger-line bg-danger-bg px-3 py-2 text-small text-danger-text">
                {formError} You can also call {PRIMARY_LOCATION.phone}.
              </p>
            )}

            <Button type="submit" size="lg" full className="mt-4" disabled={sending}>
              {sending ? "Sending…" : "Get my car’s price"}
            </Button>
            <p className="mt-3 text-caption text-ink-2">
              {CONSENT_TEXT.enquiry}{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-accent">
                Privacy policy
              </Link>
            </p>
          </form>
        )}
      </div>

      <noscript>
        <p className="mt-4 text-small text-ink-2">
          This form needs JavaScript. You can call or WhatsApp us instead on {PRIMARY_LOCATION.phone}.
        </p>
      </noscript>

      {stage !== "contact" && (
        <p className="mt-5 border-t border-line pt-4 text-small text-ink-2">
          Rather talk to us?{" "}
          <a
            href={`tel:${PRIMARY_LOCATION.phoneE164}`}
            data-track-location="sell-wizard"
            className="font-semibold text-ink underline underline-offset-4 hover:text-accent"
            data-num
          >
            Call {PRIMARY_LOCATION.phone}
          </a>{" "}
          or{" "}
          <a
            href={whatsappUrl("Hi AM Group, I'd like to sell my car. Make, model, year and kilometres: ")}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="sell-wizard"
            className="font-semibold text-ink underline underline-offset-4 hover:text-accent"
          >
            WhatsApp
          </a>
        </p>
      )}
    </div>
  )
}
