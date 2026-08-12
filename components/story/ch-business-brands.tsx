"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import { DIVISIONS, FRANCHISES } from "@/components/home/content"
import { Chapter, ChapterMark } from "./chapter"
import { useStoryMotion, EASE_OUT, DUR } from "./motion"

/* ==========================================================================
   CHAPTER 03 — THE BUSINESS EXPANDED
   ========================================================================== */

/**
 * Four divisions, one in focus at a time, driven by scroll.
 *
 * The section is four viewports tall with a pinned stage inside it, so the
 * reader travels THROUGH the operations rather than past a row of cards. The
 * active division's photograph cross-fades while its name and summary swap —
 * the environment changes around a fixed frame, which is the brief's
 * "travelling through the company's operations".
 *
 * Only one photograph is mounted at a time (AnimatePresence with a keyed
 * child), so this costs one decoded image, not four.
 *
 * Under reduced motion the pin is dropped entirely and the four divisions
 * render as a plain stacked list — the narrative survives, the travel does not.
 */
export function ChapterBusinesses() {
  const { reduce, settleProps } = useStoryMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  React.useEffect(() => {
    if (reduce) return
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(DIVISIONS.length - 1, Math.max(0, Math.floor(v * DIVISIONS.length)))
      setActive((prev) => (prev === idx ? prev : idx))
    })
  }, [scrollYProgress, reduce])

  const division = DIVISIONS[active]

  return (
    <Chapter id="businesses" label="Chapter three — the businesses" ground="graphite">
      <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-10 md:pt-40">
        <ChapterMark index="03" kicker="What the group does" />
        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[20ch] font-display text-h1 uppercase text-on-deep"
        >
          Four businesses under one name
        </motion.h2>
      </div>

      {reduce ? (
        // Reduced-motion path: no pin, no swap. A readable stack.
        <div className="mx-auto max-w-[1400px] space-y-16 px-5 py-20 md:px-10">
          {DIVISIONS.map((d) => (
            <article key={d.key} className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
              <div>
                <p className="text-meta uppercase text-accent" data-num>
                  {d.sinceApprox ? `c. ${d.since}` : d.since}
                </p>
                <h3 className="mt-3 font-display text-h2 uppercase text-on-deep">{d.name}</h3>
                <p className="mt-4 max-w-[52ch] text-body leading-relaxed text-on-deep-2">
                  {d.summary}
                </p>
                <Link
                  href={d.href}
                  className="mt-6 inline-flex min-h-11 items-center text-button text-accent underline-offset-4 hover:underline"
                >
                  {d.name}
                </Link>
              </div>
              <figure className="relative aspect-[16/10] overflow-hidden">
                <Image src={d.image} alt={d.imageAlt} fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" />
              </figure>
            </article>
          ))}
        </div>
      ) : (
        <div ref={ref} style={{ height: `${DIVISIONS.length * 100}svh` }} className="relative">
          <div className="sticky top-0 flex h-svh items-center overflow-hidden">
            <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-5 md:px-10 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-16">
              {/* The register — all four always visible, the active one lit.
                  Seeing what is coming is what makes this feel like travel
                  rather than a slideshow. */}
              <ol className="order-2 lg:order-1">
                {DIVISIONS.map((d, i) => {
                  const on = i === active
                  return (
                    <li key={d.key} className="border-t border-current/15 last:border-b">
                      <div
                        className={`flex items-baseline gap-5 py-4 transition-opacity duration-(--duration-3) md:py-5 ${
                          on ? "opacity-100" : "opacity-35"
                        }`}
                      >
                        <span
                          className={`text-meta uppercase ${on ? "text-accent" : "text-on-deep-2"}`}
                          data-num
                        >
                          {d.sinceApprox ? `c. ${d.since}` : d.since}
                        </span>
                        <span className="font-display text-h2 uppercase leading-none text-on-deep">
                          {d.name}
                        </span>
                      </div>
                    </li>
                  )
                })}

                <div className="mt-8 min-h-[7rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={division.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: DUR.quick, ease: EASE_OUT }}
                    >
                      <p className="max-w-[52ch] text-body leading-relaxed text-on-deep-2">
                        {division.summary}
                      </p>
                      <Link
                        href={division.href}
                        className="mt-5 inline-flex min-h-11 items-center gap-2 text-button text-accent underline-offset-4 hover:underline"
                      >
                        Visit {division.name}
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </ol>

              {/* The stage. One image mounted at a time. */}
              <figure className="relative order-1 aspect-[4/3] overflow-hidden lg:order-2 lg:aspect-[3/2]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={division.key}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                  >
                    <Image
                      src={division.image}
                      alt={division.imageAlt}
                      fill
                      sizes="(max-width:1024px) 100vw, 55vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </figure>
            </div>
          </div>
        </div>
      )}
    </Chapter>
  )
}

/* ==========================================================================
   CHAPTER 04 — OUR BRANDS
   ========================================================================== */

/**
 * The franchise register — not a logo grid.
 *
 * Each marque is a row carrying its appointment year, its trading entity and,
 * where a genuine photograph of THAT marque's premises exists, a plate.
 *
 * Two rows deliberately ship without a photograph. content.ts points Tata at a
 * central-workshop interior and Chevrolet at the Srinagar Hyundai building,
 * both captioned as though they showed the named brand's own premises. Showing
 * one company's showroom under another company's name is exactly the
 * fabrication this rebuild bans, so those two render as type only until real
 * photography exists.
 *
 * The count is stated honestly too: FRANCHISES has eight entries, but Chevrolet
 * is category "Heritage" (2004–2017, service honoured). Seven current
 * appointments, one heritage marque.
 */
export function ChapterBrands() {
  const { settleProps, reduce } = useStoryMotion()
  const [active, setActive] = React.useState<string | null>(null)

  // Rows whose image genuinely depicts the marque named on the row.
  const TRUSTED_PLATE = new Set(["Hyundai", "Kia", "MG", "Honda", "KTM", "Bajaj"])

  const current = FRANCHISES.filter((f) => f.category !== "Heritage")
  const heritage = FRANCHISES.filter((f) => f.category === "Heritage")

  return (
    <Chapter id="brands" label="Chapter four — the marques" ground="ground">
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="04" kicker="The marques" className="text-ink" />

        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[22ch] font-display text-h1 uppercase text-ink"
        >
          {current.length} appointments, held across one counter
        </motion.h2>

        <motion.p {...settleProps(0.12)} className="mt-6 max-w-[54ch] text-body-lg text-ink-2">
          Passenger cars and two-wheelers, sold and serviced by the same house that has been here
          since 1968.
        </motion.p>

        <ul className="mt-16 md:mt-24">
          {[...current, ...heritage].map((f, i) => {
            const showPlate = TRUSTED_PLATE.has(f.name)
            const on = active === f.name
            return (
              <motion.li
                key={f.name}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: EASE_OUT }}
                onMouseEnter={() => setActive(f.name)}
                onMouseLeave={() => setActive(null)}
                className="border-t border-line last:border-b"
              >
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-6 md:grid-cols-[6rem_1fr_auto_10rem] md:gap-8 md:py-7">
                  <span className="order-2 text-meta uppercase text-ink-2 md:order-1" data-num>
                    {f.since}
                  </span>
                  <div className="order-1 min-w-0 md:order-2">
                    <p className="font-display text-h2 uppercase leading-none text-ink">{f.name}</p>
                    <p className="mt-1.5 text-small text-ink-2">{f.entity}</p>
                  </div>
                  <span className="order-3 hidden text-meta uppercase text-ink-2 md:block">
                    {f.category}
                  </span>
                  {/* The plate only appears for rows whose photograph really is
                      that marque's premises. */}
                  <div className="order-4 hidden md:block">
                    {showPlate ? (
                      <figure
                        className={`relative aspect-[3/2] w-40 overflow-hidden transition-opacity duration-(--duration-2) ${
                          on || active === null ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <Image
                          src={f.image}
                          alt={f.imageAlt}
                          fill
                          sizes="160px"
                          loading="lazy"
                          className="object-cover"
                        />
                      </figure>
                    ) : (
                      <span className="block text-meta uppercase text-ink-3">Photography pending</span>
                    )}
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>

        <motion.p {...settleProps()} className="mt-8 max-w-[60ch] text-meta uppercase text-ink-2">
          Chevrolet is listed as heritage — the appointment ran {heritage[0]?.since}–2017 and the
          workshops still honour it.
        </motion.p>
      </div>
    </Chapter>
  )
}
