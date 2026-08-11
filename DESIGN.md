---
name: AM Group
description: One design system for the whole application — a 58-year house that shows its working. Flat, sharp, measured; depth from grounds and hairlines, never shadow.
colors:
  ground: "#f4f3ee"
  ground-2: "#eae8e0"
  surface: "#ffffff"
  deep: "#133a63"
  deep-2: "#0d2a4a"
  ink: "#14161a"
  ink-2: "#565e6a"
  ink-3: "#9aa1ab"
  on-deep: "#f4f3ee"
  on-deep-2: "#a9bfdd"
  line-deep: "#9fb6d6"
  accent: "#c13a2a"
  accent-hover: "#a32e20"
  accent-text-light: "#a32e20"
  accent-text-dark: "#f08a70"
  success: "#1f6b4a"
  warning: "#a66a00"
  danger: "#c13a2a"
  info: "#133a63"
typography:
  display:
    fontFamily: "Barlow Condensed, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "Barlow Condensed, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Archivo, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  none: "0px"
  sm: "2px"
  md: "4px"
  full: "9999px"
spacing:
  container-x: "20px (40px md)"
  section-y: "80px (112px md)"
  admin-section-y: "24px (32px md)"
  container-max: "1400px (1280px admin)"
  anchor-offset: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ground}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
---

# Design System: AM Group

## Overview

**Creative North Star: "Shows its working."**

AM Group has traded since 1968 and publishes real numbers — 26 outlets, 8 franchises, dated awards, live stock counts, exact addresses. The interface is built so those numbers are the design: measured claims, hairline rules, captioned photography, flat surfaces, one accent used sparingly. The aesthetic IS the argument that the company is verifiable. Nothing here is decorative, and nothing claims more than the data supports.

This evolved from the homepage-only "Master Drawing Set" world (seed key `2486ed40`). The structural DNA was kept and promoted; the conceit was dropped. Sheet numbering became real information architecture, title blocks became section headers, and Fragment Mono — annotation type — was retired, because in a product an engineering-drawing costume is exactly the thing the original spec warned against.

**Scope: the whole application.** Public pages, SEO landings, inventory, and the admin lead desk all share one token set. There is no per-route visual world, and the previous "do not harmonise inner pages" boundary is void. Admin differs in **density only** — see Density.

**Key characteristics:** flat surfaces · sharp edges · hairline rules at fractional opacity · depth from ground swaps, not shadow · photography as bordered captioned plates · one accent · no icon beside a label that already says the word.

## Colours

Four families. Every colour in the application resolves to one of them; raw hex in a component is a defect.

### Grounds
- **ground** `#F4F3EE` — page background, and the light text colour on dark grounds.
- **ground-2** `#EAE8E0` — the alternating band. Adjacent sections never share a ground.
- **surface** `#FFFFFF` — data surfaces only: cards, tables, modals, inputs. Surface on ground is how a data region separates itself, instead of a shadow.
- **deep** `#133A63` / **deep-2** `#0D2A4A` — dark grounds: hero, footer, admin rail.

### Ink
- **ink** `#14161A` primary text · **ink-2** `#565E6A` secondary · **ink-3** `#9AA1AB` tertiary and placeholders.
- **on-deep** `#F4F3EE` primary on dark · **on-deep-2** `#A9BFDD` secondary on dark.

### Line
- **line** `ink @ 12%` — hairline rules, table borders, card edges.
- **line-strong** `ink @ 24%` — input borders, anything that must read as interactive.
- **line-deep** `#9FB6D6` / **line-on-deep** `ground @ 16%` — rules on dark grounds.

### Accent — one colour
- **accent** `#C13A2A` — CTAs, active states, drawn accent rules. **Fills, lines and display-scale type only.**
- **accent-text-light** `#A32E20` — the only accent for small text on `ground` / `ground-2` / `surface`.
- **accent-text-dark** `#F08A70` — the only accent for small text on `deep` / `deep-2`.

> **The Accent Contrast Rule.** Base accent is ~4.0:1 on ground — it fails AA for text under 18px. Pick the variant for the ground you are on. These variants exist for WCAG, not for taste.

### Semantic
`success` `warning` `danger` `info`, each with `-bg` / `-line` / `-text`. Muted and derived — never Tailwind's default palette, which is where the old `bg-blue-50 text-blue-700 border-blue-200` status chips came from. `danger` is the accent family, because a destructive action and the brand's marking colour are the same red.

## Typography

Two families. **Barlow Condensed** for display and headings — condensed industrial caps that read as signage and plate lettering. **Archivo** for everything else — a grotesque that holds at 15px on a midrange Android panel, which is what most of this audience reads on.

There is no third face. Fragment Mono's only real job was aligned numerals; `font-variant-numeric: tabular-nums` on Archivo does that at zero extra download, and it is applied automatically to `th`, `td`, `time`, and anything marked `data-num`.

Scale tokens: `display · h1 · h2 · h3 · h4 · body-lg · body · small · caption · meta · nav · button · label · table`. Each carries its own line-height, tracking and weight — use `text-h2`, not `text-2xl font-bold tracking-tight`.

**Three rules that fix measured failures of the previous build:**

1. **Weights are 400 / 500 / 600 / 700 only.** `font-black` and `font-extrabold` do not exist in this system. The previous build used heavy weights in 78% of all weight declarations, which is why nothing on any page read as emphasised.
2. **Nothing below 11px, ever.** `text-meta` at 11px is the floor. The old `text-[8px]` / `[9px]` / `[10px]` tracked micro-caps are gone.
3. **Tracking above 0.10em is reserved for `meta`.** No `tracking-[0.3em]` on body text.

## Layout

Full-width sections, content in `max-w-[1400px]`, `px-5 md:px-10`, `py-20 md:py-28`. 12-column ≥ lg, 6 at md, 4 at sm. Anchors clear the 64px fixed nav via `scroll-padding-top` on `html` — sections do not each carry `scroll-mt`.

Two-column compositions are asymmetric (`1fr/1.1fr`–`1.15fr/1fr`), never a 50/50 split and never three identical cards in a row. Horizontal-scroll regions (timelines, stock rails, wide tables) keep physical scale and scroll sideways on phones; each MUST carry `role="region"`, a descriptive `aria-label`, `tabIndex={0}`, and `no-scrollbar overscroll-x-contain`.

### Density

Admin shares every token and forks only on density, scoped to the admin shell:

| | Public | Admin |
|---|---|---|
| Section rhythm | `py-20` / `py-28` | `py-6` / `py-8` |
| Card padding | 24px | 16px |
| Table row | 56px | 44px |
| Body size | `body` 15px | `table` 14px |
| Control height | 44px | 36px |
| Container | 1400px | 1280px |

Touch targets stay ≥44px on any admin view below `md` — the lead desk gets used on phones.

## Elevation & Depth

Page content is **flat**. Depth comes from ground swaps between sections, 1px lines at fractional opacity, `surface` sitting on `ground`, and directional scrims over photography.

Exactly two shadows exist, and only for things that genuinely float over content:
- `shadow-overlay` — modal, drawer
- `shadow-raised` — dropdown, popover, toast, sticky table header

A dropdown over a table cannot be flat, which is why the homepage's "no shadows anywhere" rule does not survive contact with a product. Everything else has none.

## Shapes

`0` by default. `2px` on inputs, buttons and chips. `4px` on modals, drawers and popovers. `9999px` only for avatars, status dots and the year stamp — things that are round in life.

Photography never bleeds unframed: every image sits in a bordered `<figure>` with a real caption.

## Motion

One easing family, four durations, nine behaviours. **Transform, opacity and clip-path only.**

```
--ease-out   cubic-bezier(0.16, 1, 0.30, 1)   entrances, expands, reveals
--ease-in    cubic-bezier(0.40, 0, 1, 1)      exits
--ease-move  cubic-bezier(0.65, 0, 0.35, 1)   position changes both ways

--duration-1  120ms   press, hover, colour
--duration-2  180ms   dropdown, tooltip, toast, chip
--duration-3  240ms   modal, drawer, tab, accordion
--duration-4  400ms   section reveal, page transition, line draw
```

| Behaviour | Spec |
|---|---|
| Enter | opacity 0→1 + translateY 8px→0 · `duration-3` `ease-out` |
| Exit | opacity 1→0 + translateY 0→4px · `duration-2` `ease-in` |
| Hover | colour and border only · `duration-1` · **no lift, no scale** |
| Press | `scale(0.98)` · `duration-1` |
| Expand | height + opacity · `duration-3` `ease-out` |
| Collapse | reverse · `duration-2` `ease-in` |
| Reveal | `clip-path` inset wipe for plates, `scaleX` from origin for rules · `duration-4` · `viewport={{ once: true }}` |
| Loading | one opacity shimmer 0.4↔0.7 over 1.4s. One spinner, rotate only |
| Success / Error | ground and border colour change · `duration-2` |

**Motion communicates state and hierarchy. It is not decoration.** No confetti, no bouncing, no infinite loops outside the shimmer and the spinner, no parallax, no scroll-jacking.

`prefers-reduced-motion: reduce` is honoured **globally in `app/globals.css`** — transforms off, opacity only, every loop stopped, `scroll-behavior: auto`. It is not a per-component decision, so a component cannot opt out by forgetting.

Reach for framer-motion only when a component needs orchestration or presence — modal, drawer, gallery, register swap. Hover, press and colour are CSS transitions.

## Focus

One system, defined once in the base layer: `2px solid accent`, `outline-offset: 2px`, `:focus-visible` only. On dark grounds the outline switches to `on-deep` via `[data-ground="deep"]`. Every interactive element gets it; nothing removes it.

## Components

Primitives live in `components/ui/*` and are the only source of these patterns. A page may compose them; a page may not reinvent them.

**Form** — Button · Field · Input · Textarea · Select · Checkbox · Radio · Switch
**Data** — Table (+ SortableHeader, sticky header, row select, mobile fallback) · Pagination · Badge / StatusBadge · Stat · Chip · RangeControl
**Surface** — Card · Plate · Panel · Section · Divider
**Overlay** — Dialog · Drawer · DropdownMenu · Tooltip · Toast · Popover
**Feedback** — Alert · EmptyState · Skeleton · Spinner · ProgressBar · ErrorState
**Navigation** — SiteNav · SiteFooter · Breadcrumbs · Tabs
**Media** — Figure · Gallery + Lightbox

`Field` owns the label / required marker / help text / error message / `aria-describedby` wiring, so the previous build's unlabelled-input bug cannot recur in a new form.

`Dialog` owns focus trap, Escape, scroll lock, focus restoration, `role="dialog"`, `aria-modal` and `aria-labelledby`. Every modal and confirmation in the application is a `Dialog` — including destructive confirmations, which are never `window.confirm()`.

## Icons

**No icon library.** `lucide-react` is banned and removed from `package.json`.

In order of preference: **delete the icon** (most decorate a label that already says the word) → **type or CSS** (chevrons, arrows, dividers, close) → **custom inline SVG** from `components/system/marks.tsx` (20×20 viewBox, 1.5px stroke, square caps, sized `1.1em`), only where an icon carries meaning a word cannot — brand marks, WhatsApp, map pin, status indicator.

## Do's and Don'ts

### Do
- **Do** render every fact from a real source — `components/home/content.ts`, `lib/locations.ts`, `getInventory()`. Never hardcode a claim in a component.
- **Do** mark placeholders visibly: unverified years as "c. 2000", missing photography as a reserved plate, missing counts as "—". The degraded inventory state renders an honest "sync down" panel — **never fake cars**.
- **Do** keep NAP (name, address, phone, hours) coming from `lib/locations.ts`. Local ranking depends on it.
- **Do** leave `data-track-location` on every `tel:` / `wa.me` / `mailto:` anchor — the delegated `LinkTracker` reads it, and no onClick replaces it.
- **Do** use the scale tokens (`text-h2`, `text-meta`) rather than reassembling them from Tailwind primitives.

### Don't
- **Don't** write a raw hex, a shadow, or a radius that is not in the token set.
- **Don't** use `font-black` / `font-extrabold`, or any text below 11px.
- **Don't** use glassmorphism, `backdrop-blur` as decoration, gradient text, blurred colour blobs, or decorative circles — all of it was in the previous build and none of it survives.
- **Don't** put small base-accent text on any ground; pick the contrast variant.
- **Don't** animate anything but transform, opacity and clip-path, and never loop without a reduced-motion guard.
- **Don't** add an icon next to a label that already says the word.
- **Don't** let a page invent its own Button, Input, Dialog or Table.
- **Don't** put three identical cards in a row because there are three things.

---

*Audit that produced this system, plus the phase plan and route tracking board: `REDESIGN.md`.*
