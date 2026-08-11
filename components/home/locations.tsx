"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { LOCATIONS, SCALE_NOTE, formatAddress, formatHours, whatsappUrl } from "./locations-data"
import { ChatGlyph, CompassGlyph, PhoneGlyph, TitleBlock } from "@/components/system/marks"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

/**
 * Sheet 04 — site plan.
 *
 * Every site in lib/locations.ts, drawn on the one geography the audience
 * knows by heart: the NH-44 climb from Jammu (327 m) over the Pir Panjal to
 * Srinagar (1,585 m). The elevation section is drawn SVG, not a map tile —
 * this is a drawing set, and the profile is real.
 *
 * The section derives everything from LOCATIONS: city stations carry the site
 * count, the register below lists each site, and selecting a row fills the
 * detail card. New entries in lib/locations.ts appear here with no edits.
 */

const PROFILE = "M0,150 L60,148 L120,142 L190,120 L260,96 L330,110 L400,78 L470,40 L540,58 L610,30 L680,44 L750,38 L820,42"

/** x/y of a city's station on the drawn profile. */
const CITY_STATIONS: Record<string, { x: number; y: number }> = {
  Jammu: { x: 60, y: 148 },
  Srinagar: { x: 750, y: 38 },
}

export function Locations() {
  const [active, setActive] = React.useState(0)
  const reduce = useReducedMotion()
  const site = LOCATIONS[active]

  const cities = [...new Set(LOCATIONS.map((l) => l.city))]
  const countFor = (city: string) => LOCATIONS.filter((l) => l.city === city).length

  return (
    <section id="locations" aria-labelledby="locations-title" className="scroll-mt-16 bg-paper-2 py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <TitleBlock sheet="04" title="Site plan — NH-44 corridor" scale={`${LOCATIONS.length} sites`} />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2
            id="locations-title"
            className="max-w-[16ch] font-display text-5xl font-bold uppercase leading-[0.95] text-ink md:text-7xl"
          >
            One highway, <span className="text-redline">{LOCATIONS.length} sites</span>
          </h2>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-steel">
            {SCALE_NOTE} The sites below sit on or minutes from the bye-pass — because a showroom
            you cannot find is a showroom you do not visit.
          </p>
        </div>

        {/* Elevation section — city stations derived from the data. On phones
            the drawing keeps its physical scale and scrolls sideways; shrunk
            to 90px tall it is a thumbnail, not a drawing. */}
        <div
          className="no-scrollbar mt-14 overflow-x-auto overscroll-x-contain border border-ink/25 bg-paper p-5 md:p-8"
          role="region"
          aria-label="NH-44 elevation drawing, horizontally scrollable on small screens"
          tabIndex={0}
        >
          <svg
            viewBox="0 -55 820 245"
            role="img"
            aria-label="Elevation section of National Highway 44 from Jammu at 327 metres to Srinagar at 1585 metres, with AM Group site counts per city"
            className="w-full min-w-[680px] md:min-w-0"
          >
            <defs>
              <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#14161a" strokeOpacity="0.12" strokeWidth="1" />
              </pattern>
            </defs>
            <path d={`${PROFILE} L820,190 L0,190 Z`} fill="url(#hatch)" />
            <motion.path
              d={PROFILE}
              fill="none"
              stroke="#14161a"
              strokeWidth="1.5"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <line x1="0" y1="150" x2="820" y2="150" stroke="#565e6a" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="0" y1="30" x2="820" y2="30" stroke="#565e6a" strokeWidth="0.5" strokeDasharray="4 4" />
            <text x="6" y="143" className="font-anno" fontSize="10" fill="#565e6a">+327 M — JAMMU DATUM</text>
            <text x="6" y="23" className="font-anno" fontSize="10" fill="#565e6a">+1585 M — SRINAGAR DATUM</text>

            {cities.map((city) => {
              const st = CITY_STATIONS[city]
              if (!st) return null
              const isActiveCity = site.city === city
              const first = city === cities[0]
              return (
                <g key={city}>
                  <line x1={st.x} y1={st.y} x2={st.x} y2={st.y - 30} stroke={isActiveCity ? "#c13a2a" : "#565e6a"} strokeWidth="1" />
                  <circle cx={st.x} cy={st.y} r="5" fill={isActiveCity ? "#c13a2a" : "#f4f3ee"} stroke={isActiveCity ? "#c13a2a" : "#14161a"} strokeWidth="1.5" />
                  <text
                    x={st.x + (first ? 10 : -10)}
                    y={st.y - 36}
                    textAnchor={first ? "start" : "end"}
                    className="font-anno uppercase"
                    fontSize="12"
                    fill={isActiveCity ? "#a32e20" : "#14161a"}
                  >
                    {city}
                  </text>
                  <text
                    x={st.x + (first ? 10 : -10)}
                    y={st.y - 22}
                    textAnchor={first ? "start" : "end"}
                    className="font-anno uppercase"
                    fontSize="9"
                    fill="#565e6a"
                  >
                    {countFor(city)} {countFor(city) === 1 ? "site" : "sites"}
                  </text>
                </g>
              )
            })}
            <text x="410" y="180" textAnchor="middle" className="font-anno" fontSize="10" fill="#565e6a">
              NATIONAL HIGHWAY 44 — APPROX. 244 KM
            </text>
          </svg>
        </div>

        {/* Site register + detail card */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
          <div role="tablist" aria-label="Sites" className="self-start">
            {LOCATIONS.map((l, i) => {
              const selected = i === active
              return (
                <button
                  key={l.slug}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="site-card"
                  id={`site-tab-${l.slug}`}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-baseline justify-between gap-4 border-t border-ink/20 px-1 py-3 text-left transition-colors last:border-b focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-redline ${
                    selected ? "bg-ink text-paper" : "text-ink hover:bg-paper"
                  }`}
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className={`font-anno text-[10px] ${selected ? "text-print-dim" : "text-steel"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate font-display text-xl font-semibold uppercase leading-none md:text-2xl">
                      {l.shortName}
                    </span>
                  </span>
                  <span className={`shrink-0 font-anno text-[10px] uppercase tracking-[0.1em] ${selected ? "text-print-dim" : "text-steel"}`}>
                    {l.city}
                  </span>
                </button>
              )
            })}
          </div>

            <div id="site-card" role="tabpanel" aria-labelledby={`site-tab-${site.slug}`}>
              
              {/* REAL SUPABASE MEDIA PHOTO GALLERY FOR SELECTED BRANCH */}
              <div className="mb-6 overflow-hidden rounded-2xl border border-ink/20 bg-ink/5">
                {(() => {
                  let currentImage = SUPABASE_MEDIA.branches["jammu-hyundai"].exterior
                  let galleryCount = 1

                  if (site.slug === "jammu") {
                    currentImage = SUPABASE_MEDIA.branches["jammu-hyundai"].exterior
                    galleryCount = SUPABASE_MEDIA.branches["jammu-hyundai"].gallery.length
                  } else if (site.slug === "kia-jammu") {
                    currentImage = SUPABASE_MEDIA.branches["jammu-kia"].exterior
                    galleryCount = SUPABASE_MEDIA.branches["jammu-kia"].gallery.length
                  } else if (site.slug === "srinagar") {
                    currentImage = SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior
                    galleryCount = SUPABASE_MEDIA.branches["srinagar-hyundai"].gallery.length
                  } else if (site.slug === "workshop-services") {
                    currentImage = SUPABASE_MEDIA.branches["central-workshop"].exterior
                    galleryCount = SUPABASE_MEDIA.branches["central-workshop"].gallery.length
                  } else if (site.slug === "petroleum") {
                    currentImage = SUPABASE_MEDIA.branches.petroleum.exterior
                    galleryCount = SUPABASE_MEDIA.branches.petroleum.gallery.length
                  } else if (site.slug === "smegamart") {
                    currentImage = SUPABASE_MEDIA.branches.smegamart.exterior
                    galleryCount = SUPABASE_MEDIA.branches.smegamart.gallery.length
                  } else if (site.slug === "real-estate") {
                    currentImage = SUPABASE_MEDIA.branches["real-estate"].exterior
                    galleryCount = SUPABASE_MEDIA.branches["real-estate"].gallery.length
                  }

                  return (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={currentImage}
                        alt={`${site.name} Facility Photography`}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        {/* "Supabase Storage • Real Facility Media" was here —
                            the storage backend is not something a car buyer has
                            any use for. What earns its place is that these are
                            photographs of the actual site, and how many. */}
                        <span className="bg-ink/80 px-3 py-1 text-meta uppercase text-on-deep">
                          {galleryCount} photos of this site
                        </span>
                        <span className="text-meta uppercase text-on-deep-2">{site.city}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="font-display text-3xl font-semibold uppercase leading-none text-ink md:text-4xl">
                  {site.shortName}
                </h3>
                {site.isPrimary && (
                  <span className="font-anno text-[11px] uppercase tracking-[0.12em] text-redline-deep">
                    Flagship Campus
                  </span>
                )}
              </div>
              <address className="mt-4 max-w-[52ch] not-italic text-[15px] leading-relaxed text-steel">
                <strong className="font-semibold text-ink">{site.name}</strong>
                <br />
                {formatAddress(site)} — {site.landmark}.
                <br />
                Open {formatHours(site)}.
              </address>
              <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-steel">{site.blurb}</p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href={`tel:${site.phoneE164}`}
                  data-track-location="home-siteplan"
                  className="inline-flex items-center justify-center gap-2 bg-ink px-5 py-4 font-anno text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-redline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-redline"
                >
                  <PhoneGlyph /> Call
                </a>
                <a
                  href={whatsappUrl(`Hi AM Group, I'd like to visit ${site.shortName}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="home-siteplan"
                  className="inline-flex items-center justify-center gap-2 border border-ink px-5 py-4 font-anno text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-redline"
                >
                  <ChatGlyph /> WhatsApp
                </a>
                <a
                  href={site.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="home-siteplan"
                  className="inline-flex items-center justify-center gap-2 border border-ink px-5 py-4 font-anno text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-redline"
                >
                  <CompassGlyph /> Directions
                </a>
              </div>
              <p className="mt-4 font-anno text-[10px] uppercase tracking-[0.1em] text-steel">
                Full addresses, hours and service areas →{" "}
                <Link href="/locations" className="text-redline-deep underline-offset-4 hover:underline">
                  /locations
                </Link>
              </p>
            </div>
        </div>
      </div>
    </section>
  )
}
