---
name: AM Group
description: One design system for the whole application — a 58-year house that shows its working. Cool graphite darks under near-neutral paper, one ice-blue accent, frosted panels where there is photography to refract.
colors:
  ground: "#f6f7f8"
  ground-2: "#e9ecef"
  surface: "#ffffff"
  deep: "#14181e"
  deep-2: "#0c0e12"
  ink: "#12151a"
  ink-2: "#4c555f"
  ink-3: "#5f6971"
  on-deep: "#f6f7f8"
  on-deep-2: "#aebdc9"
  line-deep: "#6a7b8b"
  accent: "#146287"
  accent-hover: "#0f4e6d"
  on-accent: "#f6f7f8"
  accent-bright: "#8fc7e8"
  accent-bright-hover: "#aedaf1"
  on-accent-bright: "#0c0e12"
  success: "#1f7a55"
  warning: "#b15a0b"
  danger: "#b3372a"
  info: "#146287"
glass:
  blur: "18px"
  tint: "rgb(16 24 32 / 0.58)"
  solid: "rgb(13 19 26 / 0.92)"
  edge: "rgb(143 199 232 / 0.30)"
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
  sm: "6px"
  md: "10px"
  lg: "12px"
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
    textColor: "{colors.on-accent}"
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

**Key characteristics:** near-neutral light bands · cool graphite photographic bands · frosted panels where there is imagery to refract · softly-cut corners (6px controls, 10px surfaces) · hairline rules at fractional opacity · one accent, anchored at two ends · no icon beside a label that already says the word.

### The palette moved twice on 2026-08-30

Recorded because the discarded versions are still the obvious answer, and an
agent reading a catalogue will propose them again:

1. **Navy `#133A63` + scarlet `#C13A2A`, radii 0/2/4.** Rejected — reads as a
   corporate template.
2. **Off-white + forest `#1B3A32` + brass `#B08442`, radii 6/10/12.** Rejected —
   reads as a luxury template.
3. **Graphite + ice blue, with glass.** Current.

Both rejected palettes are what the design catalogues actually recommend for
"automotive dealership" (navy + action red) and "luxury/premium" (black + gold).
That is precisely why they read as generic, and it is why **the catalogue is not
the authority here**. This system carries no brand hue in its grounds at all:
the darks are neutral graphite, the lights are a hair cool, and the only colour
is an ice blue that behaves like a light source.

What did not change across all three: two typefaces, alternating bands, hairline
rules, the type scale, the 11px floor, tabular numerals, one accent used
sparingly, and the rule that every fact renders from a real source.

## Colours

Four families. Every colour in the application resolves to one of them; raw hex in a component is a defect.

Every ratio below was measured, not estimated. The numbers in brackets are the
contrast against the ground named beside them.

### Grounds
- **ground** `#F6F7F8` — page background, and the light text colour on dark grounds.
- **ground-2** `#E9ECEF` — the alternating band. Adjacent sections never share a ground.
- **surface** `#FFFFFF` — data surfaces only: cards, tables, modals, inputs. Surface on ground is how a data region separates itself, instead of a shadow.
- **deep** `#14181E` / **deep-2** `#0C0E12` — cool graphite darks. `deep` is a band ground; `deep-2` is the anchor (footer, filled nav) and the base of every photographic scrim.

### Ink
- **ink** `#12151A` primary text [17.1:1 on ground] · **ink-2** `#4C555F` secondary [7.1:1] · **ink-3** `#5F6971` tertiary and placeholders [5.2:1].
- **on-deep** `#F6F7F8` primary on dark [16.6:1 on deep] · **on-deep-2** `#AEBDC9` secondary on dark [9.3:1 on deep].

`ink-3` is darker than a tertiary grey normally is, because it carries real text
— a struck-through price, a landmark line — not just placeholders. At its
original value it measured 2.5:1.

### Line
- **line** `ink @ 12%` — hairline rules, table borders, card edges.
- **line-strong** `ink @ 24%` — input borders, anything that must read as interactive.
- **line-deep** `#6A7B8B` [4.1:1 on deep] / **line-on-deep** `ground @ 16%` — rules on dark grounds.

### Accent — one hue, anchored at two ends

An ice blue cannot do both jobs. A pale blue is invisible as a button on a
near-white page; a deep blue is invisible as a light source on graphite. So the
hue is anchored at both ends, and each end has exactly one ground it belongs to.

| | Token | Use | Measured |
|---|---|---|---|
| deep end | **accent** `#146287` | CTA fills and small accent text on **light** grounds | 6.3:1 on ground · 5.7:1 on ground-2 |
| | **on-accent** `#F6F7F8` | label on an accent fill | 6.3:1 |
| pale end | **accent-bright** `#8FC7E8` | CTA fills, hairlines, glass edges and small accent text on **dark** grounds | 9.8:1 on deep · 10.6:1 on deep-2 |
| | **on-accent-bright** `#0C0E12` | label on a bright fill | 10.6:1 |

`accent-text-light` and `accent-text-dark` remain as aliases of the two ends, so
every existing call site kept working.

> **The Accent Contrast Rule.** `accent` on `deep` measures 2.7:1 and
> `accent-bright` on `ground` measures 1.6:1. Neither is a usable pairing —
> picking the wrong end is a defect, not a style choice. The `:focus-visible`
> outline is `accent`, which clears the 3:1 of WCAG 2.4.11 on every light ground;
> on dark grounds `[data-ground="deep"]` switches it to `on-deep`.

Buttons follow the same split: `variant="primary"` is the deep end and belongs on
light grounds, `variant="bright"` is the pale end and belongs on dark ones,
`variant="glass"` is the quiet control on a photographic band.

### Semantic
`success` `warning` `danger` `info`, each with `-bg` / `-line` / `-text`, and every
`-text` measured at ≥6.8:1 on its own `-bg`. Muted and derived — never Tailwind's
default palette, which is where the old `bg-blue-50 text-blue-700 border-blue-200`
status chips came from.

**`danger` is deliberately not the accent.** Under the original navy system the two
shared a hex, so retiring the brand colour would have silently stripped every
error and destructive colour in the application with it. They are independent, and
`danger` has its own `danger-hover`.

## Backdrops

Background treatments live in `components/system/backdrops.tsx` and are composed
into a band through `Band`'s `backdrop` slot, which makes the section
`relative isolate overflow-hidden`. Every layer is `aria-hidden`,
`pointer-events-none` and at a negative z-index, so none of them can come between
the reader and the text.

**Soft** — `GradientMesh` · `Aurora` · `RadialWash` · `GlowOrbs` · `LightBeams` ·
`GradientGround` · `ConicSweep` · `GradientSeam` · `Veil`
**Hard-edged** — `SteppedGradient` · `ColorBlocks` · `Stripes`
**Waves** — `WaveRibbons` · `WaveEdge` · `WaveField`
**Texture** — `Grain` · `GridLines` · `DotMatrix` · `PerspectiveGrid` ·
`TopoLines` · `DiagonalEdge`
**Motion** (`backdrop-motion.tsx`) — `ParallaxImage` · `CursorGlow`

**Soft and hard are different tools, and the page needs both.** A soft gradient
is atmosphere; a hard one is structure. A page built only from the first reads as
fog. The hard-edged set gets its crisp boundary by repeating each stop at both
ends of its span — `A 0%, A 18%, B 18%, B 36%` paints solid A then solid B with
no interpolation — which is also what keeps `Stripes` from degrading into moire
at small periods.

**`WaveRibbons` is the default gradient treatment on light bands** — broad
filled shapes with their own gradients, overlapping like sheets of material.
`Stripes` and `ColorBlocks` were tried there first and pulled: at the low alpha a
near-white ground allows, hard hatching and flat panels read as a streaky wash
rather than as structure. They remain in the file for dark grounds and for
narrow accents, but they are not what a light band wants.

Ribbons **stack**, so layer count is a contrast decision, not a density one.
Five layers measured `ink-2` 4.46:1 at the deepest overlap — under AA. Four
measures 4.64:1. Check the composite after changing `layers`.

Two hard treatments on adjacent bands must run on **different axes** (the
divisions band steps diagonally, the register band blocks horizontally), or they
read as one continuous pattern across the seam. The same applies to a band's two
edges: soft in, wavy out — matching transitions make a section read as a
floating slab rather than as part of the page.

**One dominant treatment per band, and a signature per route.** No two routes
use the same combination — a site where every page shares one backdrop has not
gained anything over a flat ground. The signature is chosen from what the page
is about, never at random:

| Route | Signature | Why |
|---|---|---|
| `/` | ribbons · grid · topo · aurora · parallax | the full vocabulary; it is the index |
| `/about` | topographic contours + registers | the page about where the company came from |
| `/automobile` | grids, beams, a perspective grid receding under the service list | nearest this vocabulary gets to a road |
| `/hp-indian-oil` | ribbons and wave fields on every band | the one division whose product literally flows |
| `/real-estate` | blueprint grid + stepped plates reading as storeys | the division that works on drawings |
| `/s-mega-mart` | one orb, a dot field | one band, one photograph — a heavy treatment on a thin page reads as compensation |
| `/contact` | a wash and a low wave field, nothing with an edge | a decorated form field is one people abandon |
| `/blog` | dot screen + faint hatching | a halftone, for an archive of press cuttings |
| `/gallery` | a wash and nothing else | a grid of photographs is already the busiest thing a page can hold |

A grid belongs on the franchise register because that band *is* a table; the same
grid on the reviews band is wallpaper. Stock bands stay the quietest on any page,
because every card already carries a photograph, a price and two badges.

**Four rules:**

1. **No literal colours.** Layers read `--backdrop-bright` / `-accent` / `-ink` /
   `-paper` from `globals.css` — the same four tokens as everything else — and
   vary only alpha. An invented intermediate blue inside a background component
   is the drift the raw-hex rule exists to catch.
2. **No `filter: blur()` on full-bleed elements.** Aurora, orbs and beams are
   soft gradients; the compositor draws those for free, and a blur pass over a
   viewport-sized layer is one of the most expensive things a page can do.
3. **Motion is opt-in.** Anything that moves sits inside
   `prefers-reduced-motion: no-preference`, so reduce gets the static
   composition rather than a frozen half-state.
4. **Measure the composite, not the token.**

> **Gradients accumulate — seat the stack.** A mesh plus ribbons plus an aurora
> plus two orbs plus beams is five sources of light, and where several peak
> together the ground gets bright enough that `on-deep-2` falls under AA. `Veil`
> is the gradient equivalent of `.photo-scrim`: a flat token-coloured overlay
> above the colour layers and below the content, whose strength is *solved*, not
> chosen — composite it over the brightest measured pixel and find the alpha that
> restores 4.5:1.
>
> **A panel is not free.** An opaque `.panel` guarantees contrast, but it pays
> for it with the entire background underneath — two of them side by side on the
> homepage Record band covered the contour map and the photograph that band spent
> its whole backdrop budget on, and read as two grey slabs besides. A solved
> `Veil` buys the same contrast floor for nothing. Reach for a panel only where
> the surface itself is meaningful (a card, a modal), not as a way to make text
> legible on a busy ground.
>
> **Two columns of the same shape are the "three identical cards" rule at a
> different scale.** Where two registers sit side by side, give them different
> rhythms if they are different kinds of thing: the Record band's appointments
> are a sequence, so they are drawn as a timeline with a spine and ticks; its
> awards are not, so they are a table grouped by marque.
>
> Solve against the WORST region, not the first one you check. On the homepage
> hero, 0.40 fixed the headline and left the ledger at 4.16:1, because the ledger
> sits where the second orb and the mesh's bottom radial overlap. The shipped
> value is 0.54.

> **The Tertiary-on-Gradient Rule.** `ink-3` is tuned to 5.2:1 against a **flat**
> `ground`. A gradient backdrop darkens the ground under part of the band, and at
> the deepest point of the tuned gradient `ink-3` measures **3.8:1** — a fail.
> On any band carrying a gradient backdrop, tertiary text steps up to `ink-2`,
> which holds 5.1:1 there. `ink-3` is still correct inside a `surface` card on
> such a band, because the card paints over the gradient.

Measured on the built homepage: deepest gradient tint in the page gutters is
`rgb(194 216 229)` — `ink` 12.4:1, `ink-2` 5.1:1.

## Glass

Frosted panels, and the one place this system spends an effect.

**Where.** Only on bands that have photography behind them — the record band and
the closing call. **Not on the gradient hero**: glass needs something to refract,
and blurring a gradient returns the same gradient, so a panel there is a bordered
grey box. Type on an authored gradient does not need a panel anyway — every stop
is known, so the contrast floor is designed rather than defended against, which
was the panel's entire job.

Glass on a *control* is still right over a gradient — a button's tint guarantees
its label a consistent backing wherever the gradient runs brightest, which is the
same argument as the panel over a photograph, at a scale where blur is not the
point. A blurred panel over a flat ground has nothing to blur
and is a bordered grey box. Five of the homepage's eight bands are light and flat,
because that is what registers, a stock grid and an address block want to be read
on.

**Tokens.** `--glass-blur: 18px` · `--glass-tint: rgb(16 24 32 / .58)` ·
`--glass-solid: rgb(13 19 26 / .92)` · `--glass-edge: rgb(143 199 232 / .30)`.

**Classes.** `.glass` (panel: tint, blur, lit edge, `radius-md`) · `.glass-bar`
(header and mobile action bar: no radius, no border — the caller adds the edge it
needs) · `.panel` (same tint and edge, **no blur**) · `.photo-scrim` (the two-stop
gradient a photographic band paints under its panels).

Four rules, and each one is why this is not decoration:

1. **The panel darkens what is behind it.** Over uncontrolled photography a light
   translucent panel inherits whatever is underneath, which is exactly how the
   first build measured a 2.11:1 subhead. These panels composite a dark tint over
   an already-dark scrim, so the text floor does not move when the photograph
   does. Measured on the built page, no panel background exceeds RGB 72 — primary
   text ≥9:1, secondary ≥5:1.
2. **There is a no-blur fallback.** `backdrop-filter` is unsupported or disabled
   often enough to matter, and without it a 58%-opaque panel over a photo is
   unreadable. The default declaration is the near-opaque fallback; the
   translucent version is applied only inside `@supports`.
3. **Transparency is a preference.** `prefers-reduced-transparency: reduce` gets
   the solid panel.
4. **Blur is spent, not sprinkled.** It is a compositor cost that scales with
   painted area and is recomputed on scroll, so large text regions use `.panel`
   (no blur) and blur is never animated. Whole panels, never many small ones.

**This reverses an earlier ban.** This document previously listed glassmorphism
and `backdrop-blur` under Don't. That ban was written against decorative blur with
no contrast contract; the client asked for glass directly, and the four rules
above are the conditions under which it ships.

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

`0` by default — full-bleed bands and hairline dividers, where a rounded corner is not softness but a gap. `6px` on inputs, buttons, chips and badges. `10px` on cards, photographic plates, panels and tables. `12px` on modals, drawers, popovers and toasts. `9999px` only for avatars and status dots — things that are round in life.

The scale used to be `0 / 2 / 4`, which read as hard-edged rather than
architectural. Because every surface in the app addresses radius through
`rounded-sm` / `rounded-md` / `rounded-lg` rather than a literal, moving the
three token values moved the whole application at once — which is the same
property that let the palette change three times in a day without touching a
component.

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
- **Don't** use `backdrop-blur` as decoration, gradient text, blurred colour blobs, or decorative circles. Glass is allowed, but only through `.glass` / `.glass-bar`, only over photography, and only with the four rules in **Glass** satisfied — a blurred panel on a flat ground is not glass, it is a grey box.
- **Don't** use the wrong end of the accent for the ground you are on: `accent` is for light grounds, `accent-bright` for dark. And never `text-ground` on an accent fill — it is `text-on-accent` or `text-on-accent-bright`.
- **Don't** animate anything but transform, opacity and clip-path, and never loop without a reduced-motion guard.
- **Don't** add an icon next to a label that already says the word.
- **Don't** let a page invent its own Button, Input, Dialog or Table.
- **Don't** put three identical cards in a row because there are three things.

---

*Audit that produced this system, plus the phase plan and route tracking board: `REDESIGN.md`.*
