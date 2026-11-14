"use client"

import {
  Component,
  createElement,
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { useToast } from "@/hooks/use-toast"

/**
 * Loads the enquiry form and the toaster when they are first needed, instead
 * of shipping them to every page.
 *
 * Both used to be rendered straight from the root layout, which put the form,
 * its validation, the dialog's animation code and the toast library in the
 * first bundle of every page, for visitors who never press Enquire.
 *
 * What this keeps the same:
 *
 *  - The store is unchanged, so every Enquire button still just calls onOpen.
 *  - Once either component has mounted it STAYS mounted. The dialog's exit
 *    animation and the hand-back of focus to the button that opened it both
 *    happen after `isOpen` goes false; unmounting then would cut them off.
 *  - The first tap is not left waiting on the network: the form's code is
 *    fetched in the background once the page has settled, so by the time a
 *    visitor has read enough to press Enquire it is already there. The dialog
 *    still takes its focus bearings when it mounts, at which point the button
 *    that was pressed is still the focused element.
 *
 * WHEN THE CODE CANNOT BE FETCHED. Both pieces now arrive as separate files,
 * and a separate file can fail to arrive: the phone is offline when Enquire is
 * tapped, or the site was redeployed while the page was open and the old file
 * name no longer exists. Nothing here may take the page down with it:
 *
 *  - Each piece is fetched by hand with `import()` and kept in state, not with
 *    next/dynamic. A lazy component remembers a failed fetch for good and
 *    throws it again on every later render, so there would be no second try.
 *    Here a failure closes the form and leaves nothing mounted, and the next
 *    tap on Enquire simply fetches again.
 *  - An error boundary sits around both, rendering nothing. Without it an
 *    error thrown while the form or a toast is drawing would climb to the
 *    root and replace the whole page with an error screen.
 *
 * Nothing is rendered on the server: neither piece shows anything until a
 * person acts, and `import()` only runs from an effect in the browser.
 */

const loadPopup = () => import("./unlock-price-popup").then((m) => m.UnlockPricePopup)
const loadToaster = () => import("@/components/ui/toaster").then((m) => m.Toaster)

/** After the page is up, give the browser this long to find an idle moment. */
const WARM_UP_TIMEOUT_MS = 4000

/**
 * How many times a render error is answered with a fresh start. A piece that
 * throws every time it is drawn (a toast that is still waiting, say) would
 * otherwise be remounted, throw, and be remounted again without end. After
 * this many the host stays empty until the page is reloaded; the page itself
 * carries on working, and the phone and WhatsApp links do not depend on it.
 */
const MAX_FRESH_STARTS = 3

/**
 * Catches an error thrown while the enquiry form or a toast is rendering.
 * Shows nothing in its place, and tells the host so it can close the form and
 * start afresh on the next tap.
 */
class QuietBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error("[enquiry] the form or a notification could not be shown", error)
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Fetches a component the first time it is wanted, then draws it and keeps it.
 * A failed fetch calls `onFail` and keeps nothing, so the next time it is
 * wanted the fetch is made again.
 */
function Deferred({
  wanted,
  retryKey,
  load,
  onFail,
}: {
  wanted: boolean
  /**
   * Changes when there is a new reason to try again while `wanted` has stayed
   * true. The form does not need one (a failed fetch closes it, so the next
   * tap flips `wanted`). A toast does: with no toaster on screen nothing ever
   * dismisses it, so `wanted` would stay true and a failed fetch would never
   * be repeated. Each new toast is a new try.
   */
  retryKey?: string
  load: () => Promise<ComponentType>
  onFail?: () => void
}) {
  const [Loaded, setLoaded] = useState<ComponentType | null>(null)

  useEffect(() => {
    if (!wanted || Loaded) return
    let cancelled = false
    load().then(
      // The updater form: handing React a component directly would make it
      // call the component as if it were an updater function.
      (component) => {
        if (!cancelled) setLoaded(() => component)
      },
      (error) => {
        console.error("[enquiry] could not load", error)
        if (!cancelled) onFail?.()
      },
    )
    return () => {
      cancelled = true
    }
  }, [wanted, retryKey, Loaded, load, onFail])

  return Loaded ? createElement(Loaded) : null
}

export function EnquiryHost() {
  const isOpen = useEnquiryModal((s) => s.isOpen)
  // Stable for the life of the store, so it is safe as an effect dependency.
  const closeEnquiry = useEnquiryModal((s) => s.onClose)
  const { toasts } = useToast()

  // Bumped after a render error, which remounts the boundary with a clean
  // slate so the next open can draw the form again.
  const [attempt, setAttempt] = useState(0)
  const onRenderError = useCallback(() => {
    closeEnquiry()
    setAttempt((n) => n + 1)
  }, [closeEnquiry])

  // Fetch the form's code ahead of the first tap, without competing with the
  // page's own loading. Skipped when the visitor has asked the browser to
  // save data; the form then loads on the tap itself.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return

    let idle: number | undefined
    let timer: number | undefined
    // Only a head start. If it fails (offline, or a file that has since been
    // replaced) the tap itself fetches again, so the failure is swallowed
    // here instead of being left as an unhandled rejection.
    const fetchAhead = () => {
      loadPopup().catch(() => {})
    }
    const warm = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(fetchAhead, { timeout: WARM_UP_TIMEOUT_MS })
      } else {
        timer = window.setTimeout(fetchAhead, 1500)
      }
    }

    if (document.readyState === "complete") warm()
    else window.addEventListener("load", warm, { once: true })

    return () => {
      window.removeEventListener("load", warm)
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [])

  if (attempt > MAX_FRESH_STARTS) return null

  // Once fetched, both stay mounted (see "What this keeps the same" above).
  // If the form's code cannot be fetched the store is closed: otherwise it
  // would stay "open" with nothing on screen, and the next tap on Enquire
  // would change nothing and so fetch nothing.
  return (
    <QuietBoundary key={attempt} onError={onRenderError}>
      <Deferred wanted={isOpen} load={loadPopup} onFail={closeEnquiry} />
      <Deferred wanted={toasts.length > 0} retryKey={toasts[0]?.id} load={loadToaster} />
    </QuietBoundary>
  )
}
