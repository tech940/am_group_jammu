"use client"

import { AWARDS, REVIEWS, TEAMS } from "./content"
import { Settle, Stamp, TitleBlock } from "@/components/system/marks"

/**
 * Sheet 06 — approvals, inspection notes, personnel.
 *
 * Three registers on one sheet:
 *  - Awards: the company's real OEM recognitions, entered as stamped approvals.
 *  - Reviews: the three authentic Google reviews, entered as inspection notes.
 *  - Personnel: real functions of the business; counts and photography are
 *    PLACEHOLDER pending client data (see content.ts replacement list).
 */

import Image from "next/image"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function Provenance() {
  return (
    <section id="provenance" aria-labelledby="provenance-title" className="scroll-mt-16 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <TitleBlock sheet="06" title="Approvals & inspection notes" scale={`${AWARDS.length} entries`} />

        <h2
          id="provenance-title"
          className="mt-8 max-w-[18ch] font-display text-5xl font-bold uppercase leading-[0.95] text-ink md:text-7xl"
        >
          Checked by <span className="text-redline">others</span>, not by us
        </h2>

        {/* SUPABASE MEDIA AWARDS BANNER */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink/20 bg-ink/5 p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="relative aspect-[16/9] w-full md:w-80 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={SUPABASE_MEDIA.awards}
              alt="AM Group OEM Awards & Trophies"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-anno text-[10px] uppercase tracking-widest text-redline-deep">
              Supabase Storage • Real Corporate Recognition
            </span>
            <h3 className="mt-1 font-display text-2xl font-bold uppercase text-ink md:text-3xl">
              National &amp; International Excellence
            </h3>
            <p className="mt-2 max-w-[50ch] text-[14px] leading-relaxed text-steel">
              Consistently recognized by Hyundai Motor India and General Motors at global dealer conventions across Los Angeles, Paris, New York, Lisbon, and Rio de Janeiro.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Approvals — awards register */}
          <div>
            <h3 className="border-b border-ink/40 pb-2 font-anno text-[11px] uppercase tracking-[0.14em] text-steel">
              OEM approvals — from the company&apos;s award record
            </h3>
            <p className="mt-2 font-anno text-[10px] uppercase tracking-[0.1em] text-steel">
              Presented at Hyundai and GM international dealer conventions — venue as recorded
            </p>
            <ul>
              {AWARDS.slice(0, 7).map((a, i) => (
                <li key={`${a.title}-${a.year}-${a.place}`} className="border-b border-ink/15">
                  <Settle delay={i * 0.04} className="flex items-center gap-5 py-4">
                    <Stamp year={a.year} />
                    <div className="min-w-0">
                      {/* Wraps rather than truncates. `truncate` sets
                          white-space: nowrap, which inflates this row's
                          min-content past the grid track that holds it and
                          pushed the document 45px wider than a 320px viewport.
                          An award title clipped to "Best Seller of the…" also
                          tells the reader nothing. */}
                      <p className="font-display text-xl font-semibold uppercase leading-tight text-ink md:text-2xl">
                        {a.title}
                      </p>
                      <p className="mt-0.5 font-anno text-[10px] uppercase tracking-[0.12em] text-steel">
                        {a.marque} · {a.place}
                      </p>
                    </div>
                  </Settle>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-anno text-[10px] uppercase tracking-[0.1em] text-steel">
              Register continues on <a href="/about" className="text-redline-deep underline-offset-4 hover:underline">/about</a>
            </p>
          </div>

          <div className="flex flex-col gap-14">
            {/* Inspection notes — real reviews */}
            <div>
              <h3 className="border-b border-ink/40 pb-2 font-anno text-[11px] uppercase tracking-[0.14em] text-steel">
                Inspection notes — verbatim from Google reviews
              </h3>
              <ul>
                {REVIEWS.map((r, i) => (
                  <li key={r.name} className="border-b border-ink/15 py-5">
                    <Settle delay={i * 0.05}>
                      <blockquote className="max-w-[58ch] text-[14.5px] leading-relaxed text-ink/80">
                        “{r.quote}”
                      </blockquote>
                      {/* Deliberately no date: Google's "3 months ago" strings
                          go stale silently once copied. */}
                      <p className="mt-3 font-anno text-[10px] uppercase tracking-[0.12em] text-steel">
                        — {r.name} · {r.meta}
                      </p>
                    </Settle>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personnel — placeholder counts, real functions */}
            <div>
              <h3 className="border-b border-ink/40 pb-2 font-anno text-[11px] uppercase tracking-[0.14em] text-steel">
                Personnel schedule
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2">
                {TEAMS.map((t) => (
                  <li key={t.name} className="border-b border-ink/15 py-4 sm:odd:pr-6 sm:even:pl-6">
                    <p className="font-display text-xl font-semibold uppercase text-ink">{t.name}</p>
                    <p className="mt-1 max-w-[40ch] text-[13px] leading-relaxed text-steel">{t.brief}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-anno text-[10px] uppercase tracking-[0.1em] text-steel">
                Team photography &amp; strengths to be entered — plates reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
