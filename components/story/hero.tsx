"use client"

import Image from "next/image"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import * as React from "react"
import { AM_KIA_SHOWROOM } from "@/lib/supabase-media"
import { useStoryMotion, EASE_OUT, DUR } from "./motion"

/**
 * The opening frame.
 *
 * Deliberately withholding: a mark, one line, a year, and a way in. No stat
 * band, no nav restatement, no "discover our company". The reader should
 * arrive, understand this is a 58-year-old house, and want to know how.
 *
 * This plate is the SAME photograph Chapter 01 uses, and that is the point —
 * the hero and the first chapter are one continuous shot. The scrim is at its
 * LIGHTEST on arrival so the room is the first thing seen, then deepens as the
 * title card lifts away and the page hands off to 1968. Nothing cuts.
 *
 * It is also the only asset in the library large enough to carry a full-bleed
 * frame on a retina desktop: 4229x2506, against ~3840px needed at 1920x2. Every
 * other photograph tops out near 1600px.
 */
export function StoryHero({ founded }: { founded: number }) {
  const { reduce } = useStoryMotion()
  const ref = React.useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // The title card recedes as the reader commits to the story: the type lifts
  // and fades over the first viewport while the plate stays. Transform and
  // opacity only.
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  // Starts LIGHT and darkens on scroll. This was inverted — it ran 1 → 0.55,
  // which put a fully opaque black layer over the photograph on first paint, so
  // the opening frame read as a black screen. The image is the first thing the
  // reader should see; the scrim only deepens as the title card lifts away and
  // the page hands off to Chapter 01.
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0.28, 0.72])

  // Same rule as the chapter plates: promote only while the hero is in play.
  // Once the reader is chapters deep, these two layers are pure GPU memory.
  const near = useInView(ref, { margin: "50% 0px 50% 0px" })

  return (
    <section
      ref={ref}
      data-ground="deep"
      aria-label="AM Group — established 1968"
      className="relative isolate flex h-svh min-h-[36rem] flex-col justify-end overflow-hidden bg-void text-on-deep"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={AM_KIA_SHOWROOM}
          alt="The AM Kia showroom in Jammu at dusk"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 55%" }}
        />
        {/* Two scrims: a base that holds the whole frame down so white type is
            legible anywhere on it, and a bottom-weighted one under the title. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-void"
          style={reduce ? { opacity: 0.32 } : { opacity: scrimOpacity, willChange: near ? "opacity" : "auto" }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              "linear-gradient(to top, rgb(11 14 18 / 0.88), rgb(11 14 18 / 0.28) 48%, transparent 72%)",
          }}
        />
      </div>

      <motion.div
        className="mx-auto w-full max-w-[1400px] px-5 pb-16 md:px-10 md:pb-24"
        style={
          reduce
            ? undefined
            : { y: titleY, opacity: titleOpacity, willChange: near ? "transform, opacity" : "auto" }
        }
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.reveal, ease: EASE_OUT }}
        >
          {/* The brand mark, unfiltered — white artwork on a dark frame is
              exactly the condition it was drawn for. */}
          <Image
            src="/logo-am-group.png"
            alt="AM Group"
            width={169}
            height={112}
            priority
            className="h-12 w-auto object-contain md:h-16"
          />
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.reveal, delay: 0.12, ease: EASE_OUT }}
          className="mt-8 max-w-[16ch] font-display text-display uppercase leading-[0.92] text-on-deep"
        >
          Keeping Jammu &amp; Kashmir moving
        </motion.h1>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.settle, delay: 0.36 }}
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          <span className="text-meta uppercase text-accent" data-num>
            Est. {founded}
          </span>
          <span aria-hidden className="hidden h-px w-12 bg-current opacity-25 sm:block" />
          <span className="text-meta uppercase opacity-70">Jammu &amp; Kashmir</span>
        </motion.div>
      </motion.div>

      {/* The way in. Static, not pulsing — a looping cue to "draw the eye" is
          the thing that dates a page fastest, and the rule below it already
          establishes that this page is a vertical journey. */}
      <motion.a
        href="#origin"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.settle, delay: 0.6 }}
        className="group mx-auto mb-8 flex h-11 w-full max-w-[1400px] items-center gap-4 px-5 text-meta uppercase text-on-deep-2 transition-colors duration-(--duration-1) hover:text-on-deep md:px-10"
      >
        <span aria-hidden className="h-10 w-px bg-accent" />
        Begin — 1968
      </motion.a>
    </section>
  )
}
