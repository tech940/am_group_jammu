import type { CSSProperties } from "react"

/**
 * Background treatments, as composable layers.
 *
 * All of these are server components and none of them ships JavaScript. They
 * are absolutely positioned, `aria-hidden`, `pointer-events-none`, and belong
 * inside a parent that is `relative isolate` — the negative z-index is what
 * guarantees they can never sit between the reader and the text.
 *
 * **No literal colours.** Every layer is built from the same four tokens as the
 * rest of the application — `accent`, `accent-bright`, `ink`, `ground` — read
 * as channel triplets from `--backdrop-*` in globals.css and varied only by
 * alpha. Inventing an intermediate blue inside a background component is
 * exactly the palette drift DESIGN.md's "raw hex in a component" rule exists to
 * catch, and it is how a system ends up with 130 colours again.
 *
 * The contrast rule that governs the file: on a LIGHT ground these run at
 * 3–7%, which is legible as texture and nowhere near enough to move ink off
 * 17:1. On a DARK ground they sit UNDER `.photo-scrim`, so the glass panels
 * still composite onto the floor they were measured against.
 *
 * Deliberately NOT here, and why:
 *   - `filter: blur()` on viewport-sized elements. Aurora and orbs are soft
 *     radial gradients instead; the compositor draws those for free, and a blur
 *     pass over a full-bleed layer is one of the most expensive things a page
 *     can ask for.
 *   - Particles, floating blobs, drifting shapes. DESIGN.md bans decorative
 *     infinite loops, and they are the single most recognisable "AI landing
 *     page" tell.
 */

const BASE = "pointer-events-none absolute inset-0 -z-10"

/** Token channel triplets, declared in globals.css. */
const BRIGHT = "var(--backdrop-bright)"
const ACCENT = "var(--backdrop-accent)"
const INK = "var(--backdrop-ink)"
const PAPER = "var(--backdrop-paper)"

type Tone = "deep" | "light"
type Fade = "top" | "bottom" | "both" | "center" | "none"

const FADE_CLASS: Record<Fade, string> = {
  top: "fade-y-top",
  bottom: "fade-y-bottom",
  both: "fade-y-both",
  center: "fade-radial",
  none: "",
}

/* ------------------------------------------------------------------ */
/* Noise / grain                                                       */
/* ------------------------------------------------------------------ */

/**
 * Film grain. The one layer that sits OVER the others in a band rather than
 * under them, so it unifies everything beneath into a single image.
 *
 * `animate` drifts the tile a couple of percent on a stepped timeline, which
 * reads as film rather than as a sliding texture. The animation lives inside a
 * `prefers-reduced-motion: no-preference` block in globals.css, so reduce gets
 * the static grain rather than a frozen half-frame.
 */
export function Grain({
  onDeep = false,
  animate = false,
  className = "",
}: {
  onDeep?: boolean
  animate?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 grain-layer ${
        onDeep ? "" : "grain-layer-light"
      } ${animate ? "grain-animate" : ""} ${className}`}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Gradient families                                                   */
/* ------------------------------------------------------------------ */

/**
 * Gradient mesh — several soft radial gradients composited into ONE paint.
 *
 * That is the whole trick: one element, one `background-image` with N stops.
 * The usual implementation is N absolutely positioned blurred divs, which costs
 * N compositor layers and a blur pass each and looks identical.
 */
export function GradientMesh({
  tone = "deep",
  className = "",
}: {
  tone?: Tone
  className?: string
}) {
  const stops =
    tone === "deep"
      ? [
          `radial-gradient(58% 44% at 18% 22%, rgb(${BRIGHT} / 0.24) 0%, transparent 70%)`,
          `radial-gradient(48% 38% at 82% 12%, rgb(${BRIGHT} / 0.16) 0%, transparent 72%)`,
          `radial-gradient(64% 50% at 68% 88%, rgb(${ACCENT} / 0.46) 0%, transparent 74%)`,
          `radial-gradient(40% 34% at 8% 82%, rgb(${BRIGHT} / 0.12) 0%, transparent 70%)`,
        ]
      : [
          `radial-gradient(56% 44% at 12% 8%, rgb(${ACCENT} / 0.16) 0%, transparent 70%)`,
          `radial-gradient(52% 42% at 88% 16%, rgb(${BRIGHT} / 0.30) 0%, transparent 72%)`,
          `radial-gradient(64% 50% at 74% 94%, rgb(${ACCENT} / 0.12) 0%, transparent 74%)`,
          `radial-gradient(44% 38% at 4% 88%, rgb(${INK} / 0.07) 0%, transparent 72%)`,
        ]

  return (
    <div
      aria-hidden
      className={`${BASE} ${className}`}
      style={{ backgroundImage: stops.join(", ") }}
    />
  )
}

/**
 * Aurora — large soft colour waves. Same mechanism as the mesh, wider and
 * fewer. `animate` slides the background position over 28 seconds, slow enough
 * to read as the light changing rather than as an animation playing.
 */
export function Aurora({
  animate = false,
  className = "",
}: {
  animate?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`${BASE} ${animate ? "aurora-animate" : ""} ${className}`}
      style={{
        backgroundImage: [
          `radial-gradient(70% 52% at 20% 30%, rgb(${BRIGHT} / 0.30) 0%, transparent 68%)`,
          `radial-gradient(62% 46% at 78% 20%, rgb(${ACCENT} / 0.46) 0%, transparent 70%)`,
          `radial-gradient(80% 56% at 55% 96%, rgb(${ACCENT} / 0.52) 0%, transparent 72%)`,
        ].join(", "),
      }}
    />
  )
}

/**
 * A flat veil that seats a backdrop stack on a known floor.
 *
 * This is the gradient equivalent of `.photo-scrim`, and it exists for exactly
 * the same reason. Layered gradients accumulate: a mesh plus ribbons plus an
 * aurora plus two orbs plus beams is five sources of light, and where several
 * peak together the ground gets bright enough that `on-deep-2` — the secondary
 * text colour — falls under AA. Measured on the gradient hero before this was
 * added: 2.91:1.
 *
 * Tuning it is arithmetic, not taste. Composite the veil over the brightest
 * measured point and solve for the alpha that brings `on-deep-2` back over
 * 4.5:1; on the hero that came out at 0.40, which lands it at 5.09:1. Darkening
 * every individual layer instead would have worked too, but it changes the
 * relationships between them — the veil keeps the composition and lowers the
 * whole thing.
 *
 * Place it ABOVE the colour layers and below the content.
 */
export function Veil({
  strength = 0.4,
  className = "",
}: {
  strength?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`${BASE} bg-deep-2 ${className}`}
      style={{ opacity: strength }}
    />
  )
}

/** Radial wash — light radiating from one named point. The quietest of them. */
export function RadialWash({
  at = "50% 0%",
  tone = "light",
  strength = 0.14,
  className = "",
}: {
  at?: string
  tone?: Tone
  strength?: number
  className?: string
}) {
  const channel = tone === "deep" ? BRIGHT : ACCENT
  return (
    <div
      aria-hidden
      className={`${BASE} ${className}`}
      style={{
        backgroundImage: `radial-gradient(70% 60% at ${at}, rgb(${channel} / ${strength}) 0%, transparent 72%)`,
      }}
    />
  )
}

/** Glow orbs — large soft circles of light. Gradients, not blurred divs. */
export function GlowOrbs({
  orbs = [
    { at: "22% 28%", size: "38%", strength: 0.30 },
    { at: "80% 68%", size: "32%", strength: 0.22 },
  ],
  className = "",
}: {
  orbs?: { at: string; size: string; strength: number }[]
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`${BASE} ${className}`}
      style={{
        backgroundImage: orbs
          .map(
            (o) =>
              `radial-gradient(circle ${o.size} at ${o.at}, rgb(${BRIGHT} / ${o.strength}) 0%, transparent 70%)`,
          )
          .join(", "),
      }}
    />
  )
}

/**
 * Light beams — soft directional streaks, as if through a high window.
 *
 * Skewed linear gradients rather than rotated blurred rectangles: the gradient
 * already has soft edges, so there is no blur pass and one element instead of
 * four.
 */
export function LightBeams({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`${BASE} overflow-hidden ${className}`}
      style={{
        backgroundImage: [
          `linear-gradient(102deg, transparent 18%, rgb(${BRIGHT} / 0.10) 26%, transparent 34%)`,
          `linear-gradient(102deg, transparent 40%, rgb(${BRIGHT} / 0.07) 46%, transparent 52%)`,
          `linear-gradient(102deg, transparent 62%, rgb(${BRIGHT} / 0.05) 68%, transparent 76%)`,
        ].join(", "),
      }}
    />
  )
}

/**
 * Gradient ground — the band's background IS the gradient.
 *
 * The others are washes laid over a flat token colour; this one replaces the
 * fill. Directional rather than radial, so it reads as a sheet of graded light
 * across the whole section instead of as a glow at a point — which is what
 * makes two adjacent light bands feel different without changing the palette.
 *
 * On `ground` the sweep runs accent → transparent → ink, which lands warm-cool
 * on the diagonal; on `deep` it runs bright → accent, which is the same
 * two-ended accent the buttons use.
 */
export function GradientGround({
  tone = "light",
  angle = "155deg",
  strength = 1,
  className = "",
}: {
  tone?: Tone
  angle?: string
  /** Multiplier on the stop alphas. 1 is the tuned default; lower to calm a busy band. */
  strength?: number
  className?: string
}) {
  const a = (v: number) => (v * strength).toFixed(3)
  const stops =
    tone === "deep"
      ? `linear-gradient(${angle}, rgb(${BRIGHT} / ${a(0.16)}) 0%, rgb(${ACCENT} / ${a(0.34)}) 46%, rgb(${INK} / ${a(0.5)}) 100%)`
      : `linear-gradient(${angle}, rgb(${BRIGHT} / ${a(0.34)}) 0%, rgb(${ACCENT} / ${a(0.1)}) 38%, transparent 62%, rgb(${INK} / ${a(0.06)}) 100%)`

  return (
    <div aria-hidden className={`${BASE} ${className}`} style={{ backgroundImage: stops }} />
  )
}

/**
 * Conic sweep — light rotating about a point rather than radiating from one.
 *
 * The stop list is deliberately closed (the last stop repeats the first), so
 * the sweep has no seam. An unclosed conic gradient shows a hard radial line
 * where 360° meets 0°, which is the giveaway that one was used carelessly.
 */
export function ConicSweep({
  at = "70% 20%",
  tone = "deep",
  strength = 0.22,
  className = "",
}: {
  at?: string
  tone?: Tone
  strength?: number
  className?: string
}) {
  const channel = tone === "deep" ? BRIGHT : ACCENT
  const s = strength
  return (
    <div
      aria-hidden
      className={`${BASE} ${className}`}
      style={{
        backgroundImage: `conic-gradient(from 210deg at ${at}, rgb(${channel} / ${s}) 0deg, transparent 90deg, rgb(${channel} / ${(s * 0.55).toFixed(3)}) 190deg, transparent 290deg, rgb(${channel} / ${s}) 360deg)`,
      }}
    />
  )
}

/**
 * A graded seam between two bands.
 *
 * The system's depth comes from hard ground swaps, and that stays true for the
 * light bands — the alternation is the rhythm. But a photographic band butting
 * straight against a near-white one is a hard horizontal line across a
 * photograph, which reads as a crop rather than as a transition. This fades the
 * neighbouring ground in over the last few dozen pixels instead.
 *
 * `ground` is a Tailwind background class, so the seam is painted in a real
 * token colour rather than an approximation of one.
 */
export function GradientSeam({
  side = "top",
  ground = "bg-ground",
  height = "clamp(48px, 7vw, 120px)",
  className = "",
}: {
  side?: "top" | "bottom"
  ground?: string
  height?: string
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 -z-10 ${
        side === "top" ? "top-0 fade-y-top" : "bottom-0 fade-y-bottom"
      } ${ground} ${className}`}
      style={{ height }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Hard-edged gradients                                                */
/*                                                                     */
/* Everything above blends. These do not: the colour changes at a line  */
/* rather than across a distance. They are a different tool — a soft    */
/* gradient is atmosphere, a hard one is structure — and a page built   */
/* only from the first reads as fog.                                    */
/* ------------------------------------------------------------------ */

/**
 * Stepped (posterised) gradient — a gradient quantised into flat plates.
 *
 * The hard edge comes from repeating each stop at both ends of its span:
 * `A 0%, A 18%, B 18%, B 36%` paints solid A then solid B with no
 * interpolation between them. Reads as printed colour separation rather than as
 * a blend, while still descending in one direction like a gradient.
 */
export function SteppedGradient({
  tone = "light",
  angle = "160deg",
  steps = 5,
  strength = 1,
  className = "",
}: {
  tone?: Tone
  angle?: string
  steps?: number
  strength?: number
  className?: string
}) {
  const peak = tone === "deep" ? 0.26 : 0.36

  const stops: string[] = []
  for (let i = 0; i < steps; i++) {
    const from = ((i / steps) * 100).toFixed(2)
    const to = (((i + 1) / steps) * 100).toFixed(2)
    // Linear ramp down, so the plates read as one separated gradient rather
    // than as unrelated stripes.
    const alpha = (peak * (1 - i / steps) * strength).toFixed(3)
    stops.push(`rgb(${BRIGHT} / ${alpha}) ${from}%`, `rgb(${BRIGHT} / ${alpha}) ${to}%`)
  }

  return (
    <div
      aria-hidden
      className={`${BASE} ${className}`}
      style={{ backgroundImage: `linear-gradient(${angle}, ${stops.join(", ")})` }}
    />
  )
}

/**
 * Solid colour blocks — a hard-stop gradient used as flat panels of colour.
 *
 * No blending anywhere: each segment is one flat tint that ends at a line. Used
 * as a wide band down one side of a section, it gives the page an edge of real
 * colour without putting anything behind the text.
 */
export function ColorBlocks({
  angle = "90deg",
  blocks = [0.32, 0.2, 0.1, 0],
  className = "",
}: {
  angle?: string
  /** Alpha per block, in order along the angle. */
  blocks?: number[]
  className?: string
}) {
  const n = blocks.length
  const stops = blocks.flatMap((a, i) => {
    const from = ((i / n) * 100).toFixed(2)
    const to = (((i + 1) / n) * 100).toFixed(2)
    return [`rgb(${BRIGHT} / ${a}) ${from}%`, `rgb(${BRIGHT} / ${a}) ${to}%`]
  })
  return (
    <div
      aria-hidden
      className={`${BASE} ${className}`}
      style={{ backgroundImage: `linear-gradient(${angle}, ${stops.join(", ")})` }}
    />
  )
}

/**
 * Hard diagonal stripes.
 *
 * Same trick as the stepped gradient — each colour repeated at both ends of its
 * span — so the edges stay crisp instead of degrading into a moire of soft
 * ramps at small periods.
 */
export function Stripes({
  tone = "light",
  angle = "135deg",
  period = 26,
  strength,
  fade = "both",
  className = "",
}: {
  tone?: Tone
  angle?: string
  /** Width of one stripe pair, in px. */
  period?: number
  strength?: number
  fade?: Fade
  className?: string
}) {
  const alpha = strength ?? (tone === "deep" ? 0.07 : 0.05)
  const channel = tone === "deep" ? PAPER : ACCENT
  const half = period / 2
  return (
    <div
      aria-hidden
      className={`${BASE} ${FADE_CLASS[fade]} ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(${angle}, rgb(${channel} / ${alpha}) 0px, rgb(${channel} / ${alpha}) ${half}px, transparent ${half}px, transparent ${period}px)`,
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Waves                                                               */
/* ------------------------------------------------------------------ */

/**
 * Flowing wave ribbons — large FILLED shapes, each with its own gradient.
 *
 * This is the "wavy gradient" everyone actually means: broad organic bands
 * sweeping across the whole surface and overlapping, so the colour reads as
 * layered sheets of material. It is not `WaveField` (thin stroked lines, a
 * rhythm) and it is emphatically not `Stripes` (hard hatching, which at low
 * alpha over a light ground just looks like a printing fault).
 *
 * Two decisions keep it from becoming the stock-image version of itself:
 *
 *  - **Two colours, not twelve.** Every layer is a gradient between the same
 *    `accent-bright` and `accent` the buttons use. The reference examples get
 *    their impact from rainbow saturation; borrowing that here would throw away
 *    the restraint the whole palette was rebuilt for. Depth comes from
 *    overlapping alpha instead of from hue.
 *  - **Asymmetric curves.** Each layer takes its control points from a fixed
 *    profile table rather than from a sine function, because evenly-phased
 *    waves read as corrugation. Real ribbons are lopsided.
 *
 * `id` namespaces the SVG gradient defs. Two instances on one page with the
 * same id would have the second silently adopt the first's fills.
 */
export function WaveRibbons({
  id = "ribbons",
  tone = "light",
  layers = 5,
  strength = 1,
  flip = false,
  className = "",
}: {
  id?: string
  tone?: Tone
  layers?: number
  strength?: number
  /** Mirror horizontally, so two bands using this do not repeat one silhouette. */
  flip?: boolean
  className?: string
}) {
  // Peak alpha per layer. Kept low because these STACK: five overlapping
  // ribbons at the alpha a single one could carry pushed the darkest region to
  // ink-2 3.5:1, under AA. The mid stop is the accent, which is much darker
  // than the bright end, so it is damped hardest.
  const peak = tone === "deep" ? 0.26 : 0.19

  // Per-layer curve character. Hand-set rather than generated: the point is
  // that the layers are NOT variations of one shape.
  const PROFILE = [
    { base: 118, amp: 96, skew: 0.62, tail: -0.42 },
    { base: 214, amp: 74, skew: -0.48, tail: 0.7 },
    { base: 306, amp: 88, skew: 0.35, tail: 0.5 },
    { base: 392, amp: 62, skew: -0.66, tail: -0.3 },
    { base: 468, amp: 80, skew: 0.5, tail: 0.44 },
    { base: 536, amp: 56, skew: -0.34, tail: 0.6 },
  ]

  const used = PROFILE.slice(0, layers)

  return (
    <div aria-hidden className={`${BASE} overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <defs>
          {used.map((p, i) => (
            <linearGradient
              key={i}
              id={`${id}-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="38%"
            >
              <stop
                offset="0%"
                stopColor={`rgb(${BRIGHT})`}
                stopOpacity={(peak * (1 - i / (layers + 1)) * strength).toFixed(3)}
              />
              <stop
                offset="58%"
                stopColor={`rgb(${ACCENT})`}
                stopOpacity={(peak * 0.28 * (1 - i / (layers + 2)) * strength).toFixed(3)}
              />
              <stop
                offset="100%"
                stopColor={`rgb(${BRIGHT})`}
                stopOpacity={(peak * 0.2 * strength).toFixed(3)}
              />
            </linearGradient>
          ))}
        </defs>

        {used.map((p, i) => {
          const { base, amp, skew, tail } = p
          // Each ribbon spans past both edges and closes to the bottom, so no
          // layer ever shows a cut end inside the frame.
          const d =
            `M -80 ${base} ` +
            `C 240 ${base - amp}, 430 ${base + amp * skew}, 700 ${base - amp * 0.3} ` +
            `S 1060 ${base + amp * tail}, 1520 ${base - amp * 0.55} ` +
            `L 1520 700 L -80 700 Z`
          return <path key={i} d={d} fill={`url(#${id}-${i})`} />
        })}
      </svg>
    </div>
  )
}

/**
 * A wave edge between two bands.
 *
 * Solid fill, not a gradient. The wave is painted in the NEIGHBOURING band's
 * ground colour through `currentColor`, so the two sections interlock along a
 * curve rather than meeting at a straight line. `ground` is a Tailwind TEXT
 * colour class, which keeps the shape on a real token instead of an
 * approximation of one.
 *
 * Deliberately shallow. A deep wave is the friendly-SaaS tell; at this
 * amplitude it reads as a cut edge on a printed sheet.
 */
export function WaveEdge({
  side = "top",
  ground = "text-ground",
  height = "clamp(28px, 4vw, 64px)",
  flip = false,
  className = "",
}: {
  side?: "top" | "bottom"
  /** Tailwind TEXT colour class — the wave is filled with currentColor. */
  ground?: string
  height?: string
  flip?: boolean
  className?: string
}) {
  // A period and a half across the viewport, so it never resolves into a shape
  // that looks like a logo.
  const d =
    side === "top"
      ? "M0,0 L1200,0 L1200,42 C1020,74 880,10 700,34 C520,58 360,96 180,66 C110,54 50,44 0,46 Z"
      : "M0,120 L1200,120 L1200,78 C1020,46 880,110 700,86 C520,62 360,24 180,54 C110,66 50,76 0,74 Z"

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-0 ${
        side === "top" ? "top-0" : "bottom-0"
      } ${ground} ${className}`}
      style={{ height, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
      >
        <path d={d} fill="currentColor" />
      </svg>
    </div>
  )
}

/**
 * A field of wave lines — the horizontal counterpart to the contour map.
 *
 * Stroked sine curves at even vertical spacing, generated rather than
 * hand-drawn so the phase walks a quarter period per line. That drift is what
 * stops a stack of identical waves reading as corrugated iron.
 */
export function WaveField({
  tone = "light",
  lines = 9,
  amplitude = 26,
  strength,
  fade = "both",
  className = "",
}: {
  tone?: Tone
  lines?: number
  amplitude?: number
  strength?: number
  fade?: Fade
  className?: string
}) {
  const alpha = strength ?? (tone === "deep" ? 0.18 : 0.11)
  const channel = tone === "deep" ? BRIGHT : ACCENT

  const paths = Array.from({ length: lines }, (_, i) => {
    const y = ((i + 0.5) / lines) * 600
    const shift = i * 75
    const at = (x: number) => `${x + shift} ${y}`
    return (
      `M ${-300 + shift} ${y} ` +
      `C ${at(-150)}, ${-150 + shift} ${y - amplitude}, ${at(0)} ` +
      `S ${150 + shift} ${y + amplitude}, ${at(300)} ` +
      `S ${450 + shift} ${y - amplitude}, ${at(600)} ` +
      `S ${750 + shift} ${y + amplitude}, ${at(900)} ` +
      `S ${1050 + shift} ${y - amplitude}, ${at(1200)} ` +
      `S ${1350 + shift} ${y + amplitude}, ${at(1500)}`
    )
  })

  return (
    <div aria-hidden className={`${BASE} overflow-hidden ${FADE_CLASS[fade]} ${className}`}>
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
      >
        <g
          fill="none"
          stroke={`rgb(${channel} / ${alpha})`}
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Technical textures                                                  */
/* ------------------------------------------------------------------ */

/** Fine engineering grid. Belongs on the register bands, not everywhere. */
export function GridLines({
  cell = 56,
  tone = "light",
  strength,
  fade = "both",
  className = "",
}: {
  cell?: number
  tone?: Tone
  strength?: number
  fade?: Fade
  className?: string
}) {
  const alpha = strength ?? (tone === "deep" ? 0.06 : 0.045)
  const channel = tone === "deep" ? PAPER : INK
  return (
    <div
      aria-hidden
      className={`${BASE} grid-lines ${FADE_CLASS[fade]} ${className}`}
      style={
        {
          "--backdrop-line": `rgb(${channel} / ${alpha})`,
          "--backdrop-cell": `${cell}px`,
        } as CSSProperties
      }
    />
  )
}

/** Dot matrix. Same family as the grid, one step quieter. */
export function DotMatrix({
  cell = 22,
  tone = "light",
  strength,
  fade = "both",
  className = "",
}: {
  cell?: number
  tone?: Tone
  strength?: number
  fade?: Fade
  className?: string
}) {
  const alpha = strength ?? (tone === "deep" ? 0.1 : 0.07)
  const channel = tone === "deep" ? PAPER : INK
  return (
    <div
      aria-hidden
      className={`${BASE} dot-matrix ${FADE_CLASS[fade]} ${className}`}
      style={
        {
          "--backdrop-line": `rgb(${channel} / ${alpha})`,
          "--backdrop-cell": `${cell}px`,
        } as CSSProperties
      }
    />
  )
}

/**
 * Perspective grid — the same grid laid flat and tilted away.
 *
 * Anchored to the bottom of its band and masked to nothing at the horizon. An
 * unmasked perspective grid terminates in a hard line that reads as a rendering
 * bug rather than as distance.
 */
export function PerspectiveGrid({
  tone = "light",
  height = "62%",
  className = "",
}: {
  tone?: Tone
  height?: string
  className?: string
}) {
  const alpha = tone === "deep" ? 0.14 : 0.055
  const channel = tone === "deep" ? PAPER : INK
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className="grid-lines perspective-grid absolute inset-0"
        style={
          {
            "--backdrop-line": `rgb(${channel} / ${alpha})`,
            "--backdrop-cell": "44px",
          } as CSSProperties
        }
      />
    </div>
  )
}

/**
 * Topographic contour lines.
 *
 * On most sites this is just a texture. Here it is close to literal: AM Group
 * trades across Jammu, Srinagar, Udhampur and Kathua, and the Pir Panjal is the
 * geography the business is shaped by. A contour map is the honest version of
 * "premium background pattern" for this particular company.
 *
 * The contours nest and never cross, because that is what contours do — eight
 * copies of one ridge line scaled about a shared origin.
 */
export function TopoLines({
  tone = "deep",
  strength,
  className = "",
}: {
  tone?: Tone
  strength?: number
  className?: string
}) {
  const alpha = strength ?? (tone === "deep" ? 0.22 : 0.09)
  const channel = tone === "deep" ? BRIGHT : INK
  const rings = Array.from({ length: 11 }, (_, i) => 0.72 + i * 0.16)

  return (
    <div aria-hidden className={`${BASE} overflow-hidden ${className}`}>
      {/*
        `preserveAspectRatio="none"`, not "slice". A band is far taller than this
        2:1 viewBox, so "slice" scales the drawing ~2x to cover and crops away
        everything but the middle two contours — which is why this read as an
        empty gradient rather than as a map. Stretching is the right call here:
        contours have no canonical aspect, and a stretched ridge is still a
        ridge.
      */}
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
      >
        <g
          fill="none"
          stroke={`rgb(${channel} / ${alpha})`}
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        >
          {rings.map((scale, i) => (
            <path
              key={i}
              transform={`translate(600 320) scale(${scale}) translate(-600 -320)`}
              d="M120 360 C 250 300, 330 392, 452 336 S 660 236, 782 300 S 980 392, 1104 320
                 C 1030 424, 872 470, 700 462 S 330 452, 210 428 S 96 400, 120 360 Z"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/**
 * A diagonal cut where two bands meet.
 *
 * Rendered as a wedge painted in the INCOMING band's own ground, sitting on top
 * of the outgoing one — so the seam is a real edge rather than a gap showing
 * the page background through it.
 */
export function DiagonalEdge({
  side = "top",
  ground = "bg-ground",
  height = "clamp(36px, 5vw, 84px)",
  className = "",
}: {
  side?: "top" | "bottom"
  ground?: string
  height?: string
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-0 ${
        side === "top" ? "top-0" : "bottom-0"
      } ${ground} ${className}`}
      style={{
        height,
        clipPath:
          side === "top"
            ? "polygon(0 0, 100% 0, 100% 0, 0 100%)"
            : "polygon(0 100%, 100% 0, 100% 100%, 0 100%)",
      }}
    />
  )
}
