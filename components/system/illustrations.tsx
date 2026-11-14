import type { CSSProperties, ReactNode } from "react"

/**
 * Spot illustrations — the site's own drawing set.
 *
 * ONE GRAMMAR. Flat shapes in the accent blue, its pale end and white, a 2.5px
 * rounded outline in ink, and a few loose squares for movement. Objects only:
 * cars, keys, a phone, papers. No characters — a hand-written figure reads as
 * clip art, and these have to sit beside real photographs of real cars.
 *
 * COLOUR IS FOUR VARIABLES, set on the <svg>, so the same drawing works on a
 * light ground and on a blue tile without a second copy:
 *
 *   --il-line   outline
 *   --il-body   the main fill (the car)
 *   --il-mid    the second fill (glass, screens, accents)
 *   --il-pale   the soft pool the drawing sits on
 *
 * Every illustration is decorative: the heading beside it says the same thing
 * in words, so each <svg> is aria-hidden.
 */

type Tone = "light" | "blue"

const TONES: Record<Tone, CSSProperties> = {
  light: {
    "--il-line": "var(--color-ink)",
    "--il-body": "var(--color-accent)",
    "--il-mid": "rgb(var(--backdrop-bright))",
    "--il-pale": "#d6e9f4",
    "--il-paper": "#ffffff",
  } as CSSProperties,
  // On a blue tile the car turns white and the pool becomes a lighter blue.
  blue: {
    "--il-line": "#0a3247",
    "--il-body": "#ffffff",
    "--il-mid": "rgb(var(--backdrop-bright))",
    "--il-pale": "rgb(255 255 255 / 0.16)",
    "--il-paper": "#ffffff",
  } as CSSProperties,
}

function Frame({
  tone = "light",
  className = "",
  viewBox = "0 0 240 180",
  children,
}: {
  tone?: Tone
  className?: string
  viewBox?: string
  children: ReactNode
}) {
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      fill="none"
      stroke="var(--il-line)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={TONES[tone]}
      className={className}
    >
      {children}
    </svg>
  )
}

/** The loose squares that give the set its movement. */
function Confetti({ points }: { points: [number, number, number][] }) {
  return (
    <g stroke="none">
      {points.map(([x, y, r], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="7"
          height="7"
          rx="1.5"
          transform={`rotate(${r} ${x + 3.5} ${y + 3.5})`}
          fill={i % 2 ? "var(--il-mid)" : "var(--il-body)"}
        />
      ))}
    </g>
  )
}

/** A small hatchback, side on. 190 x 100 at scale 1, wheels resting on y = 96. */
function Car({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="95" cy="97" rx="88" ry="5" fill="var(--il-line)" opacity="0.12" stroke="none" />
      <path
        d="M10 74c0-12 6-17 16-19l20-4 19-21c4-4 8-6 14-6h40c7 0 12 2 16 6l19 21 18 4c9 2 14 7 14 17v8c0 3-2 5-5 5H15c-3 0-5-2-5-5v-6Z"
        fill="var(--il-body)"
      />
      <path d="M71 34 56 51h36V32H76c-2 0-4 1-5 2Z" fill="var(--il-mid)" />
      <path d="M99 32v19h44l-14-16c-2-2-4-3-7-3H99Z" fill="var(--il-mid)" />
      <path d="M95.5 52v30M104 60h9" />
      <rect x="170" y="60" width="10" height="7" rx="2" fill="var(--il-paper)" />
      <path d="M10 70h7" />
      <circle cx="50" cy="84" r="14" fill="var(--il-line)" />
      <circle cx="50" cy="84" r="5.5" fill="var(--il-paper)" />
      <circle cx="146" cy="84" r="14" fill="var(--il-line)" />
      <circle cx="146" cy="84" r="5.5" fill="var(--il-paper)" />
    </g>
  )
}

/** A key on a ring with a square tag. Drawn around 0,0; about 70 wide. */
function Key({ x = 0, y = 0, rotate = 0 }: { x?: number; y?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <circle cx="0" cy="0" r="13" fill="var(--il-paper)" />
      <circle cx="0" cy="0" r="4.5" fill="var(--il-mid)" />
      <path d="M13 0h36M38 0v9M47 0v7" />
    </g>
  )
}

/* ------------------------------------------------------------------ */

/** Buying: a car and its key. */
export function IlloBuy({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Frame tone={tone} className={className}>
      <circle cx="128" cy="92" r="74" fill="var(--il-pale)" stroke="none" />
      <Car x={24} y={48} />
      <Key x={52} y={40} rotate={-24} />
      <Confetti points={[[176, 30, 20], [200, 52, -15], [26, 96, 30]]} />
    </Frame>
  )
}

/** Selling: a car and what it is worth. */
export function IlloSell({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Frame tone={tone} className={className}>
      <circle cx="112" cy="92" r="74" fill="var(--il-pale)" stroke="none" />
      <Car x={24} y={48} />
      {/* A rupee coin. */}
      <circle cx="186" cy="44" r="24" fill="var(--il-paper)" />
      <path d="M177 33h18M177 41h18M177 33h6a8 8 0 0 1 0 16h-6l13 12" />
      <Confetti points={[[40, 28, 20], [70, 12, -20], [214, 86, 30]]} />
    </Frame>
  )
}

/** Step: choose a car on the phone. */
export function IlloChoose({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Frame tone={tone} className={className}>
      <circle cx="120" cy="92" r="76" fill="var(--il-pale)" stroke="none" />
      <rect x="76" y="14" width="88" height="154" rx="14" fill="var(--il-paper)" />
      <path d="M108 26h24" />
      {/* The listing on the screen. */}
      <rect x="88" y="40" width="64" height="52" rx="6" fill="var(--il-mid)" stroke="none" />
      <Car x={93} y={52} scale={0.29} />
      <path d="M88 106h44M88 118h28" />
      <rect x="88" y="134" width="64" height="20" rx="6" fill="var(--il-body)" />
      {/* The search glass. */}
      <circle cx="184" cy="66" r="20" fill="var(--il-paper)" />
      <path d="m198 81 16 17" strokeWidth="5" />
      <path d="M176 66l6 6 11-12" />
      <Confetti points={[[36, 44, 20], [50, 130, -15], [196, 132, 30]]} />
    </Frame>
  )
}

/** Step: come and drive it. */
export function IlloDrive({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Frame tone={tone} className={className}>
      <circle cx="120" cy="92" r="76" fill="var(--il-pale)" stroke="none" />
      {/* The road, running away to a pin. */}
      <path d="M22 168c26-34 62-44 98-44s66-12 92-46" stroke="var(--il-paper)" strokeWidth="26" />
      <path d="M22 168c26-34 62-44 98-44s66-12 92-46" strokeDasharray="10 12" />
      {/* The wheel. */}
      <circle cx="104" cy="82" r="52" fill="var(--il-body)" />
      <circle cx="104" cy="82" r="37" fill="var(--il-pale)" />
      <circle cx="104" cy="82" r="37" fill="var(--il-paper)" opacity="0.7" stroke="none" />
      <path d="M68 76h24M116 76h24M104 94v24" strokeWidth="9" stroke="var(--il-body)" />
      <circle cx="104" cy="82" r="13" fill="var(--il-body)" />
      {/* The pin at the far end. */}
      <path d="M204 70s17-15 17-29a17 17 0 1 0-34 0c0 14 17 29 17 29Z" fill="var(--il-paper)" />
      <circle cx="204" cy="41" r="6" fill="var(--il-mid)" />
      <Confetti points={[[30, 34, 20], [174, 132, -15]]} />
    </Frame>
  )
}

/** Step: the paperwork, and the keys. */
export function IlloPapers({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Frame tone={tone} className={className}>
      <circle cx="120" cy="92" r="76" fill="var(--il-pale)" stroke="none" />
      <rect x="62" y="22" width="96" height="128" rx="10" fill="var(--il-mid)" transform="rotate(-7 110 86)" />
      <rect x="70" y="20" width="96" height="128" rx="10" fill="var(--il-paper)" />
      <path d="M86 44h46M86 60h64M86 76h64M86 92h40" />
      {/* The seal. */}
      <circle cx="140" cy="122" r="20" fill="var(--il-body)" />
      <path d="m131 122 7 7 12-14" stroke="var(--il-paper)" strokeWidth="3.5" />
      <Key x={178} y={132} rotate={-38} />
      <Confetti points={[[36, 40, 20], [192, 34, -15], [44, 132, 30]]} />
    </Frame>
  )
}

/** A showroom front — for locations and empty states. */
export function IlloShowroom({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Frame tone={tone} className={className}>
      <circle cx="120" cy="92" r="76" fill="var(--il-pale)" stroke="none" />
      <path d="M40 60h160v96H40z" fill="var(--il-paper)" />
      <path d="M32 60 48 30h144l16 30H32Z" fill="var(--il-body)" />
      <path d="M56 84h128v72H56z" fill="var(--il-mid)" />
      <Car x={72} y={96} scale={0.5} />
      <path d="M20 156h200" />
      <Confetti points={[[18, 40, 20], [214, 110, -15]]} />
    </Frame>
  )
}
