# AM Group — Application-Wide Redesign: Audit & Plan

> Status: **PHASE 1 COMPLETE — awaiting direction sign-off before Phase 2.**
> Baseline: `npx tsc --noEmit` → exit 0 (clean). This is the regression gate for every phase.
> Audited 2026-08-11 against working tree at `13204b9` + uncommitted homepage rebuild.

---

# PART 1 — AUDIT

## 1.1 What is actually in this repository

Two complete, mutually exclusive design systems are live in the same application right now.

| | System A — "Incumbent" | System B — "Drawing Office" |
|---|---|---|
| Scope | Every route except `/` | `/` only |
| Files | `components/sections/*`, `components/layout/*`, `components/ui/*`, all inner pages, all admin | `app/page.tsx`, `components/home/*`, `components/system/*` |
| Type | Lato (300/400/700/900) | Barlow Condensed + Archivo + Fragment Mono |
| Colour | `#023468` navy / `#E31837` red / `#D4AF37` gold | paper / ink / cyanotype print / redline |
| Radius | 15 distinct values up to `rounded-[60px]` | 0 (one circular exception) |
| Shadow | 189 declarations, 24 distinct | none |
| Icons | lucide-react | inline SVG glyphs |
| Motion | ad-hoc, no reduced-motion | one primitive, full reduced-motion |
| State | committed, in production | **uncommitted**, unreviewed |

`DESIGN.md` explicitly forbids harmonising these two. **Your brief overrides that**: one system, whole application. `DESIGN.md` will be rewritten as the app-wide contract, not deleted.

### Dead code found (must be resolved, not carried forward)

`app/page.tsx` was switched to `components/home/*` and left `app/home-client.tsx` orphaned. That orphan is the only thing keeping eight section components alive.

| File | Lines | Status |
|---|---|---|
| `app/home-client.tsx` | 208 | unreferenced |
| `components/sections/hero.tsx` | 239 | only via dead home-client |
| `components/sections/overview.tsx` | 116 | only via dead home-client |
| `components/sections/service.tsx` | 165 | only via dead home-client |
| `components/sections/finance.tsx` | 105 | only via dead home-client |
| `components/sections/services-new.tsx` | 180 | only via dead home-client |
| `components/sections/why-us.tsx` | 70 | only via dead home-client |
| `components/sections/customer-dealership.tsx` | 246 | only via dead home-client |
| `components/sections/searched-electric-cars.tsx` | 175 | only via dead home-client |
| `components/sections/google-reviews.tsx` | 197 | unreferenced |
| `components/sections/logo-carousel.tsx` | 62 | unreferenced |
| `components/sections/parallax-banner.tsx` | 60 | unreferenced |
| `components/sections/showcase-carousel.tsx` | 211 | unreferenced |
| `components/sections/team-mosaic.tsx` | 88 | unreferenced |
| `components/system/site-nav.tsx` | 258 | **built but never wired** |
| `components/system/site-footer.tsx` | 163 | **built but never wired** |

≈ 2,543 lines of dead UI. `components/system/site-nav.tsx` + `site-footer.tsx` are a finished app-wide nav/footer in System B that nothing imports — the layout still renders `components/layout/navbar.tsx` and `footer.tsx`.

---

## 1.2 Route inventory

### Public routes — 17 page routes + 5 non-visual

| # | Route | Type | Renders | Data | Status |
|---|---|---|---|---|---|
| P01 | `/` | static | `components/home/*` (9 sections) | `getHomeInventory()` | Not started |
| P02 | `/about` | static | `about-client.tsx` (293) | none | Not started |
| P03 | `/automobile` | static | `automobile-client.tsx` (95) + `GroupBrands` | none | Not started |
| P04 | `/hp-indian-oil` | static | `hp-indian-oil-client.tsx` (149) | none | Not started |
| P05 | `/real-estate` | static | `real-estate-client.tsx` (173) | none | Not started |
| P06 | `/s-mega-mart` | static | `s-mega-mart-client.tsx` (181) | none | Not started |
| P07 | `/blog` | static | `blog-client.tsx` (179) | hardcoded 4 posts | Not started |
| P08 | `/contact` | static | `contact-client.tsx` (166) + `contact-form.tsx` (238) | `submitLead` | Not started |
| P09 | `/inventory` | dynamic | `inventory-client.tsx` (482) + filters (458) + `FeaturedSpotlight` | `getInventory()` | Not started |
| P10 | `/inventory/[slug]` | SSG ≈27 | `vehicle-client.tsx` (438) | `getAllVehicleSlugs()` | Not started |
| P11 | `/brands/[slug]` | SSG ≈4 | `page.tsx` (230) + `enquire-button.tsx` | `getInventory()` facets | Not started |
| P12 | `/used-cars/[slug]` | SSG ≈30–45 | `page.tsx` (164) + `enquire-button.tsx` | `getAllLandingSlugs()` | Not started |
| P13 | `/locations` | static | `page.tsx` (154) | `LOCATIONS` | Not started |
| P14 | `/locations/[slug]` | SSG 2 | `page.tsx` (290) + `stock-rail.tsx` (110) | `getLocation()`, inventory | Not started |
| P15 | `/privacy-policy` | static | `LegalDocument` (117) | none | Not started |
| P16 | `/terms` | static | `LegalDocument` (117) | none | Not started |
| P17 | `/not-found` (404) | static | `not-found.tsx` (250) | none | Not started |
| — | `/listings/[...slug]` | route handler | 301 map — **no UI** | `legacy-listing-urls.ts` | N/A |
| — | `/api/inventory/used` | route handler | JSON — **no UI** | `getInventory()` | N/A |
| — | `/llms.txt`, `/robots.ts`, `/sitemap.ts` | route handlers | **no UI** | — | N/A |

`/used-cars/[slug]` slug count is derived live from stock (4 cities + budget bands + models + body styles + fuels + transmissions), so it moves with inventory.

### Admin routes — 9

| # | Route | Type | Lines | Guarded by | Status |
|---|---|---|---|---|---|
| A01 | `/admin` | server | 152 | proxy + `requireAdmin()` | Not started |
| A02 | `/admin/login` | client form | 24 + 69 | public by design | Not started |
| A03 | `/admin/leads` | server + client | 51 + 423 | proxy + `requireAdmin()` | Not started |
| A04 | `/admin/leads/[id]` | server + client | 22 + 370 | proxy + `requireAdmin()` | Not started |
| A05 | `/admin/customers` | server | 267 | proxy + `requireAdmin()` | Not started |
| A06 | `/admin/vehicles` | client | 380 | proxy + `requireAdmin()` | Not started |
| A07 | `/admin/inventory` | server | 232 | proxy + `requireAdmin()` | Not started |
| A08 | `/admin/reports` | server | 176 | proxy + `requireAdmin()` | Not started |
| A09 | `/admin/settings` | server | 275 | proxy + `requireAdmin()` | Not started |

### Missing Next.js route files — a real gap

`find app -name "loading.tsx" -o -name "error.tsx" -o -name "global-error.tsx"` returns **nothing**.

- No route-level loading UI anywhere. `components/ui/page-loader.tsx` fakes it — a `setTimeout` chain (`30% → 70% → 100%` over 600 ms) that fires on every pathname change and is **not connected to navigation state at all**. It reports success while a slow route is still fetching.
- No error boundary anywhere. A throw in any server component renders the unstyled Next.js default error page.
- 15 `loading.tsx` + 3 `error.tsx` + 1 `global-error.tsx` need to be created.

---

## 1.3 Overlay inventory — every modal, popup, drawer

You asked for every popup. Here is what exists, versus what your brief listed.

| # | Overlay | File | Kind | Findings |
|---|---|---|---|---|
| M01 | **Enquiry / "Unlock price"** | `components/modals/unlock-price-popup.tsx` (441) | global modal in root layout | The app's only conversion surface. See defect list below. |
| M02 | **Mobile inventory filters** | `components/ui/inventory-filters.tsx` (458) | `fixed inset-0` drawer | No focus trap, no Escape, no scroll lock |
| M03 | **Mobile nav sheet** | `components/layout/navbar.tsx` (413) | AnimatePresence panel | Sets `overflow:hidden` but no focus trap / Escape |
| M04 | **Mobile nav sheet (System B)** | `components/system/site-nav.tsx` (258) | AnimatePresence panel | Built, unwired |
| M05 | **Admin vehicle add/edit** | `app/admin/vehicles/page.tsx` (380) | `fixed inset-0` form modal | No dialog semantics |
| M06 | **Delete confirmation** | `app/admin/vehicles/page.tsx:99` | `window.confirm()` | Native browser dialog. Unstyleable, unbrandable, blocks the main thread |
| M07 | **Toast** | `components/ui/toast.tsx` (129) + `toaster.tsx` | Radix Toast | Correct semantics; visually stock shadcn |
| M08 | **Vehicle image gallery** | `app/inventory/[slug]/vehicle-client.tsx` (438) | inline AnimatePresence carousel | No lightbox / fullscreen viewer |
| M09 | **Mobile action bar** | `components/layout/mobile-action-bar.tsx` (64) | fixed bottom bar | Persistent, not dismissable |

**Overlays your brief listed that do not exist:** login popup (admin login is a full page at `/admin/login`), signup, OTP, branch-details popup, success popup (success is an in-modal state swap), error popup (errors are inline + toast), form modal beyond M05, standalone image viewer.
→ These are **not gaps to fill speculatively**. `Dialog` will be built as a primitive capable of all of them; we build the instances that have a caller.

### M01 defect list — the highest-value single file in the app

Every enquiry in the business flows through this file.

**Accessibility (blocking):**
- No `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby` — `role="dialog"` appears **zero times in the entire codebase**
- No focus trap; Tab escapes to the page behind
- No Escape-to-close; backdrop click only
- No body scroll lock; the page scrolls under the modal
- No focus restoration to the trigger on close
- **The five real form fields have no `htmlFor` and do not wrap their inputs** — the only `htmlFor` in the file is on the honeypot. Screen readers announce five unlabelled text boxes.
- Backdrop carries `cursor-pointer` on the whole viewport

**Motion:**
- `repeat: Infinity` PartyPopper rotation with no `prefers-reduced-motion` guard (WCAG 2.2.2)
- Spring `damping:25 stiffness:300` on a 900 px surface — no shared timing with anything else

**Visual (the AI-slop signature):**
- `rounded-[40px]`, `rounded-3xl`, `rounded-2xl`, `rounded-xl`, `rounded-full` in one component
- `shadow-[0_50px_150px_rgba(0,0,0,0.3)]`
- `blur-[100px]` decorative red blob at `-bottom-20 -right-20`
- `backdrop-blur-xl` glass panels over a solid navy fill
- `font-black` at `text-[8px]`, `text-[9px]`, `text-[10px]` — unreadable tracked micro-caps
- 🎉 emoji in an `<h2>`
- Logo hot-linked from `amgroupind.com/wp-content/uploads/` — the WordPress site this app replaces
- Fixed `max-w-[900px]` two-panel layout regardless of content

**Functionality that MUST survive redesign:** `useActionState` reducer, `submitLead` contract, honeypot field name `companyWebsite`, duplicate/`"ignored"` lead-id handling, `reportedRef` latch, `pushEvent('generate_lead' | 'generate_lead_duplicate' | 'form_error')`, `setHasInquired` + `setShowConfetti`, uncontrolled inputs that reset by unmount.

---

## 1.4 Form inventory

| # | Form | File | Action | Validation | Notes |
|---|---|---|---|---|---|
| F01 | Enquiry modal | `unlock-price-popup.tsx` | `submitLead` | `lib/leads/validation.ts` + honeypot | 5 unlabelled fields |
| F02 | Contact | `app/contact/contact-form.tsx` (238) | `submitLead` | same | 6 `htmlFor` — the only properly labelled form |
| F03 | Admin login | `app/admin/login/login-form.tsx` (69) | `login` action | server | 1 `htmlFor` |
| F04 | Admin vehicle | `app/admin/vehicles/page.tsx` | client state | none | 0 `htmlFor` |
| F05 | Lead filters/bulk | `app/admin/leads/leads-client.tsx` | `adminBulkStatus`, `adminExportCsv` | n/a | search + status + intent + due + sort |
| F06 | Lead detail | `app/admin/leads/[id]/lead-detail-client.tsx` (370) | status/assign/follow-up/note actions | server | |
| F07 | Inventory search | `app/inventory/inventory-client.tsx` | client filter | n/a | |
| F08 | Hero search | `components/sections/hero.tsx` | client | n/a | **dead code** |

## 1.5 Table inventory

| # | Table | File | Rows from | Has |
|---|---|---|---|---|
| T01 | Leads | `app/admin/leads/leads-client.tsx` | `adminListLeads` | search, 4 filters, sort, pagination, select-all, bulk status, CSV export |
| T02 | Customers | `app/admin/customers/page.tsx` | derived from leads | — |
| T03 | Vehicles | `app/admin/vehicles/page.tsx` | client state | delete via `confirm()` |
| T04 | Inventory | `app/admin/inventory/page.tsx` | `getInventory()` | — |
| T05 | Reports | `app/admin/reports/page.tsx` | `adminGetStats` | — |
| T06 | Brand register | `components/home/brands.tsx` | `content.ts` | row → plate swap |
| T07 | Ecosystem register | `components/home/ecosystem.tsx` | `content.ts` | |

No sticky headers. No sortable column headers (sort is a separate `<select>`). No skeleton row state. No mobile strategy — tables scroll horizontally or are hidden.

---

## 1.6 Design-token audit — the numbers

Measured by grep across `app/` + `components/`:

| Signal | Count | Verdict |
|---|---|---|
| Raw `#023468` literals | **487** | no token discipline |
| Raw `#E31837` literals | **174** | |
| Raw `#D4AF37` literals | **40** | |
| Distinct hex literals total | 30+ | |
| `rounded-*` distinct values | **15** (`full`, `xl`, `2xl`, `3xl`, `lg`, `md`, `sm`, `none`, `[24px]`, `[28px]`, `[32px]`, `[36px]`, `[40px]`, `[48px]`, `[60px]`) | |
| `shadow-*` declarations | **189** across 24 distinct values | |
| `backdrop-blur-*` | **36** | expensive on the stated primary device class |
| `bg-gradient-to-*` | 26 | |
| `font-black` | **254** | |
| `font-bold` | 252 | |
| `font-extrabold` | 40 | |
| **Heavy weights as share of all weight declarations** | **546 / 700 = 78%** | nothing can be emphasised when everything is |
| Files importing `lucide-react` | **50** | to be reduced to 0 |
| `role="dialog"` | **0** | |
| `htmlFor` — files using it | **3** | |
| `useReducedMotion` / `prefers-reduced-motion` — files | **7**, all in `components/home/*` + `marks.tsx` | zero coverage outside the new homepage |
| `repeat: Infinity` / `animate-pulse` / `animate-spin` | 16 sites, 8 files | none guarded |

### `app/globals.css` (191 lines) — specific problems

- `.dark` block sets `--background: 210 40% 96.1%` with the comment *"Light Grey for 'Dark' mode as user requested light"*, while `--card`, `--popover`, `--primary` in the same block stay dark. Root layout sets `defaultTheme="dark"` + `enableSystem`. The app therefore ships a `.dark` class that is light-on-light for surfaces and dark for cards — guaranteed contrast failures, and `next-themes` is doing nothing useful.
- `@utility glass` and `@utility glass-dark` — glassmorphism utilities, explicitly out of scope for the new system.
- `.gold-gradient` — `#d4af37 → #f9f295` text-clip gradient, luxury-template residue.
- Three overlapping font mappings: `--font-sans` is declared twice (`@theme inline` → Archivo, `@theme` → Lato).
- `@theme inline` is load-bearing — next/font variables live on the homepage wrapper `div`, not `:root`. Switching to plain `@theme` silently falls back to the body font. **This constraint must be preserved or the fonts must move to `:root`.**

---

## 1.7 Media inventory — `am_group_files`

Enumerated live via service-role client. Two buckets exist:

**`am_group_files` (public) — 23 files, 3.8 MB, images only, no video**

| Folder | Files |
|---|---|
| `branches/central-workshop/` | workshop-1.webp (55 KB), workshop-2.webp (41 KB), workshop-3.webp (101 KB) |
| `branches/jammu-hyundai/` | banner.jpg (120 KB), exterior.webp (124 KB) |
| `branches/jammu-kia/` | banner.jpg (202 KB), exterior.jpg (226 KB), **hero-showroom.jpg (858 KB)** |
| `branches/luxury-showrooms/` | mg-banner.jpg (93 KB), mg-showroom.jpg (235 KB) |
| `branches/petroleum/` | station-1.webp (124 KB), station-2.webp (124 KB), station-3.jpg (220 KB) |
| `branches/real-estate/` | complex-1.jpg (74 KB), complex-2.jpg (47 KB), complex-3.jpg (62 KB) |
| `branches/smegamart/` | storefront.jpg (270 KB) |
| `branches/srinagar-hyundai/` | banner.jpg (136 KB), exterior.jpg (89 KB) |
| `branches/two-wheelers/` | bajaj.jpg (237 KB), honda.jpg (71 KB), ktm.jpg (71 KB) |
| `corporate/awards/` | trophies.png (283 KB) |

**`documents` (public) — 1 file:** an unrelated 233 KB PDF under a UUID prefix. Not site media. *Note: this bucket is public and holds a document under a guessable-if-known path — worth a separate look, outside this redesign's scope.*

### Consequences for the plan — read before promising sections

1. **All 23 assets are already mapped** in `lib/supabase-media.ts`. Nothing new to wire; the resolver is correct and stays.
2. **`public/media/` holds the same 23 images again** (`showroom-kia.jpg`, `facility-1.webp`, …). The app ships every branch photo twice. One source must win — Supabase, since it is already the canonical resolver.
3. **There is no team, staff, culture, or people photography. None.** A "team/culture section" cannot be built from real assets. Per `PRODUCT.md` ("Never invent customers, employees, testimonials"), it will not be built with stock. Excluded from scope.
4. **There is no video.** Any motion-led hero must be built from stills or drawn elements.
5. **Largest gallery set is 3 images.** A full lightbox gallery is justified only on `/inventory/[slug]`, where photography comes live from the WordPress scrape.
6. `branches/jammu-kia/hero-showroom.jpg` at 858 KB is the homepage hero plate — needs `sizes` + AVIF/WebP conversion, not just `next/image`.
7. `public/inventory_hero_bg.png` is **649 KB PNG**, used as the OG image and shipped to every visitor.

---

## 1.8 Functionality contract — preserve exactly

This is the freeze list. Any change to these is a defect, not a redesign.

**Data**
- `getInventory()` / `getHomeInventory()` — 30-min cached Motors/WordPress scrape, `lib/inventory/server.ts`
- `degraded: true` path — every consumer must keep its honest "sync down" state; never render fake cars
- `lib/inventory/adapter.ts`, `filter.ts`, `lib/integrations/motors/*` — untouched
- `getAllVehicleSlugs()`, `getAllLandingSlugs()`, `resolveLanding()`, `landingFilters()`

**Leads**
- `submitLead()` return contract: `{ok:false, error, code}` | `{ok:true, data:{id, duplicate}}`, id `"ignored"` on honeypot hit
- `lib/leads/validation.ts`, `store.ts` (Supabase-or-file fallback), `types.ts` status vocabulary
- Honeypot input **must keep `name="companyWebsite"`**
- `useEnquiryModal` store shape (`isOpen`, `vehicle`, `intent`, `sourceLabel`) — 15+ CTA call sites depend on `onOpen(vehicle, {intent, sourceLabel})`

**Auth & permissions**
- `proxy.ts` matcher, `ADMIN_COOKIE`, HMAC token in `lib/admin/session.ts`
- `requireAdmin()` inside every admin server action — UI gating is not sufficient
- 410 `GONE_EXACT` / `GONE_PREFIXES` set

**Admin actions** — `adminListLeads`, `adminGetStats`, `adminGetStorageInfo`, `adminBulkStatus`, `adminExportCsv`, `adminUpdateLead`, `logout`

**Analytics** — `pushEvent`, `vehicleParams`, and the **delegated `LinkTracker`**: it reads `data-track-location` off `tel:` / `wa.me` / `mailto:` anchors. Any markup rewrite that drops that attribute silently kills conversion tracking. `enquiry_modal_open`, `generate_lead`, `generate_lead_duplicate`, `form_error`.

**SEO** — `generateStaticParams` on 4 routes; `generateMetadata` everywhere; JSON-LD (LocalBusiness in layout, BreadcrumbList, FAQ, Vehicle); `sitemap.ts`; `robots.ts`; `llms.txt`; `/listings/[...slug]` 301 map; `next.config.ts` redirects + `remotePatterns` + headers.

**NAP** — `lib/locations.ts` is the only source of address/phone/hours. No hardcoding.

**State** — `useInventoryStore` (filters, `hasInquired`, `showConfetti`), `use-toast.ts`.

---

## 1.9 Accessibility findings (pre-work)

| Severity | Finding |
|---|---|
| Blocking | No `role="dialog"` / `aria-modal` / focus trap / Escape / scroll lock on any of the 5 overlays |
| Blocking | Enquiry modal's 5 real fields unlabelled (`htmlFor` present only on the honeypot) |
| Blocking | `window.confirm()` for vehicle deletion |
| High | 16 unguarded looping animations; `useReducedMotion` exists only inside `components/home/*` |
| High | `.dark` token block internally inconsistent; `defaultTheme="dark"` ships it to everyone |
| High | `font-black` at 8–10 px with `tracking-[0.3em]` in the enquiry modal and across `sections/*` |
| Medium | No `error.tsx` — a server throw renders the raw Next.js error page |
| Medium | No `loading.tsx`; `PageLoader` reports fake progress decoupled from navigation |
| Medium | Raw `<img>` in `app/admin/layout.tsx` |
| Medium | Tables have no caption, no scope, no sortable header semantics |
| Low | 50 `aria-label`s, several on decorative elements |

## 1.10 Performance findings (pre-work)

- 36 `backdrop-blur` instances — the audience is explicitly "midrange Android over uneven networks"
- 189 box-shadows including `shadow-[0_50px_150px]` on a 900 px surface
- `public/inventory_hero_bg.png` 649 KB; `hero-showroom.jpg` 858 KB
- `public/media/` duplicates all 23 Supabase assets into the deploy
- framer-motion imported into a large share of client components, several only for a fade
- `PageLoader` runs a 4-timer chain on every pathname *and* searchParams change — fires on every filter interaction on `/inventory`
- Two font families loaded across the app (Lato globally + 3 faces on `/`)

---

# PART 2 — PROPOSED DESIGN SYSTEM

*(Direction pending sign-off — see §2.1. Everything from §2.2 down holds under any of the three options.)*

## 2.1 Direction — LOCKED 2026-08-11

**Evolve the drawing office into a product language.**

The homepage's "Drawing Office" world is genuinely distinctive, derives from real company truth, is already anti-slop, and is 1,500 lines of finished work. It is also **a conceit** — and `DESIGN.md` itself warns that mono annotation "is for actual measurement, never a costume." A conceit that carries a homepage does not automatically carry a lead-desk CRM someone uses for eight hours a day.

So: keep the structural DNA, promote it, and drop the costume.

**Kept (the DNA):** flatness · sharp edges · hairline rules at fractional opacity · ground swaps instead of shadows for page depth · photography as bordered, captioned plates · facts rendered from sourced content, never hardcoded · no icon-per-label · one entrance primitive.

**Promoted (homepage conceit → product mechanism):**
| Homepage conceit | Becomes |
|---|---|
| Sheet numbering (SHT 00–07) | Real information architecture — section anchors, breadcrumbs, page hierarchy |
| Title blocks | `Section` primitive header: eyebrow + title + optional meta |
| Dimension lines | Reserved for genuinely measured claims only (years, counts, distances) |
| `FIG. NN` plate captions | `Figure` primitive caption — real captions, not decorative numbering |
| Fragment Mono annotation | **Retired from prose entirely.** Numerics move to Archivo `tabular-nums`. Mono survives only for true reference codes (stock IDs), or not at all |
| Register tables | The `Table` primitive, generalised |

**Added (what a product needs that a homepage does not):** dense table typography · full form state matrix · one focus system · exactly two elevation levels for overlays (a dropdown over a table cannot be flat) · semantic status colour · empty / loading / error states.

**Consequence:** `/` is not frozen. It is route P01 in Phase 5 and gets rebuilt against the shared tokens like everything else. `DESIGN.md`'s "do not harmonise inner pages" boundary is void.

## 2.2 Colour — 4 families, ~14 tokens, semantic layer on top

No purple. No neon. No blue/purple SaaS gradient. One accent, used sparingly.

```
Grounds     ground        #F4F3EE   page background
            ground-2      #EAE8E0   alternating band
            surface       #FFFFFF   data surfaces (cards, tables, modals)
            deep          #133A63   dark sheet (hero, admin rail, footer)
            deep-2        #0D2A4A   deepest ground

Ink         ink           #14161A   primary text on light
            ink-2         #565E6A   secondary text on light
            ink-3         #9AA1AB   tertiary / placeholder
            on-deep       #F4F3EE   primary text on dark
            on-deep-2     #A9BFDD   secondary text on dark

Line        line          ink @ 12%   hairline rules, table borders
            line-strong   ink @ 24%   input borders, focus-adjacent
            line-deep     #9FB6D6     rules on dark grounds

Accent      accent        #C13A2A   fills, CTAs, active state
            accent-text-light #A32E20  small text on light  (base fails AA)
            accent-text-dark  #F08A70  small text on dark   (base fails AA)
```

**Semantic layer** (derived, never Tailwind defaults): `success`, `warning`, `danger`, `info` — each with `-bg` / `-line` / `-text` tuned to the ground it sits on. Replaces the current ad-hoc `bg-blue-50 text-blue-700 border-blue-200` lead-status chips.

Every one of the 700+ raw hex literals resolves to one of these. Enforced by a grep gate in the Phase 13 pass.

**Theme:** the broken `.dark` block is removed. `next-themes` either goes, or gets a real dark theme built on the `deep` family — a decision for §2.1, but the current half-state does not survive either way.

## 2.3 Typography — LOCKED 2026-08-11

**Barlow Condensed (display) + Archivo (text) + Archivo `tabular-nums` (data). Fragment Mono retired.**

Non-negotiables honoured: no Arial, Roboto, Open Sans, Poppins, system-ui, Tailwind defaults; Inter not chosen by default. Lato is removed.

Rationale: both faces are already on the critical path for `/`, so app-wide adoption costs **zero additional font payload** — which matters directly for the stated audience (midrange Android, uneven networks). Barlow Condensed at display sizes reads as signage and plate lettering, which is the automotive register we want; Archivo is a genuine grotesque that holds up at 15 px on a cheap Android panel, which Lato at 300 weight does not.

Fragment Mono is dropped as a third face. It existed to annotate a drawing; in a product it becomes costume. Its one real job — aligned numerals in prices, odometer readings and table columns — is done better by `font-variant-numeric: tabular-nums` on Archivo, at no extra download.

Two faces + one numeric mode:

| Token | Size / line-height | Weight | Tracking | Case | Used for |
|---|---|---|---|---|---|
| `display` | clamp(2.75rem, 7vw, 5.5rem) / 0.95 | 700 | −0.02em | as-set | Hero, section openers |
| `h1` | clamp(2rem, 4vw, 3rem) / 1.05 | 700 | −0.015em | | Page titles |
| `h2` | 1.75rem / 1.15 | 600 | −0.01em | | Section heads |
| `h3` | 1.25rem / 1.25 | 600 | 0 | | Subsections, modal titles |
| `h4` | 1rem / 1.35 | 600 | 0 | | Card titles, table group heads |
| `body` | 0.9375rem / 1.6 | 400 | 0 | | Prose — floor is 15 px, never 8–10 px |
| `body-lg` | 1.0625rem / 1.6 | 400 | 0 | | Lead paragraphs |
| `small` | 0.8125rem / 1.5 | 400 | 0 | | Help text, captions |
| `caption` | 0.75rem / 1.4 | 500 | 0.01em | | Figure captions |
| `meta` | 0.6875rem / 1.3 | 600 | 0.10em | UPPER | Eyebrows, table headers, badges — **floor 11 px** |
| `num` | inherits | 500 | 0 | tabular-nums | Prices, odometer, counts, dates, all table numerics |
| `nav` | 0.875rem / 1 | 500 | 0.01em | | Navigation |
| `button` | 0.875rem / 1 | 600 | 0.02em | | All buttons |
| `label` | 0.8125rem / 1.3 | 600 | 0 | | Form labels |
| `table` | 0.875rem / 1.45 | 400 | 0 | | Table cells |
| `table-head` | = `meta` | | | | Table headers |

**Rules that fix measured problems:**
- Weight ladder is **400 / 500 / 600 / 700 only.** `font-black` and `font-extrabold` are removed (294 sites). 78% heavy → roughly 15%.
- **No text below 11 px anywhere.** Kills every `text-[8px]` / `text-[9px]` / `text-[10px]`.
- Tracking above `0.10em` is reserved for `meta`. No more `tracking-[0.3em]` / `[0.4em]` body text.
- `tabular-nums` on every price, odometer, count, and table numeric — no separate mono family needed.

## 2.4 Spacing, grid, radius, elevation

**Space** — 4 px base: `1=4 · 2=8 · 3=12 · 4=16 · 5=24 · 6=32 · 7=48 · 8=64 · 9=96 · 10=128`. Arbitrary values banned.

**Grid** — container `max-w-[1400px]`; gutters `20px` / `40px` ≥ md; 12-col ≥ lg, 6-col md, 4-col sm. Section rhythm `py-20` / `py-28` ≥ md. `scroll-mt-16` on every anchor. Admin content max `1280px`.

**Radius** — `0` default; `2px` on inputs/buttons/chips; `4px` on modals/drawers/popovers; `9999px` only for avatars, status dots, and the year stamp. **Kills all 15 current values including `rounded-[60px]`.**

**Elevation** — page content is flat, zero shadows. Exactly two levels exist, and only for things that float over content:
- `--shadow-overlay` — `0 24px 48px -12px rgb(20 22 26 / 0.18)` — modal, drawer
- `--shadow-raised` — `0 8px 16px -4px rgb(20 22 26 / 0.12)` — dropdown, popover, toast, sticky table header

189 shadows → 2 tokens. Depth on the page comes from ground swaps and hairlines, as it does on the homepage today.

**Focus** — one token, every interactive element: `outline: 2px solid var(--accent); outline-offset: 2px` on light; `var(--on-deep)` on dark. `:focus-visible` only.

## 2.5 Motion language

One easing, four durations, nine named behaviours. Transform / opacity / clip-path only.

```
--ease-out   cubic-bezier(0.16, 1, 0.30, 1)    entrances, expands, reveals
--ease-in    cubic-bezier(0.40, 0, 1, 1)       exits
--ease-move  cubic-bezier(0.65, 0, 0.35, 1)    position changes both ways

--dur-1   120ms   press, hover, colour
--dur-2   180ms   dropdown, tooltip, toast, chip
--dur-3   240ms   modal, drawer, tab, accordion
--dur-4   400ms   section reveal, page transition, line draw
```

| Behaviour | Spec |
|---|---|
| Enter | opacity 0→1 + translateY 8px→0, `dur-3` `ease-out` |
| Exit | opacity 1→0 + translateY 0→4px, `dur-2` `ease-in` |
| Hover | colour/border only, `dur-1`. **No lift, no scale.** (removes `hover:-translate-y-0.5` + `hover:shadow-md`) |
| Press | `scale(0.98)`, `dur-1` |
| Expand | height auto + opacity, `dur-3` `ease-out` |
| Collapse | reverse, `dur-2` `ease-in` |
| Reveal | `clip-path` inset wipe for plates; `scaleX` from origin for rules; `dur-4`; `viewport={{once:true}}` |
| Loading | single opacity shimmer 0.4↔0.7, 1.4 s. One spinner: rotate only |
| Success / Error | ground + border colour change, `dur-2`. **No confetti, no bouncing, no infinite loops** |

**`prefers-reduced-motion: reduce`** — global: transforms off, opacity-only, every loop stopped, `scroll-behavior: auto`. Enforced by a single `useReducedMotion()` read in the `Motion` primitive so no component can opt out by forgetting.

**Budget:** framer-motion only where a component genuinely needs orchestration or presence (modal, drawer, gallery, register swap). Hover, press, and colour changes are CSS transitions. Target: framer-motion imports down from ~25 files to under 10.

## 2.6 Component system — 26 primitives, `components/ui/*`

Built first, before any page. Nothing may hand-roll a variant of these afterwards.

**Form (8)** — `Button` · `Field` (label + required + help + error + `aria-describedby`, wired once so the M01/F04 labelling bug cannot recur) · `Input` · `Textarea` · `Select` · `Checkbox` · `Radio` · `Switch`

**Data (7)** — `Table` (+ `SortableHeader`, sticky header, row select, hover, mobile definition-list fallback — *not* cards) · `Pagination` · `Badge` / `StatusBadge` · `Stat` (admin KPI) · `Chip` / `FilterChip` · `RangeControl` · `DataGrid` shell

**Surface (5)** — `Card` · `Plate` (figure + caption, the media primitive) · `Panel` · `Section` · `Divider`

**Overlay (6)** — `Dialog` (focus trap, Escape, scroll lock, focus restore, `aria-modal`, `aria-labelledby` — one implementation serving M01/M05/M06) · `Drawer` (M02/M03) · `DropdownMenu` · `Tooltip` · `Toast` (rebuilt on the existing Radix root) · `Popover`

**Feedback (6)** — `Alert` · `EmptyState` · `Skeleton` (text/row/card/plate) · `Spinner` · `ProgressBar` (wired to real navigation state, replacing the fake `PageLoader`) · `ErrorState`

**Navigation (4)** — `SiteNav` · `SiteFooter` · `Breadcrumbs` · `Tabs`

**Media (2)** — `Figure` · `Gallery` + `Lightbox` (built once, for `/inventory/[slug]` — the only route with enough photography to need it)

**Not built:** DatePicker (no caller — admin follow-up uses a styled native `datetime-local`), Combobox (no caller), FileUploader (no caller), Carousel (`Gallery` covers it).

## 2.7 Icons

`lucide-react` removed from all 50 files and from `package.json`.

Replacement policy, in order of preference:
1. **Delete the icon.** Most current icons decorate a label that already says the word — "Phone 📞", "Search 🔍", "Settings ⚙". A premium interface does not need both.
2. **Type or CSS** — chevrons, arrows, dividers, the "×" close affordance.
3. **Custom inline SVG** — the `components/system/marks.tsx` glyph set already exists: 20×20 viewBox, 1.5 px stroke, square caps, sized `1.1em`. Extend it only where an icon carries meaning a word cannot: brand marks, WhatsApp, map pin, status indicator.

Target: from ~180 icon instances to under 25, all in one file.

## 2.8 Admin density — LOCKED 2026-08-11

**Same tokens, denser scale.** The admin area shares every colour, type, radius, motion and focus token with the public site. It differs only in density, via a scoped override on the admin shell:

| | Public | Admin |
|---|---|---|
| Section rhythm | `py-20` / `py-28` | `py-6` / `py-8` |
| Card padding | `space-5` (24px) | `space-4` (16px) |
| Table row height | 56px | 44px |
| Body size | `body` 15px | `table` 14px |
| Control height | 44px | 36px |
| Container | 1400px | 1280px |

Staff spend hours in the lead desk; a buyer spends minutes on a listing. The density scale is the only thing that forks — a staff member and a buyer are looking at recognisably the same product. Touch targets stay ≥44px on any admin view below `md`, since the lead desk is used on phones.

---

# PART 3 — EXECUTION PLAN

Each phase ends with `npm run validate` (`tsc --noEmit` + `eslint`) passing. No phase starts before the previous one is green.

| Phase | Scope | Exit criteria |
|---|---|---|
| **1 — Audit** ✅ | This document | Complete |
| **2 — Design system** ✅ | Done 2026-08-11 — see §3.3 | Complete: build green, 95 pages |
| **2 — Design system** | `app/globals.css` rewritten to the token set; `DESIGN.md` rewritten as the app-wide contract; fonts wired at `:root` (removing the `@theme inline` trap, dropping Lato and Fragment Mono); dead-code removal (16 files, ~2,543 lines) | Tokens defined and resolvable app-wide; build green. **Typography changes app-wide in this phase** — inner pages get Archivo/Barlow while still carrying incumbent navy/red colour. That transitional state is expected and resolves in Phases 5–7. `.impeccable/design.json` is regenerated at the end of Phase 4, once the primitives it documents actually exist |
| **3 — Shell** | `app/layout.tsx`, `SiteNav`, `SiteFooter`, `Breadcrumbs`, `MobileActionBar`, admin shell + rail; wire the finished-but-orphaned `components/system/site-nav.tsx`; 15 `loading.tsx` + 3 `error.tsx` + `global-error.tsx`; retire fake `PageLoader` | One shell, every route. Nav/footer/breadcrumbs identical on all 26 routes |
| **4 — Primitives** | All 26 components in §2.6. Built in isolation against the tokens | Every primitive has enter/exit/hover/press/focus/disabled/loading/error/empty defined |
| **5 — Public pages** | P01–P08, P13, P15, P16, P17 (11 routes) | Zero page-local styling; all composition from primitives |
| **6 — Inventory & data pages** | P09–P12, P14 (5 routes) — listing, filters, detail, brand, SEO landing, location + stock rail | Filters, facets, degraded state, SEO metadata all intact |
| **7 — Admin** | A01–A09 (9 routes) — dashboard KPIs, 5 tables, lead detail, settings | Same tokens as public, denser scale. `requireAdmin()` verified on every action |
| **8 — Overlays & forms** | M01–M09, F01–F07. `Dialog` replaces `confirm()`. Enquiry modal rebuilt against a preserved `submitLead`/`useActionState`/honeypot contract | Focus trap, Escape, scroll lock, focus restore, labelled fields on every overlay; every GTM event still fires |
| **9 — Motion** | Apply §2.5 across every route. Audit with **design-motion-principles**; fix what it flags | One easing, four durations, nine behaviours. Reduced-motion honoured globally |
| **10 — Responsive** | 375 / 768 / 1024 / 1440 on every route, overlay, table, form via **Playwright** | No horizontal scroll; every table and overlay usable at 375 px |
| **11 — Accessibility** | Keyboard path, focus order, contrast, semantics, screen-reader labels across all 26 routes | Zero blocking findings from §1.9 remain |
| **12 — Performance** | **fixing-motion-performance** pass; image regime (`sizes`, AVIF/WebP, priority); resolve the `public/media` ↔ Supabase duplication; framer-motion budget; 649 KB PNG | No layout thrash, compositor-only animation, image payload down |
| **13 — Impeccable audit** | **impeccable** across the whole application. Fix, don't report | Findings resolved, not logged |
| **14 — Consistency** | Grep gates: 0 raw brand hex, 0 `lucide-react`, 0 `font-black`, ≤4 radius values, ≤2 shadow tokens, 0 text < 11 px, 0 unguarded loops | Gates pass; `DESIGN.md` matches shipped reality |

**Skill assignment** — deliberate, not blanket:
- **taste** → Phase 2 only, to interrogate hierarchy/composition/image-treatment rationale. Not to copy a site.
- **impeccable** → Phases 4, 5, 6, 7 (running QC at each phase boundary) and Phase 13 (full sweep). Not a single end-of-project run.
- **design-motion-principles** → Phase 9, and consulted during Phase 4 for the overlay primitives.
- **fixing-motion-performance** → Phase 12, focused on `/inventory` (large lists + filters), `/inventory/[slug]` (gallery), and the admin tables.
- **Playwright** → Phases 10 and 11, and for before/after capture at each phase boundary.

## 3.1 Route tracking board

Legend: `☐ Not started` · `◐ In progress` · `◑ Redesigned` · `◒ Audited` · `☑ Complete`

| ID | Route / Surface | Phase | Status |
|---|---|---|---|
| SH1 | Root layout + shell | 3 | ☐ |
| SH2 | SiteNav | 3 | ☐ |
| SH3 | SiteFooter | 3 | ☐ |
| SH4 | Breadcrumbs | 3 | ☐ |
| SH5 | MobileActionBar | 3 | ☐ |
| SH6 | Admin shell + rail | 3 | ☐ |
| SH7 | loading / error / global-error | 3 | ☐ |
| C01–C26 | 26 primitives (§2.6) | 4 | ☐ |
| P01 | `/` | 5 | ☐ |
| P02 | `/about` | 5 | ☐ |
| P03 | `/automobile` | 5 | ☐ |
| P04 | `/hp-indian-oil` | 5 | ☐ |
| P05 | `/real-estate` | 5 | ☐ |
| P06 | `/s-mega-mart` | 5 | ☐ |
| P07 | `/blog` | 5 | ☐ |
| P08 | `/contact` | 5 | ☐ |
| P13 | `/locations` | 5 | ☐ |
| P15 | `/privacy-policy` | 5 | ☐ |
| P16 | `/terms` | 5 | ☐ |
| P17 | `/not-found` | 5 | ☐ |
| P09 | `/inventory` | 6 | ☐ |
| P10 | `/inventory/[slug]` | 6 | ☐ |
| P11 | `/brands/[slug]` | 6 | ☐ |
| P12 | `/used-cars/[slug]` | 6 | ☐ |
| P14 | `/locations/[slug]` | 6 | ☐ |
| A01–A09 | 9 admin routes | 7 | ☐ |
| M01–M09 | 9 overlays | 8 | ☐ |
| F01–F07 | 7 live forms | 8 | ☐ |
| T01–T07 | 7 tables | 6/7 | ☐ |

**Totals: 7 shell surfaces · 26 primitives · 26 routes · 9 overlays · 7 forms · 7 tables = 82 tracked surfaces.**

## 3.3 Phase 2 — completed 2026-08-11

**Dead code removed — 15 files, 2,308 lines**
`app/home-client.tsx` · `components/sections/{hero,overview,service,finance,services-new,why-us,customer-dealership,searched-electric-cars,brands,google-reviews,logo-carousel,parallax-banner,showcase-carousel,team-mosaic}.tsx`
`components/sections/brands.tsx` was a late catch — the first reference sweep was confounded by `components/home/brands.tsx` sharing a basename. `components/sections/` now holds 4 live files.
`components/system/site-nav.tsx` and `site-footer.tsx` were **kept** — they are a finished app-wide shell that Phase 3 wires.

**`app/globals.css` rewritten** — 191 lines of template residue → the token set in §2.2–2.5. Removed: the internally-inconsistent `.dark` block, `@utility glass`, `@utility glass-dark`, `.gold-gradient`, `.dark-gradient` (all four at zero call sites). Added: global `:focus-visible`, global `prefers-reduced-motion`, automatic `tabular-nums` on `th`/`td`/`time`/`[data-num]`, default border colour so a bare `border` never paints Tailwind grey.

**Fonts moved to `:root`** — `siteFontVariables` now sits on `<html>` in `app/layout.tsx`, so plain `@theme` resolves them. **The `@theme inline` trap documented in the old `DESIGN.md` is structurally gone**, not worked around. Lato and Fragment Mono removed; the app now loads two families instead of four faces across two systems.

**`next-themes` removed** — nothing called `useTheme`; the provider's only effect was stamping `class="dark"` on `<html>` for a theme whose background was light and whose cards were dark. `components/theme-provider.tsx` deleted. `themeColor` updated `#023468` → `#133a63`.

**Migration aliases** — the shadcn semantic names (`primary`, `muted`, `destructive`, …) and the homepage world names (`paper`, `print`, `redline`, …) are mapped onto the new tokens rather than deleted, so all 26 routes keep rendering while they wait for their phase. Both alias blocks are marked for deletion in Phase 14.

**`DESIGN.md` rewritten** as the app-wide contract. The "do not harmonise inner pages" boundary is void.

**Verification:** `tsc --noEmit` exit 0 · `eslint app components` **0 errors** · `npm run build` green, **95 static pages**. The 11 remaining lint errors are all in the untracked root helper scripts (`upload_to_supabase.js`, `upload_kia_showroom.js`, `find_all_images.js`, `inspect_supabase.js`) and pre-date this work.

**Confirmed SSG counts from the build** (§1.2 estimates now exact): `/brands/[slug]` **4** · `/inventory/[slug]` **27** · `/locations/[slug]` **2** · `/used-cars/[slug]` **35**.

**Known transitional state:** inner pages now render in Archivo/Barlow while still carrying incumbent navy/red colour and lucide icons. Expected — resolves in Phases 5–7.

## 3.4 Phase 3 — in progress

### Done

**Nav and footer replaced.** `components/layout/navbar.tsx` (413 lines) and `footer.tsx` (131) deleted; `components/system/site-nav.tsx` and `site-footer.tsx` migrated to the new tokens and wired through the existing `ConditionalNavbar` / `ConditionalFooter`. The `#D4AF37` gold and `#06101E` near-black are gone from the shell.

**`--color-gold` deleted from the token set**, not aliased. It was the incumbent template's accent and has no equivalent here. Zero call sites remained.

**The logo is restored and is the governing constraint.** The AM Group mark is **white artwork on a transparent ground** — verified by sampling the rendered pixels: 5,634 opaque pixels, **100% white**. Consequences:
- The mark is never filtered, recoloured, or replaced with a text wordmark. My first pass at the shell substituted a Barlow Condensed "AM Group" wordmark — wrong, and corrected.
- **The header is a dark object in every state.** Not a style preference: a white mark is invisible on `ground` (#F4F3EE). Keeping the header on `ink` means shipping the logo once, unfiltered, as supplied. Over the homepage's dark hero it starts transparent and fills to `ink` on scroll; everywhere else it is `ink` from the top.
- The old `onGround` light/dark branching collapsed into one tone system, which is a real simplification.

**Logo self-hosted.** It was hot-linked from `amgroupind.com/wp-content/uploads/2023/06/logo-1.png` in 4 places — the WordPress host this app replaces. The asset is **byte-identical to `public/icon.png` already in the repo** (md5 `fd06361f…`), so it was copied to `public/logo-am-group.png` and all 4 call sites repointed: SiteNav, SiteFooter, `app/admin/layout.tsx`, `components/modals/unlock-price-popup.tsx`. Same logo, same bytes; the site no longer breaks when WordPress is retired.

**`mobile-action-bar.tsx` migrated** — tokens, `marks.tsx` glyphs instead of 3 lucide icons, 10px `font-black` labels → `text-meta`, `backdrop-blur` + arbitrary shadow removed.

**Three real bugs fixed in the previously-unwired `site-nav.tsx`:**
1. The mobile sheet stayed mounted at `opacity-0 pointer-events-none` — still in the tab order, so keyboard users tabbed into an invisible menu. Now conditionally rendered.
2. No Escape handler. Now closes innermost layer first (submenu → sheet), restoring focus to the toggle.
3. Sub-11px type (`text-[9px]`, `text-[10px]`) throughout → `text-meta` (11px floor).

Also: hamburger label "Index" → "Menu"/"Close"; `shadow-[0_12px_32px_...]` → `shadow-overlay`; the fixed header now renders its own 64px spacer so no page has to pad for it.

**Copy fix:** `components/home/locations.tsx` was rendering "Supabase Storage • Real Facility Media (N Photos)" to visitors. The storage backend is not something a car buyer has any use for; now "N photos of this site".

**Verification:** `tsc --noEmit` exit 0 · `npm run build` green, 95 pages · DOM check on `/about`: 2 logos, `filter: none`, header and footer both `rgb(20,22,26)`, zero `#D4AF37` in computed styles anywhere on the page.

### Data loss — disclosed

`components/layout/navbar.tsx` and `footer.tsx` had **uncommitted working-tree modifications** when I deleted them. Those edits are unrecoverable (never staged, so not in git's object store). Both files were being replaced wholesale by `SiteNav`/`SiteFooter`, so nothing is missing from the result — but if either contained work not reflected in `site-nav.tsx`/`site-footer.tsx`, it is gone and needs redoing. **Committing before Phase 4 is strongly advised.**

### Remaining in Phase 3
- Admin shell + rail (`app/admin/layout.tsx`) — still incumbent navy, still 11 lucide icons
- `ConditionalBreadcrumbs` / `components/ui/breadcrumbs.tsx`
- 15 `loading.tsx` + 3 `error.tsx` + `global-error.tsx`
- Retire the fake `PageLoader`

### Known findings deliberately left for their phase
The impeccable hook flags sub-11px type and off-ramp sizes in `components/modals/unlock-price-popup.tsx` (16 findings, 8–10px) and `components/home/locations.tsx` (4 findings). Both are real. Neither is suppressed. They are fixed when those files are rebuilt — M01 in Phase 8, P01 in Phase 5 — because piecemeal patching of files scheduled for full rewrite produces churn without producing a system.

## 3.5 Audit remediation sweep — completed 2026-08-11

All 8 audit actions run at once, fanned out **by file** (14 agents) rather than by command, since most commands landed on the same files. 3 adversarial verifiers then checked the diff against HEAD. 17 agents, 0 errors.

### Measured before → after

| Signal | Before | After | Note |
|---|---|---|---|
| Detector findings | 187 | **33** | 32 of the 33 are in the deliberately-excluded homepage files; **1** in swept scope |
| Text below 11px | 150 | **20** | all 20 in excluded homepage files |
| Files importing lucide | 36 | **0** | the 1 grep hit is a comment in `marks.tsx` |
| Raw hex literals | 592 | **23** | `themeColor` meta value, a design-contract comment, and SVG `stroke`/`fill` in excluded homepage files |
| `font-black` / `font-extrabold` | 227 | **0** | |
| `backdrop-blur` | 27 | **0** | |
| Shadow declarations | 116 | **7** | only `shadow-raised` / `shadow-overlay` |
| Decorative blur blobs | 9 | **0** | |
| `role="dialog"` | 0 | **4** | |
| `window.confirm()` | 1 | **0** | 3 grep hits are comments about its removal |
| Labelled scroll regions | 4 | **10** | |

`tsc --noEmit` 0 errors · `npm run build` green, 95 pages · `eslint app components` 0 errors, 9 warnings (all pre-existing at HEAD).

### Two regressions found by the verifiers — both in my own shell work, both fixed

1. **`site-nav.tsx` had dropped the header's enquiry CTA.** The deleted navbar opened the enquiry modal from two places with `{ intent: "Test Drive", sourceLabel: "navbar" }`. My replacement had no lead-capture button at all — a conversion-path regression, not a style one. Restored on desktop and in the mobile sheet with the **original intent and sourceLabel**, so the GTM funnel and admin lead-source attribution stay continuous.
2. **`site-footer.tsx` had truncated the SEO link directory.** The old footer rendered all 8 groups via `SeoLinkDirectory`; mine hardcoded 5 columns and sliced them, dropping "by Fuel", "by Transmission" and "by Year" entirely. Those resolve to real statically-generated landing pages (`/used-cars/diesel-cars-in-jammu` etc.), and the footer was their only sitewide inbound link — orphaned on every route except `/inventory`. Now maps `seoLinks.groups` in full. Verified live: **9 columns, 65 links**.

### Notable agent decisions worth review
- **`inventory-filters.tsx` colour swatches deleted** — the `SWATCHES` table guessed a hex from a marketing colour name via regex (`/imperial|starry/` → blue). Off-token and speculative, so the Colour section is now plain chips. Reversible if you want swatches back with real values.
- **`page-loader.tsx` deleted, not restyled.** Next 16's `useLinkStatus` reads context from an enclosing `<Link>`, so it cannot be observed from the root layout; there was no honest navigation signal available. Route-level `loading.tsx` is the correct home for that feedback (Phase 3).

## 3.6 Hero rebuild + fixes — 2026-08-11

**Blurry hero: root-caused.** `hero-showroom.jpg` is **1376×768** — a 16:9 landscape photo that the old split layout forced into a full-height portrait column, so `object-cover` upscaled ~1.4× on width and ~2.8× on a 2× display. Not compression; aspect mismatch.

**Every image in `am_group_files` is landscape or square** — probed all 23. There is no portrait asset, so a full-height photo column was never compatible with the library. Widest sources are 1600px; several are only 600×600 or 547×547.

Rebuilt the hero as **drawn field → heritage spine → full-width landscape plate**. Measured live: upscale factor **0.99 × 0.89 (downscaling = sharp)**, versus ~1.4/2.8 before. Also fixed `next.config.ts` — `images.qualities` was unset, so Next 16 silently ignored `quality={90}` and served 75.

**Resolution ceiling remains.** At a 1920px viewport on a 2× display a full-bleed band needs ~3840px and the largest source is 1600px. On the stated primary audience (midrange Android, ~400px CSS at 2–3×) the 1376px source *downscales* and is genuinely sharp. Higher-resolution photography is a client asset request, not a code fix.

Hero also now: renders the previously-dead `stockCount` prop as live evidence under TODAY; leads with **Our story / Our businesses / Showrooms** instead of "Explore Inventory"; states 1968 → TODAY → NEXT literally as the spine; and uses `FOUNDED` everywhere instead of three independent hardcoded "1968" strings.

**Duplicate breadcrumbs fixed.** `OWN_BREADCRUMBS` listed only `/inventory`, `/brands`, `/used-cars`, but `/locations`, `/locations/[slug]`, `/privacy-policy` and `/terms` had grown their own — so four routes shipped two visible trails *and* two `BreadcrumbList` schemas. Verified live on `/locations`: 1 nav, 1 schema.

## 3.7 Open items requiring client input

| Item | Detail |
|---|---|
| **Placeholder phone number** | `lib/locations.ts` carries `+91 94191 00000` / `+919419100000` for both branches. Wired into every `tel:` and `wa.me` CTA sitewide. Every phone and WhatsApp lead currently goes nowhere. |
| **Unverified geo coordinates** | Both locations have `geo.verified: false`. Wrong pins contradict the Google Business Profile. |
| **32 WordPress hot-links** | Images across `/about`, `/blog`, `/hp-indian-oil`, `/real-estate`, `/s-mega-mart` still load from `amgroupind.com/wp-content/`. When that host is decommissioned, five pages lose their imagery. The bucket has 23 assets; not all 32 have an equivalent. |
| **Hero photography resolution** | Largest asset is 1600px wide. A retina desktop hero wants ~3840px. |
| **No video, no people photography** | Rules out "cinematic video" and an "Our People" section built from real assets. |
| **"26 outlets" / "8 franchises"** | Live in `content.ts` from the company's published pages. No database source exists in this repo. |

## 3.8 Media library + gallery — 2026-08-11

**There are TWO Supabase projects.** The client-supplied Kia image lives in `ehcmjypfxucvcvuofozx`, not the `nhceknbaslqdqofefyla` project this repo was configured for. Both are live and both host a bucket named `am_group_files`, with different folder structures (`kia/service/…` vs `branches/jammu-kia/…`). They are now kept deliberately separate: lead data in the original project, photography in `MEDIA_SUPABASE_URL`, so the media library is never reachable with the service-role key that can read `leads`.

**Objects are public but the bucket cannot be listed without a key.** Supabase requires auth for `list` even on public buckets — verified: unauthenticated returns 400, the other project's key returns 403. So `lib/media/storage.ts` degrades to a curated manifest and the page says so, rather than presenting one photo as the whole library. Setting `MEDIA_SUPABASE_ANON_KEY` turns on full enumeration with no code change.

### Compression — measured, not assumed

Source: `kia/service/untitled-09028.jpg`, **4229×2506, 6,036,176 bytes (5.76 MB)**.

| Variant | Bytes | Reduction |
|---|---|---|
| Original JPEG | 6,036,176 | — |
| w=640 (phone) | 22,432 | **99.6%** (269×) |
| w=1080 | 53,157 | 99.1% |
| w=1920 (desktop) | 145,802 | 97.6% |
| w=3840 (retina) | 367,029 | 93.9% |

All AVIF. Live gallery tile transfers **10.1 KB**; hero transfers **82.9 KB**.

Config changes that made this work:
- `formats: ["image/avif", "image/webp"]` — default was WebP only, leaving roughly a third of the saving unclaimed.
- `minimumCacheTTL: 2592000` — the 60s default made the server re-fetch and re-encode multi-megabyte originals constantly.
- `qualities: [75, 90]` — added earlier; without it Next 16 silently ignores any non-default `quality`.
- Every image goes through `next/image` with a real `sizes` value. Without `sizes` the optimiser assumes `100vw` and serves a full-width variant into a 400px tile, which gives most of the waste back.

`remotePatterns` already contained `*.supabase.co`, so the new project needed no allowlist change.

### Resolution ceiling — now resolved

§3.6 flagged that no asset exceeded 1600px, so a retina desktop hero (needing ~3840px) had to upscale. The new image is **4229px wide**, which clears it. Measured hero upscale factor: **0.22** (heavy downscale). The hero now points at `AM_KIA_SHOWROOM` in `lib/supabase-media.ts`.

### Built
- `lib/media/storage.ts` — media resolver, recursive listing, folder facets, alt text derived from path (filenames are camera exports like `untitled-09028.jpg`, meaningless to a screen reader; `kia/service/…` becomes "AM Kia — service").
- `components/ui/gallery.tsx` — `Gallery` grid + fullscreen `Viewer` with focus trap, Escape, scroll lock, focus restoration, `aria-modal`, and arrow-key paging.
- `app/gallery/page.tsx` — `/gallery`, ISR at 1 hour.
- `.env.example` — documents `MEDIA_SUPABASE_URL` / `MEDIA_SUPABASE_ANON_KEY`.

Build green at **96 pages** · `tsc` 0 errors · `eslint` 0 errors.

## 3.9 Mobile horizontal overflow — fixed 2026-08-11

**Symptom:** a pale strip down the right edge on phones. That strip was the `body`'s `ground` colour showing where the document was wider than the viewport — the page had horizontal scroll, and every `position: fixed` element (header, mobile action bar, toast viewport) stretched to the widened document rather than the viewport.

**Root cause, same bug in two places: `truncate` inside a grid item.**

`truncate` sets `white-space: nowrap`. A grid item defaults to `min-width: auto`, so an `auto` track cannot size below the item's min-content — and the min-content of un-wrappable text is the entire string. Measured on `/`: a caption's min-content was **425px inside a 335px column**, inflating the grid track to 481.578px and the document to 502px against a 375px viewport.

Notably, **adding `min-w-0` did not fix it.** `min-width: 0` lets a *flex item* shrink during flex layout; it does not change an element's min-content contribution when an ancestor *grid track* is sized. That distinction is why the first attempt failed and is recorded in the code comments.

| Location | Fix |
|---|---|
| `components/system/marks.tsx` — `PlateCaption` (used by hero, timeline, divisions, brands, closing) | caption wraps instead of truncating; `shrink-0` on the FIG number |
| `components/home/provenance.tsx` — awards register | award title wraps instead of truncating |

Wrapping is also the better outcome: `"HP & Indian Oil forec…"` and `"Best Seller of the…"` tell a phone reader nothing.

**Verified empirically, not by inspection.** Every route loaded in a same-origin iframe at each width, comparing `documentElement.scrollWidth` to `clientWidth`, with a bisect to name the offending element on any failure.

- Widths: **320 · 360 · 375 · 414 · 768**
- Routes: `/`, `/about`, `/automobile`, `/hp-indian-oil`, `/real-estate`, `/s-mega-mart`, `/blog`, `/contact`, `/inventory`, `/inventory/[slug]`, `/locations`, `/locations/jammu`, `/locations/srinagar`, `/brands/kia`, `/used-cars/jammu`, `/gallery`, `/privacy-policy`, `/terms`, 404, `/admin/login`
- Result: **0 overflow on every combination.**

320px was worth testing separately — it caught the provenance case that 375px did not.

### Admin shell made responsive (found during the same pass)

`app/admin/layout.tsx` applied `ml-64` at every width against a fixed 256px rail, so on a 375px phone the content column was ~119px. Not an overflow, but unusable.

The rail is now an off-canvas drawer below `md` and a column from `md` up. This required splitting one boolean into two — `isRailCollapsed` (desktop width) and `isDrawerOpen` (mobile drawer) — because a single `isSidebarOpen` defaulting to `true` left the drawer open on every phone page load. Added: a backdrop, a header toggle visible only below `md`, drawer-closing on nav tap, and `md:ml-*` so the main column takes no margin on mobile.

Admin pages behind auth were not viewport-tested (I did not sign in). `/admin/login` passes.

## 3.10 Footer stock directory scoped to listing + product routes — 2026-08-11

The footer carried "Browse the group — every entry backed by live stock" and all eight stock-derived link groups on **every** page. That claim only makes sense where the visitor is shopping; under a company story it is a wall of long-tail car links.

Split the footer's two jobs:

| Block | Where it renders |
|---|---|
| **Site index** ("The group" — About, the four divisions, Locations, News, Contact) | every page |
| **Stock directory** + its "backed by live stock" heading (by Brand / Model / Budget / City / Body Type / Fuel / Transmission / Year) | `/inventory`, `/inventory/[slug]`, `/brands/[slug]`, `/used-cars/[slug]` only |

**Correction to §3.5.** The routes-and-SEO verifier reported that the full directory "still renders on /inventory and /inventory/[slug] via SeoLinkDirectory". That was wrong: `SeoLinkDirectory` was **imported but never rendered** in either file — a dead import alongside an unused `seoGroups` prop. The footer is the only place the directory has ever rendered, so scoping it created no duplication. Dead imports removed.

The set stays wide enough to protect the SEO graph: the fuel / transmission / year landing pages are reachable only from this directory, and it still renders on **67 pages** — `/inventory` + 27 vehicle pages + 4 brand pages + 35 `/used-cars` landings — which is exactly where a crawler following stock intent goes.

Verified live at 1280px:

| Route | Directory | Footer nav columns | Footer links |
|---|---|---|---|
| `/`, `/about`, `/contact`, `/locations`, `/blog` | no | 1 | 16 |
| `/inventory`, `/inventory/[slug]`, `/brands/kia`, `/used-cars/jammu` | yes | 9 | 65 |

Mobile overflow re-checked at 320 and 375 across the affected routes after the change: 0 failures.

`seoGroups` remains passed-but-unused on the inventory page components. Left alone — removing it crosses the server/client prop boundary and belongs with the Phase 6 inventory work.

## 3.2 Risks

| Risk | Mitigation |
|---|---|
| Enquiry modal rewrite breaks lead capture — the app's entire revenue path | Rebuild presentation around the existing `useActionState` reducer without touching it. Verify all 4 GTM events + honeypot + duplicate path before Phase 8 closes |
| `LinkTracker` silently dies when markup is rewritten | `data-track-location` added to the Phase 14 grep gate |
| Removing lucide from 50 files causes churn | Phase 4 lands the glyph set first; icons are deleted in the same commit as each page's redesign, never separately |
| Homepage regression | `/` is P01 in Phase 5 — it moves with everything else, not before it |
| SSG param drift | `generateStaticParams` files are read-only in Phases 5–7; presentation changes only |
| Font swap regresses LCP | Subset + `display:swap` + preload one face; measured in Phase 12 |
| `public/media` ↔ Supabase de-duplication breaks an image | Every reference traced before deletion; Supabase is canonical |

---

*Phases 2–14 begin on direction sign-off (§2.1) and typography selection (§2.3).*
