"use client"

import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { ANALYTICS_MODE, CLARITY_ID, GA_ID } from "@/lib/analytics/config"
import {
  configuredHere,
  effectiveChoice,
  isInternal,
  readChoice,
  subscribeChoice,
  writeChoice,
} from "@/lib/analytics/consent"

/**
 * The control section 3 of the policy points to: see whether analytics are on
 * for this browser, and change it.
 *
 * It is the same stored choice the analytics notice writes
 * (lib/analytics/consent.ts), so turning it off here has the same effect as
 * "No thanks" there: the tags stop now and are not loaded again.
 *
 * It describes what is REALLY happening, not only what the visitor chose.
 * Having no stored refusal is not the same as being measured: with no ids set,
 * or on a preview copy of the site, no tag can load at all, and saying
 * "switched on" there would be false. So it first asks whether any tag can
 * run on this host, and it names only the tools that are configured, the same
 * way the notice does (components/analytics/consent-notice.tsx).
 *
 * Laid out to match the "Contact Us" panel that LegalDocument ends with, which
 * sits directly above it.
 */

/**
 * "none" and "none-refused": no tag can run here. The second also has a
 * refusal stored, which will hold if a tool is added later.
 * Plain strings on purpose: useSyncExternalStore compares snapshots by
 * identity, and a fresh object on every read would re-render for ever.
 */
type Status = "on" | "off" | "none" | "none-refused" | "staff" | "unknown"

function status(): Status {
  if (isInternal()) return "staff"
  if (!configuredHere()) return readChoice() === "denied" ? "none-refused" : "none"
  return effectiveChoice() === "granted" ? "on" : "off"
}

// The server cannot know the browser's choice; say nothing until it is read.
const unknown = (): Status => "unknown"

/**
 * What is configured, in words. Through Tag Manager the site cannot see which
 * tags the container holds, so it does not name any.
 */
function tools(): { name: string; plural: boolean } {
  if (ANALYTICS_MODE === "direct" && GA_ID && CLARITY_ID) {
    return { name: "Google Analytics and Microsoft Clarity session recording", plural: true }
  }
  if (ANALYTICS_MODE === "direct" && CLARITY_ID) {
    return { name: "Microsoft Clarity session recording", plural: false }
  }
  if (ANALYTICS_MODE === "direct" && GA_ID) return { name: "Google Analytics", plural: false }
  return { name: "Analytics tools", plural: true }
}

const NOTHING_RUNNING = "No analytics tool is running on this site at the moment."

function sentence(current: Status): string {
  const { name, plural } = tools()
  const verb = plural ? "are" : "is"
  switch (current) {
    case "on":
      return `${name} ${verb} switched on for this browser.`
    case "off":
      return `${name} ${verb} switched off for this browser and ${verb} not loaded.`
    case "none":
      return NOTHING_RUNNING
    case "none-refused":
      return `${NOTHING_RUNNING} You have chosen not to be measured. That choice is stored in this browser and will apply if a tool is added.`
    case "staff":
      return "This browser is marked as a staff device, so it is not measured."
    default:
      // Before the browser has been asked. With no tool configured anywhere
      // the plain fact can be stated already; otherwise only what the control
      // is for.
      return ANALYTICS_MODE === "off"
        ? NOTHING_RUNNING
        : "You can switch analytics off for this browser here."
  }
}

/** The button for each state: what it says, and the choice it stores. */
const ACTIONS: Partial<Record<Status, { label: string; store: "granted" | "denied" | null }>> = {
  on: { label: "Turn analytics off", store: "denied" },
  off: { label: "Turn analytics on", store: "granted" },
  // Nothing to turn off, but the preference can still be recorded ahead of
  // time. Clearing it puts the browser back to "has not answered".
  none: { label: "Keep analytics off in this browser", store: "denied" },
  "none-refused": { label: "Clear this choice", store: null },
}

export function AnalyticsChoice() {
  const current = useSyncExternalStore(subscribeChoice, status, unknown)
  const action = ACTIONS[current]

  return (
    <section aria-labelledby="analytics-choice" className="bg-ground pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl border border-line bg-surface p-6">
          <h2 id="analytics-choice" className="mb-3 font-display text-h3 text-ink">
            Analytics in this browser
          </h2>
          <p className="text-body text-ink-2" aria-live="polite">
            {sentence(current)}
          </p>
          {action && (
            <Button
              type="button"
              variant="secondary"
              className="mt-5"
              onClick={() => writeChoice(action.store)}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
