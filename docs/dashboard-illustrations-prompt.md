Create a set of **spot illustrations** for this dashboard, one for each scenario where a screen currently shows only text or nothing: empty states, success, errors, first-time and waiting screens. Draw them yourself as **inline SVG React components**, in one file, in the visual grammar described below.

**Do not:**
- import an illustration or icon library (no undraw, Storyset, lucide, heroicons…);
- generate raster images;
- copy artwork from another website.

## Step 1: find the scenarios first

Before drawing anything, go through the dashboard's routes and components and list every place that needs one:
- **Empty states:** a table or list with no rows, a search or filter with no results, a section never used yet.
- **Success:** a record saved, a car marked sold, a lead won, an import finished, everything up to date or "all caught up".
- **Errors:** a load failure, no internet / offline, no permission, page not found, session expired.
- **Waiting:** a long job running, an upload in progress, nothing scheduled today.
- **Welcome:** the first screen a new user sees in a module.

Write the list as a table with three columns: route/component, scenario, and the one object the drawing should show. Then build the set. Reuse one drawing for several screens when the meaning is the same, rather than drawing near-duplicates.

A starting point for the common cases, which you can change to suit the dashboard:

| Scenario | What the drawing shows |
|---|---|
| No cars in stock / no vehicles | An empty parking bay: two painted lines and a traffic cone |
| No leads yet | A phone lying flat with an empty speech bubble |
| Follow-ups: all caught up | A clipboard with every box ticked |
| No search results | A magnifying glass over an empty card |
| Saved / done | A document with a large tick |
| Car sold / deal won | A car with a "SOLD" tag hanging from the mirror, plus confetti |
| Upload photos | A camera with an upward arrow |
| Upload in progress / working | A gear and a clock |
| Error / could not load | A car on a jack with its wheel off |
| Offline | A plug pulled from its socket |
| No permission | A padlock on a door |
| Page not found | A road sign pointing two ways |
| Session expired | An hourglass |
| Welcome to a module | An open toolbox |
| Nothing scheduled today | A calendar page with one blank day |
| Reports with no data | A bar chart with empty bars |

## Step 2: the visual grammar (follow it exactly)

The set must look like it was drawn by one hand.

**Canvas.** `viewBox="0 0 240 180"` for every drawing. Keep the composition centred, with about 16px clear on every side.

**Line.** One outline style for everything:
- `stroke="var(--il-line)"`, `strokeWidth="2.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
- Set these once, on the `<svg>` root, with `fill="none"`. Shapes that need no outline set `stroke="none"` themselves.
- Never a second line weight, and no dashed lines except where the object really is dashed (a painted bay line).

**Shapes.** Flat fills only. No gradients, no shadows except one soft ground shadow, no textures, no 3-D, no isometric. Use simple geometry with rounded corners (`rx` 2–6). A drawing has 3–8 main shapes; if it needs more, it's too detailed.

**Objects only, never people.** No characters, faces, hands or mascots. A drawn person reads as clip art next to real data and photographs. Show the object the scenario is about.

**Composition**, the same in every drawing:
1. A soft **pool** behind the object: a circle (`r` ≈ 70–76) or a rounded blob filled with `var(--il-pale)`, `stroke="none"`.
2. The **main object** in `var(--il-body)` with the outline.
3. **Details** (glass, screens, labels, the tick) in `var(--il-mid)` or `var(--il-paper)`.
4. A faint **ground shadow** under objects that stand on something: an ellipse filled `var(--il-line)` at `opacity="0.12"`, `stroke="none"`.
5. Two to four loose **confetti squares** for movement: 7×7 rects, `rx="1.5"`, each rotated between −30° and 30°, alternating `--il-body` and `--il-mid` fills, no outline. Use them on success and welcome drawings; one or two at most on errors, and none on "no permission".

**Colour is five CSS variables**, set on the `<svg>` with `style`, never hard-coded inside a drawing:

| Variable | Role |
|---|---|
| `--il-line` | outline and wheels/dark parts |
| `--il-body` | the main fill |
| `--il-mid` | the second fill (glass, screens, accents) |
| `--il-pale` | the pool behind the drawing |
| `--il-paper` | white parts (paper, tyre hubs, labels) |

Map them to **this dashboard's own design tokens**. Read its theme or CSS variables first. Use its primary brand colour for `--il-body`, its text colour for `--il-line`, a light tint of the brand colour for `--il-pale`, and its surface or white for `--il-paper`. Don't introduce new colours.

**Tones.** Provide at least two:
- `light`, for drawings on the normal page background;
- `onBrand`, for drawings on a solid brand-coloured panel: the body turns white, the pool becomes white at 16% opacity, and the outline darkens.

If the dashboard has a **dark mode**, add a `dark` tone too. Switch tones by changing the variables only, never by drawing a second copy.

**Error drawings stay calm.** Use the same colours, never red alarm graphics. The words next to the drawing explain the problem.

## Step 3: code shape

- **One file**, e.g. `components/illustrations.tsx`, matching the dashboard's folder conventions.
- **A shared `Frame`** wrapper that renders the `<svg>` with the viewBox, line settings and tone variables, plus small reusable parts drawn once and placed with `transform`: `Car`, `Phone`, `Document`, `Tick`, `Confetti`, `Pool`.
- **One exported component per drawing**, named for the object or scenario (`IlloEmptyBay`, `IlloAllCaughtUp`, `IlloSold`…), with props `{ tone?: Tone; className?: string }`.
- **Every `<svg>` is `aria-hidden`.** The heading and text beside the drawing carry the meaning, so the illustration is decorative.
- **Size is set by the caller** through `className` (e.g. `h-32 w-auto`), never fixed inside the drawing.
- **Wire them in through one shared component**, `EmptyState`, if the dashboard has one, or create it:
  - illustration on top (or on the left in a wide panel), then a short heading, one sentence, and at most one button;
  - for example: "No leads yet" / "Enquiries from the website will appear here." / [View website].
  - Replace the bare "No data" texts you found in step 1 with it.
- **No new dependencies.** Keep each drawing under about 2 KB.

## Done when

- The scenario table from step 1 is complete. Every listed screen shows its illustration with a heading and one sentence.
- All drawings share the viewBox, the single 2.5px rounded outline, the five colour variables, the pool and the confetti rules. Seen side by side, they look like one set.
- No drawing contains a person, a gradient, a hard-coded colour, or an imported image.
- Switching a drawing to the `onBrand` tone (and `dark`, if the dashboard has a dark mode) needs no change to the drawing itself.
- Contrast of the heading and text next to each drawing passes WCAG AA, and screen readers skip the drawings.
