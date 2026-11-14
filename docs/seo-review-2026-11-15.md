# Review findings and builder hand-offs, 2026-11-15


# PART 1 - reviewer findings (all confirmed against the running site)


## R1 [high] app/inventory/[slug]/vehicle-client.tsx:485
PROBLEM: Unbacked inspection/verification claims on all 23 car pages. Every /inventory/<slug> page (e.g. http://localhost:3001/inventory/kia-carens-2024-4351, a car with no price and no photos) shows a 'Why buy from us' list: 'Verified documentation & history' and 'Multi-point inspection before sale'. Nothing in the repository (lib/locations.ts, lib/cars/*) records an inspection programme or a history check; the owner question 'what does Certified mean, who inspects, against what checklist' is still open. (Verified on :3001; :3311 is dead.)
FIX: Remove lines 485-486 (keep 'Finance & exchange assistance', which matches USED_CAR_SERVICES), or drop the block until the owner answers the inspection question.

## R2 [high] lib/seo/content.ts:279
PROBLEM: Generated copy states checks that no data backs, and it is also emitted in FAQPage JSON-LD. Confirmed in rendered HTML: (a) line 279 'Documentation has been checked and the vehicle is ready for transfer.' on every car page incl. /inventory/kia-carens-2024-4351; (b) line 202 '<km>, as recorded at intake.' in each car's visible FAQ and FAQPage JSON-LD; (c) line 76 'Before a car reaches this page it is checked, its paperwork is verified, and its service history is looked at' on /inventory; (d) line 151 'Cars listed as Certified Used have been inspected and their documents verified before being put on sale' on /inventory (visible + FAQPage); (e) line 59 'the kilometres shown are the reading recorded when it came in'; (f) lines 91/164/237 'finance through nationalised and private banks' (lib/locations.ts only says 'Car finance assistance'; lenders are an open owner question).
FIX: Delete sentences (a), (c), (d); change (b) to '<km> on the odometer. You are welcome to inspect the odometer and the service book in person.'; change (e) to 'the kilometres shown are the odometer reading'; change (f) to 'We can help arrange finance' with no lender description. Reinstate only after the owner confirms the process.

## R3 [high] lib/seo/landing.ts:825
PROBLEM: 'Each car is checked and its documents verified before it is listed.' renders under 'Inspection and paperwork' on 8 indexed landings (e.g. /used-cars/suv-in-jammu, /used-cars/petrol-cars-in-jammu, /used-cars/automatic-cars-in-jammu). Same unbacked claim; also line 748 '...shown were recorded when it came in' on model landings, and lines 150/656/826 'nationalised and private banks'. app/brands/[slug]/page.tsx lines 224, 182 and 280 repeat the 'recorded when it came in' and 'nationalised and private banks' wording on /brands/kia etc.
FIX: Drop the first sentence at 825 (keep the RC/insurance transfer sentence, which matches lib/locations.ts services), reword 748 and brands page 224 to 'odometer reading shown on each listing', and replace the bank wording with 'can help arrange finance'.

## R4 [medium] app/llms.txt/route.ts:85
PROBLEM: Both AI-facing files assert 'the kilometres shown are the reading recorded when it came in' (http://localhost:3001/llms.txt paragraph 2; app/llms-full.txt/route.ts line 125 under 'Buying a car'). No intake record exists in the data (lib/cars has only a mileage number); whether readings are recorded at intake is an open owner question. These files were created in this pass, so the claim is new.
FIX: Say 'the kilometres shown are the odometer reading entered for that car' in both files (llms.txt/route.ts:85 and llms-full.txt/route.ts:125).

## R5 [medium] components/homepage/answers.tsx:
PROBLEM: New homepage FAQ (visible and in FAQPage JSON-LD on http://localhost:3001/) makes promises with no backing data: 'Bank finance, motor insurance and the RC transfer are arranged at the dealership. You are free to arrange your own finance elsewhere; it makes no difference to the price we quote.' (a price guarantee) and 'Call ... if the one you want is not listed and we will tell you when one comes in' (a notify promise; owner question 8 is open). lib/locations.ts lists 'RC & insurance transfer', not arranging motor insurance. components/homepage/why.tsx:41 repeats 'motor insurance ... arranged at the dealership' and why.tsx:33 adds 'The business will still be here when the car needs something.'
FIX: Cut 'it makes no difference to the price we quote' and 'we will tell you when one comes in'; say 'finance help and the RC and insurance transfer are handled at the dealership' (the wording lib/locations.ts supports); remove the 'will still be here' sentence in why.tsx:33.

## R6 [medium] lib/seo-schemas.ts:168
PROBLEM: The dealer node on every page (see first JSON-LD block of http://localhost:3001/) has contactPoint.areaServed 'IN' and availableLanguage ['en','hi']. Neither is in lib/locations.ts or any other data source; 'IN' (all of India) contradicts the node's own areaServed City 'Jammu' two lines above and the Jammu-only brief. Same values repeated at line 178 for the conditional second contact point.
FIX: Delete areaServed and availableLanguage from both ContactPoint objects (lines 168-169 and 178 onward), or set areaServed to the same City node and drop the languages until the owner states them.

## R7 [medium] app/inventory/[slug]/car-facts.ts:304
PROBLEM: A car with no price is still typed ['Product','Car'] but gets no offers (line 329), review or aggregateRating. http://localhost:3001/inventory/kia-carens-2024-4351 emits Product 'sku 4351' with no offers and no image; Google's Product rules require one of offers/review/aggregateRating, so this node is reported as an invalid Product item.
FIX: When v.price is null set '@type': 'Car' only (keep Product+Car when an offer exists).

## R8 [medium] app/inventory/[slug]/car-facts.ts:189
PROBLEM: Meta description says 'See the photos and ask AM Group for the best price' on cars that have no photos and on a car with no price. http://localhost:3001/inventory/kia-carens-2024-4351 -> 'Used 2024 Kia Carens for sale in Jammu: 10,356 km, Diesel, Automatic. Call for price. See the photos and ask AM Group for the best price...' while the page says 'Photos of this car are being added' / 'Photos 0'. Same on /inventory/kia-seltos-2024-4358 and /inventory/kia-syros-2025-4337. Also the description on /inventory/maruti-suzuki-vitara-brezza-2016-5925 is 179 characters.
FIX: Emit 'See the photos' only when v.images.length > 0; replace the sentence with 'Ask AM Group about this car, or call <phone>.' otherwise; trim to about 155 characters by dropping the last sentence when over.

## R9 [medium] app/inventory/[slug]/car-facts.ts:
PROBLEM: H1 and JSON-LD name are identical across different car URLs: '2024 Kia Carens' on 5 pages (/inventory/kia-carens-2024-5676, -5173, -4435, -4353, -4351), '2024 Kia Seltos' on 4 (-5633, -5579, -4358, -4356), '2025 Kia Syros' on 2 (-5724, -4337). The titles were told apart by kilometres only for exact title collisions; H1, ItemPage.name, Car.name, the last breadcrumb and the llms.txt link text were not, so 11 pages share three headings.
FIX: Until variants are entered, add the same distinguishing fact used by carTitle (fuel/transmission, then kilometres) to the H1/name when another car in stock has the same year+title, e.g. '2024 Kia Carens Petrol Automatic, 2,603 km'.

## R10 [medium] app/contact/contact-page.tsx:84
PROBLEM: A reply-time promise is published four times on http://localhost:3001/contact although the file's own comment (line 36) says it is unconfirmed: line 84 'answered within one working day', line 100 stat 'Reply target 1 working day', line 315 'We answer within one working day', and app/contact/contact-form.tsx:123 'will call you back within one working day'. No data in the repository backs it (entity-local owner question 11).
FIX: Remove the stat at line 100 and reword 84/315 and contact-form.tsx:123 to 'the form goes to the same desk' / 'our team will call you back' with no time, until the owner confirms.

## R11 [low] lib/seo/content.ts:252
PROBLEM: Ungrammatical generated sentence when the stored condition is 'Used Cars': http://localhost:3001/inventory/maruti-suzuki-vitara-brezza-2016-5925 reads 'is available now from AM Group in Jammu and is listed as used cars, having covered 1,29,002 km'. For the other 22 cars the same line asserts 'listed as certified used', repeating the undefined certification as prose.
FIX: Drop the 'and is listed as <condition>' clause entirely (the condition is already shown in the Condition row).

## R12 [low] app/brands/[slug]/page.tsx:219
PROBLEM: Plural wording with a single year: http://localhost:3001/brands/maruti-suzuki reads 'AM Group has 1 used Maruti Suzuki car for sale in Jammu right now, priced ₹4,80,000, with model years 2016.' and its FAQ answer 'Model years in stock right now: 2016.'
FIX: When yearLow === yearHigh write ', model year 2016' (lib/seo/landing.ts:587 already does this) and 'Model year in stock right now: 2016.'

## R13 [low] app/privacy-policy/page.tsx:40
PROBLEM: og:url on http://localhost:3001/privacy-policy and http://localhost:3001/terms is 'https://amgroupind.com' (the homepage) while their canonicals are /privacy-policy and /terms; both inherit the root layout's openGraph because neither sets its own. All other 61 sitemap URLs have og:url equal to the canonical.
FIX: Spread ...pageSocial({ title, description, path: '/privacy-policy' }) into the metadata (and the same with '/terms' in app/terms/page.tsx line 21, which no builder owned).

## R14 [low] app/inventory/inventory-client.tsx:221
PROBLEM: Title and H1 disagree on fuel/transmission filters. http://localhost:3001/inventory?transmission=Automatic -> title '5 Used Automatic Cars in Stock | AM Group', H1 '5 Used Cars in Stock'; same for ?fuel=Diesel ('4 Used Diesel Cars' vs '4 Used Cars'). page.tsx line 94 builds the scope from make, model, bodyType, fuel, transmission; headingScope at line 221 uses only make, model, bodyType. (Pages are noindex, so impact is small.)
FIX: Add filters.fuel and filters.transmission to headingScope, or pass the scope string computed in page.tsx down as a prop so there is one source.

## R15 [low] lib/seo/landing.ts:
PROBLEM: 'Used Cars Under ₹5 Lakh in Jammu — 5 in Stock' (http://localhost:3001/used-cars/under-5-lakh-in-jammu) counts a car priced exactly ₹5,00,000 (Tata Altroz 5353); its own text says 'priced from ₹3,80,000 to ₹5,00,000'. Same pattern on under-10-lakh ('to ₹10,00,000', cars 5189 and 5173). 'Under' in the title/H1 does not match the <= rule used to pick the cars; llms.txt repeats the counts.
FIX: Either filter with price < limit for the 'under' landings, or keep <= and word the heading/description as 'up to ₹5 lakh'. Check /inventory?budget=5 uses the same rule afterwards.

## R16 [low] components/homepage/why.tsx:33
PROBLEM: The 1968 statement is worded three ways: homepage 'in business in Jammu & Kashmir since 1968' (why.tsx:33), /inventory 'in business in Jammu since 1968' (app/inventory/inventory-client.tsx:489), /locations and llms 'began in Jammu in 1968 with Hindustan Petroleum fuel stations' (app/locations/about-facts.ts:41). The source (components/home/content.ts:43) says Jammu, and only the third form says the business was fuel, not cars.
FIX: Use one sentence from about-facts.ts in all three places (import it), so the place and the 'in fuel, not cars' qualifier are identical.

## R17 [medium] C:\Users\sahil\Downloads\am_group_jammu\components\analytics\consent-notice.tsx:49
PROBLEM: On a phone the analytics notice covers the car page's "Get best price" bar until the visitor answers it. The notice is `fixed`, `z-40`, with its bottom at `4rem + safe-area + 0.75rem`. The car page's phone bar (`app/inventory/[slug]/vehicle-client.tsx:558`) is `sticky` at `4rem + safe-area`, `z-30`, so it sits underneath. Measured at 375x812 on http://localhost:3001/inventory/kia-carens-2024-5676 (notice forced on with the dev key `am_analytics_preview=1`): notice spans y 574-736, the bar 687-748, its button 696-740. `elementFromPoint` at the button's centre returns the notice. The site tab bar itself (747-812) is clear, and the notice's two buttons are 44px.
FIX: On `/inventory/<car>` routes at phone width, lift the notice above the sticky bar: add about 4rem (the bar is 61px) to the phone `bottom` calc when `carFromPath(pathname)` is non-null. Alternatively dock the notice as a full-width strip directly above whichever bar is present, so it pushes rather than overlaps.

## R18 [medium] C:\Users\sahil\Downloads\am_group_jammu\app\privacy-policy\analytics-choice.tsx:26
PROBLEM: The control at the foot of the privacy policy says "Analytics and session recording are switched on for this browser" when nothing is configured or loaded. `status()` reads only `isInternal()` and `effectiveChoice()`; it never checks `ANALYTICS_MODE`, `hostAllowed` or which ids are set. Seen on http://localhost:3001/privacy-policy with no ids set: that sentence is shown while the page has zero Google or Microsoft scripts. Production has no ids today, so every visitor gets the same false statement. It is also false on preview hosts, and when only GA4 is set (no Clarity, so no session recording). The policy text at `app/privacy-policy/page.tsx:99` ("This website is set up to use two analytics tools") is unconditional in the same way.
FIX: Derive the status from `analyticsState()` plus `GA_ID` / `CLARITY_ID` / `ANALYTICS_MODE`. When the state is `idle`, say "No analytics tool is running on this site at the moment" and keep the toggle as a stored preference. Name only the tools that are configured, as `consent-notice.tsx` `sentence()` already does.

## R19 [medium] C:\Users\sahil\Downloads\am_group_jammu\app\privacy-policy\page.tsx:117
PROBLEM: The policy says information is shared "only in the following circumstances" and that refusing analytics means neither Google nor Microsoft tool is loaded. But `/contact` and `/locations/jammu` embed a Google Maps iframe (`app/locations/site-map.tsx:26`) that loads for every visitor who scrolls near it, whatever their analytics choice. Google receives the visitor's IP and can set its own cookies. With `referrerPolicy="no-referrer-when-downgrade"` (line 30) it also receives the full page address, including any `utm_*` / `gclid` / `fbclid` query. The policy does not mention the map anywhere.
FIX: Add a sentence to section 3 or 4 saying the contact and location pages show a Google map, loaded from Google, which receives the IP address and may set cookies regardless of the analytics choice. In `site-map.tsx` (another owner) set `referrerPolicy="no-referrer"` or `"origin"`, or load the map only after a "Show map" press.

## R20 [low] C:\Users\sahil\Downloads\am_group_jammu\components\modals\unlock-price-popup.tsx:239
PROBLEM: The consent stored on a lead does not distinguish the two wordings. The modal sends `consent: true` for the enquiry-only sentence, and the leads row holds one boolean. The admin lead page (`app/admin/leads/[id]/lead-detail-client.tsx:160`) prints "Consent: Given" for a modal lead exactly as for a ticked marketing box on the contact form. The real scope lives only in a best-effort history note. That note is not written on the duplicate path (`lib/leads/actions.ts:92-99` returns after "Repeat submission…"). Example: a General modal enquiry, then the contact form with the marketing box ticked within 10 minutes from the same number. The tick and the second attribution are recorded nowhere.
FIX: In `lead-detail-client.tsx` (another owner) replace the bare "Given" with "See first note" or parse the scope from the note. In `actions.ts`, append `Consent: ${consentNote}` and the attribution note to the "Repeat submission" activity so a repeat's consent and source are kept. Longer term add a `consent_scope` column.

## R21 [low] C:\Users\sahil\Downloads\am_group_jammu\components\modals\unlock-price-popup.tsx:382
PROBLEM: `generate_lead` and `generate_lead_duplicate` send `lead_id` (the leads-table row id) to GA4 (also `unlock-price-popup.tsx:394` and `app/contact/contact-form.tsx:92`). `lib/analytics/gtm.ts:21-23` says the purpose is that a GA4 row "can be joined back to a real row in the admin lead table", which is a named person with a phone number. Clarity is also sent `event generate_lead` and `upgrade('lead')` for the same session. Policy section 3 (`app/privacy-policy/page.tsx:107`) says only that name, number, email and message are never sent. It does not disclose that an identifier tying the analytics record and session replay to the identified enquiry is sent.
FIX: Either drop `lead_id` from the three events (the admin table already has `sourceLabel`, `sourcePath` and the attribution note), or add one sentence to policy section 3: "When you send an enquiry, its reference number is sent to Google Analytics so we can match the enquiry to the visit."

## R22 [low] C:\Users\sahil\Downloads\am_group_jammu\components\analytics\analytics.tsx:142
PROBLEM: `page_view` waits on `requestAnimationFrame`, which does not fire while a tab is not being painted. Other events (`view_item`, gallery events) are pushed immediately. Seen on http://localhost:3001/inventory/kia-carens-2024-5676 in a browser pane that was not painting: after more than 5 seconds `window.dataLayer` held `view_item` and `gallery_interact` but no `page_view`, and a probe `requestAnimationFrame` did not fire within 1500 ms. A car opened in a background tab (middle-click or long-press "open in new tab" from a card) therefore records `view_item` with no page view until the tab is shown, and none at all if it is closed first. With rAF working, a client navigation car page -> /inventory produced exactly one `page_view` with the new page's title.
FIX: Use `window.setTimeout(send, 0)` (cleared in the cleanup) instead of `requestAnimationFrame` for the title delay; timers run in background tabs. Keep the same dependency key.

## R23 [low] C:\Users\sahil\Downloads\am_group_jammu\lib\analytics\gtm.ts:176
PROBLEM: Read from the code, not exercised: in GTM mode a "No thanks" pressed part-way through a visit does not stop the container. `stopTags()` sets `ga-disable-${GA_ID}`, but in GTM mode `NEXT_PUBLIC_GA_ID` is ignored and usually empty, so no kill switch is set. The already-loaded container keeps its own triggers for the rest of that document. The only signal it gets is `consent update denied`, under which a GA4 tag in advanced consent mode still sends cookieless pings. The policy's "from then on neither tool is loaded" is true only from the next full page load. Direct mode is fine: `ga-disable` plus `clarity('consent', false)`.
FIX: In `components/analytics/analytics.tsx`, when `live` goes false after tags loaded and `ANALYTICS_MODE === 'gtm'`, call `window.location.reload()` after `stopTags()` (the same approach already used for `/admin`), so the document no longer contains the container.

## R24 [low] C:\Users\sahil\Downloads\am_group_jammu\components\modals\enquiry-host.tsx:35
PROBLEM: Read from the code, not reproduced: a failed load of the lazy modal or toaster chunk has nothing to catch it. `dynamic(loadPopup, { ssr: false })` is rendered from the root layout, and there is no `app/error.tsx` or `app/global-error.tsx`. If the `import()` rejects (phone offline when Enquire is tapped, with Save-Data on so the warm-up at line 64 never ran; or a stale chunk hash after a deploy), the rejection is thrown during render with no boundary above it. The whole page is replaced by Next's built-in client error screen instead of the enquiry form. Before this change the form was in the main bundle and could not fail separately. The warm-up's `void loadPopup()` also leaves an unhandled rejection. The normal path works: first open, focus on the dialog, Escape, and focus back on the "Get best price" button were all checked on :3001.
FIX: Wrap the two lazy components in a small error boundary inside `EnquiryHost` that renders nothing, closes the store (`onClose()`), and retries the import on the next open. Add `.catch(() => {})` to the warm-up call.

## R25 [medium] components/analytics/consent-notice.tsx:49
PROBLEM: On a phone the analytics notice sits on top of the car page's sticky enquiry bar, so the page's main button cannot be pressed until the notice is answered. Reproduced at 375x812 on http://localhost:3001/inventory/hyundai-creta-2021-4744 with the dev preview key set (localStorage am_analytics_preview='1', no stored choice): the notice occupies y 574-736 at z-40; the sticky bar (app/inventory/[slug]/vehicle-client.tsx:558, `sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30`) occupies y 687-748 with its 'Get best price' button at y 696-740. document.elementFromPoint at the centre of 'Get best price' returns one of the notice's buttons, at scroll 0, 600 and 1500. Every first-time visitor on a production host gets the notice, so a tap aimed at 'Get best price' lands on 'OK' or 'No thanks'. 'No thanks' does dismiss it and stores 'denied'; desktop is unaffected (bottom-left, the bar is md:hidden). (All checks ran on port 3001; 3311 is dead, same working tree.)
FIX: In consent-notice.tsx raise the phone offset so the notice clears both the tab bar and the car page's sticky bar, e.g. `bottom-[calc(8.5rem+env(safe-area-inset-bottom))]` in place of `bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)]`, keeping `md:bottom-4` as is. The sticky bar is about 61px tall. Re-check with the preview key at 375px that elementFromPoint on 'Get best price' returns that button.

## R26 [low] components/system/page-kit.tsx:67
PROBLEM: The 'visible without JavaScript' work stops at the homepage bands. `Band` still wraps its children in the old framer `Settle` from marks.tsx, so the raw HTML of http://localhost:3001/contact carries two `style="opacity:0;transform:translateY(8px)"` wrappers and /sell-your-car carries one. On /contact the hidden wrappers hold the whole 'Where we are' band (phone, addresses and the new Google map added in this pass) and the whole 'Send a message' band (the contact form). With script running they do reveal when scrolled into view, in both motion modes, so nothing is stuck for a normal visitor; the content is hidden only for a reader that does not run script. /, /inventory, every car page, every landing page and both location pages have zero inline opacity:0. The discovery builder already listed this as a hand-off; no builder owned page-kit.tsx.
FIX: In components/system/page-kit.tsx import `Settle` from `@/components/system/motion` instead of `@/components/system/marks` (same props). Then curl /contact and /sell-your-car and confirm `grep -c 'opacity:0'` is 0.

## R27 [low] components/editorial-home/shared/motion.ts:51
PROBLEM: `npx eslint app components lib scripts --quiet` exits 1 with one error: react-hooks/set-state-in-effect on `React.useEffect(() => setMounted(true), [])`. This is NOT a regression from the four builders: the file is untouched (`git diff HEAD --stat -- components/editorial-home` is empty) and belongs to an unrouted, abandoned homepage build. Every file the builders changed or created lints clean. `npx tsc --noEmit` exits 0, `npm run test:redirects` passes (23 legacy URLs, 0 failures), and `node scripts/check-cars-parity.mts` reports all 23 cars match on id, slug, price, km, fuel, body type and photo count.
FIX: Either delete the unrouted components/editorial-home build, or add it to the ESLint ignore list, or replace the effect with a `useSyncExternalStore(subscribe, () => true, () => false)` mounted flag. No change is needed in the builders' files.


# PART 2 - the four builders' full reports (read the 'For another owner' and 'Owner questions' sections)



=================== BUILDER REPORT 1 ===================
## Status

All four jobs are written; `npx tsc --noEmit` and `npx eslint <my files> --quiet` both exit 0. **Nothing was rendered or exercised in a browser**: the dev server on :3311 stopped answering part-way through (connection refused; the terminal tab shows a bare prompt), and I did not start one. Only the pure functions were run, in node (attribution cleaning, lead validation, channel naming, `carFromPath`, `pageType`).

## Files

**Changed**
- `app/layout.tsx`
- `app/contact/contact-form.tsx`
- `app/privacy-policy/page.tsx`
- `components/analytics/link-tracker.tsx`
- `components/modals/unlock-price-popup.tsx`
- `lib/analytics/gtm.ts`
- `lib/leads/actions.ts`, `lib/leads/notify.ts`, `lib/leads/types.ts`, `lib/leads/validation.ts`
- `.env.example`

**Created**
- `lib/analytics/config.ts` — ids, mode, the double-counting rule, the host rule, `CONSENT_DEFAULT`
- `lib/analytics/consent.ts` — stored choice, staff mark, `analyticsState()`
- `lib/analytics/events.ts` — typed helpers and the `data-*` contract
- `lib/analytics/attribution.ts` — browser capture
- `lib/leads/attribution.ts` — shared cleaning and wording
- `components/analytics/analytics.tsx` — scripts, page views, scroll depth, Clarity tags, notice mount
- `components/analytics/consent-notice.tsx`
- `components/analytics/list-view.tsx`
- `components/analytics/not-found-beacon.tsx`
- `components/modals/enquiry-host.tsx`
- `app/privacy-policy/analytics-choice.tsx`

**Deleted**
- `components/analytics/gtm.tsx`, replaced by `analytics.tsx`. The GTM `<noscript>` iframe went with it: it is server-rendered, so it could respect neither the `/admin` exclusion nor a visitor's "No thanks".

**Untouched:** `package.json` (no dependency added; `@next/third-parties` is not installed and not needed), `app/terms/**`, `hooks/**`, `enquire-cta.tsx`, `enquire-tile.tsx`.

## Job 1 — measurement

**The one rule** (written at the top of `lib/analytics/config.ts`):
- `NEXT_PUBLIC_GTM_ID` set: GTM is the only script loaded, events go to `dataLayer` as plain objects, and `gtag('event')` is never called. The GA and Clarity ids are ignored.
- GTM id empty: the site loads `gtag.js` and Clarity itself and sends every event with `gtag('event')`.
- No id: nothing loads.

This follows the brief over the critic's conflict note and over performance-12, both of which said "GTM only".

**Loading**
- GA4 and GTM use `next/script` with `afterInteractive`.
- Clarity waits for window `load` plus an idle callback, held in my own cancellable effect. `next/script`'s `lazyOnload` does not cancel once queued (`node_modules/next/dist/client/script.js`), so a "No thanks" pressed before load would still have had Clarity injected.
- No tag is in the server HTML and no preconnect to Google or Microsoft is emitted, so a browser that refused opens no connection to them.

**Where nothing loads**
- `/admin`.
- Any browser that has ever opened `/admin`, or opened `?am_internal=1`.
- Development.
- Any host that is not production: `NEXT_PUBLIC_VERCEL_ENV` must be `production`, or, where that is missing, the hostname must equal the `SITE_URL` host.
- After "No thanks".
- Override: `NEXT_PUBLIC_ANALYTICS_FORCE=true` (the old `NEXT_PUBLIC_GTM_DEV` still works).
- A client-side navigation into `/admin` with tags already loaded forces one reload, so no recorder can be running on the lead desk.

**Events**
- `pushEvent` keeps its name and all existing call sites.
- The gtag stub pushes the real `arguments` object, and sets consent defaults, then `js`, then `config` with `send_page_view: false`, before the first event, so a hydration-time `view_item` queues and replays.
- `pushEvent` drops `phone_number`, `email_address`, `name`, `phone`, `email` and `message` whoever sends them.
- **Page views:** keyed on `usePathname()` only, one frame late for the title. Filter, sort and search changes on `/inventory` are not pages.
- **Working today with no other owner's change:** `page_view`, `scroll_depth` (25/50/75 on home, car, landing, brand, sell), `select_item` for any click on a link to `/inventory/<slug>-<id>`, `contact_call`, `contact_support`, `contact_whatsapp`, `contact_email`, `get_directions`, `outbound_click`, `enquiry_modal_open`, `form_start` (modal and contact form), `form_error`, `enquiry_modal_close`, `generate_lead`, `generate_lead_duplicate`. Existing `view_item` and `search` still flow.
- **Contact clicks** now carry `click_location`, `location_slug`, `item_id`, `vehicle_slug`, `intent` (buy/sell), `page_type` and `page_path`. The old names `call_location`, `contact_location` and `directions_location` are kept alongside. Right-clicks are no longer counted as calls.
- **`generate_lead`** sends `value: 0` with the car's price as `listing_price`, plus `lead_channel`, `lead_utm_source`, `lead_utm_medium`, `lead_utm_campaign` and `lead_landing_path`. No click ids are sent to GA.
- **Sell funnel:** `page_type: 'sell'` and `intent: 'sell'` are on the page view and on every contact click from that page.

**Clarity**
- Tags: `page_type`, `intent`, `car_id`, `lead_intent`.
- Events: a short allow-list; `upgrade('lead')` on `generate_lead`.
- Masking: Clarity masks the content of input boxes in every mode (Microsoft's masking page, fetched today). Both forms also carry `data-clarity-mask="true"`, which blanks the whole form in replays whatever mode the project is set to.

**`data-*` contract** (documented at the top of `lib/analytics/events.ts` and in `link-tracker.tsx`)
- `data-track-location` — existing.
- `data-track-branch` — showroom slug. Falls back to parsing a trailing slug from `data-track-location`, so today's roughly 80 anchors already report it.
- `data-track-item` — car id, for links off a car page.
- `data-track-list`, `data-track-list-name`, `data-track-index` — on a car link or any ancestor.

## Job 2 — lead attribution (analytics-4)

- **Capture:** first touch in `localStorage` `am_attr_first` (replaced after 90 days); last touch in `sessionStorage` `am_attr_last`. Fields: `utm_source/medium/campaign/term/content`, `gclid`, `gbraid`, `wbraid`, `fbclid`, referrer (host and path only, external only), landing path, timestamp. Captured once per page load from the analytics host on mount.
- **Root `instrumentation-client.ts` not used:** it is not on my list. The mount effect reads the same landing URL.
- **Same-site new tabs** do not write a last touch, so they cannot relabel an ad lead "Direct".
- **Sent** with both forms as `CreateLeadInput.attribution`.
- **Cleaned on the server** (`sanitizeAttribution`): known keys only, strings only, control characters stripped, 200-character cap, referrer query dropped, landing path must start with `/`.
- **Stored** as a `note` row in `lead_activities` written straight after the lead, for example "How they found us. Channel: Google Ads. This visit: … . First visit: … . Consent: …". It is one line because the admin detail page prints `a.body` in a plain `<p>`, and React escapes it. Its failure cannot fail the lead.
- **Email:** added as "Channel", "This visit", "First visit" and "Consent" rows, through the existing `esc()`, never in a header. The email-only path (database down) carries them too.
- **No schema change.** The audit's `ALTER TABLE`, the CSV columns and a "Channel" column in the admin list were not done.

## Job 3 — privacy

- **Policy:** sections 1, 3, 4 and part of 7 rewritten to describe this code.
  - Covers: enquiry fields; what is stored with an enquiry; the how-you-found-us note; GA4 and Clarity by name, with what each does; inputs not recorded; ad signals denied; the email copy to the sales team; IP used only for rate limiting; how to refuse; how to ask for deletion.
  - Sections 2, 5, 6, 8 and 9 are the company's wording, unchanged.
  - "Effective 27 January 2025" is left as the company published it; the intro now adds that sections 1, 3, 4 and 7 were revised in November 2026.
  - A client control at the foot of the page shows whether analytics is on for the browser and toggles it.
- **Consent defect:**
  - The modal now shows `CONSENT_TEXT.enquiry` ("By sending this, you agree that AM Group may call or message you about this enquiry.") at the send button, with Privacy policy and Terms links. It sends `consentScope: 'enquiry'`.
  - The contact form sends `consentScope: 'marketing'` with the tick box as ticked or not, and gained one line under the button.
  - The exact meaning goes into the lead's note and the email, because the single boolean column cannot hold it.
- **Notice:** small panel, not a modal. `fixed`, `z-40`, bottom at `4rem + safe-area + 0.75rem` on phones, bottom-left on desktop (toasts are bottom-right). Token classes only, 15px text, two equal 44px `secondary` buttons, "OK" and "No thanks". Wording is built from what is configured.
- **"No thanks":** stored in `localStorage` `am_analytics`. From then on neither tag is requested. Mid-visit it also sets `ga-disable-<id>`, sends `consent update denied`, calls `clarity('consent', false)` and `clarity('stop')`, and expires `_ga*`, `_clck` and `_clsk`.
- **Consent Mode defaults:** `analytics_storage` granted; `ad_storage`, `ad_user_data` and `ad_personalization` denied.
- **Legal question for the owner:** whether Indian law (the DPDP Act) requires opt-in rather than this opt-out notice. The code is opt-out. Changing `CONSENT_DEFAULT` to `'denied'` in `lib/analytics/config.ts` makes the whole site opt-in, including the button label ("Allow").

## Job 4 — head and root bundle

- `lang="en-IN"`.
- `themeColor: "#146287"` (the `deep` token).
- The four preconnects and two dns-prefetches are removed.
- `robots: "index, follow"` is removed from the root metadata; it was the source of the contradictory tag on 404s.
- The stale "cached for 30 min" comment is corrected.
- `EnquiryHost` loads the enquiry modal and the toaster with `dynamic(..., { ssr: false })`: the modal on first open, the toaster on first toast, both kept mounted afterwards. The modal chunk is warmed after window load and idle, and skipped on Save-Data.
- **Font preloading not done:** `components/system/fonts.ts` is not mine (see hand-offs).

## Finding ids

**Implemented:** analytics-1, analytics-2, analytics-3 (except the admin mask attribute), analytics-4 (within the no-schema constraint), analytics-5, analytics-7, analytics-8, analytics-9, analytics-11, analytics-12, analytics-13, performance-5, performance-7, performance-12 (resolved per the brief: direct, not GTM), technical-13 (layout half).

**Partly — helper exported, call site belongs to another owner:** analytics-6, analytics-10.

**Skipped**
- analytics-14 — owner admin steps only.
- performance-6 — file not mine.
- technical-13's `app/not-found.tsx` title — not mine.
- performance-5's GTM preconnect — it would contact Google for opted-out browsers.

## For another owner

1. **`components/system/fonts.ts` (performance-6):** drop `"500"` from `Barlow_Condensed` weights. A grep of mounted components found no `font-display` combined with `font-medium`, `text-caption` or `text-nav`; the only 500-weight tokens (`--text-caption`, `--text-nav`) are body-face. Dynamically built class names were not checked.
2. **`app/not-found.tsx`:** render `<NotFoundBeacon />` from `@/components/analytics/not-found-beacon`, and add `export const metadata = { title: 'Page not found' }`.
3. **`app/admin/layout.tsx`:** add `data-clarity-mask="true"` to the root element as a second line of defence.
4. **`app/inventory/inventory-client.tsx`:**
   - `<ListView listId="inventory" listName="All used cars" items={listItems(pageItems)} />` (`ListView` from `@/components/analytics/list-view`, `listItems` from `@/lib/analytics/events`).
   - `data-track-list="inventory"` on the grid wrapper.
   - In `setFilter`/`toggleFilter`: `trackFilter(name, value, { activeFilterCount, resultCount })`.
   - Sort select: `trackSort(sort)`.
   - `resetFilters`: `trackFilterReset()`.
   - After results render for a typed query: `trackSearchResults(term, total)`.
5. **`components/system/stock-rail.tsx`, `app/locations/[slug]/stock-rail.tsx`, `app/used-cars/[slug]/page.tsx`, `app/brands/[slug]/page.tsx`, and the similar rail in `app/inventory/[slug]/vehicle-client.tsx`:** the same `<ListView … />` with a list id (`sourceLabel`, `landing-<slug>`, `brand-<slug>`, `vdp-similar`) and `data-track-list="<same id>"` on the wrapper.
6. **`components/ui/vehicle-card.tsx`:** `data-track-index={index}` on the card root. Optionally `trackGalleryInteract(v.id, 'arrow', 'card')` in `step()`.
7. **`app/inventory/[slug]/vehicle-gallery.tsx`:** `trackGalleryInteract(vehicleId, 'arrow' | 'thumb' | 'swipe')` in `goTo` and `onScroll`; `trackGalleryDepth(vehicleId, maxIndexSeen + 1, photos.length)` on unmount or when the tab is hidden. Needs the vehicle id passed in.
8. **`app/used-cars/[slug]/enquire-button.tsx` and `app/brands/[slug]/enquire-button.tsx`:** `sourceLabel` `'landing-grid'` and `'brand-grid'` instead of `'inventory-grid'`.
9. **`app/admin/leads/[id]/lead-detail-client.tsx`:** the "Consent: Given / Not recorded" label now covers two wordings; the exact one is in the lead's first note. Optionally give the activity `<p>` `whitespace-pre-wrap`. A "Channel" column in the list or CSV needs schema columns or a join on the note.
10. **Any anchor about a showroom or a car outside a car page:** `data-track-branch="<slug>"` and `data-track-item="<id>"`.
11. **`components/sections/legal-document.tsx`:** `LegalSection` takes strings only, so the Google and Microsoft policy addresses in section 3 are plain text, not links.

## Owner questions

1. What are the GA4 measurement id (`G-…`) and the Clarity project id? Set them as `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_CLARITY_ID` for Vercel Production only, then redeploy.
2. In Vercel project settings, is "Automatically expose System Environment Variables" on? If it is not, tags run only on the host in `NEXT_PUBLIC_SITE_URL`, which today's vercel.app address is not.
3. **GA4 admin, required for correct counts.** In Enhanced measurement switch OFF "Page changes based on browser history events" (otherwise every `/inventory` filter click and every navigation is counted twice), "Form interactions", "Outbound clicks" and "Site search". Then mark `generate_lead`, `contact_call`, `contact_whatsapp` and `get_directions` as key events, register the custom dimensions (`lead_intent`, `lead_source_label`, `form_id`, `error_code`, `click_location`, `location_slug`, `page_type`, `intent`, `vehicle_slug`, `lead_channel`), and set retention to 14 months.
4. Does your legal adviser say the DPDP Act requires opt-in consent for analytics and session recording, or is the opt-out notice acceptable?
5. What is the legal name of the company responsible for visitors' data, and who (name, email, phone) handles privacy and grievance requests?
6. How long are enquiries kept before deletion? The policy states no retention period.
7. What effective date should the privacy policy carry now that sections 1, 3, 4 and 7 are revised?
8. Is the modal's sentence at the send button the consent you want, or do you want a tick box there as on the contact page?
9. Do you want a nominal value per lead (buy or sell) in GA4? It is 0 now.
10. Will you add `utm_source=google&utm_medium=organic&utm_campaign=gbp` to each Google Business Profile website link, and utm tags to ad and WhatsApp-status links? Without them those visits read as "Direct or unknown".
11. Do you intend to use GTM at all? If yes, the container needs a Custom Event trigger per event name in `AnalyticsEventName`, and the privacy policy's "two tools" sentence must match what the container holds.

**Staff note:** any browser that opens `/admin` is never measured again, so you will not see your own visits in GA4 after logging in. `?am_internal=0` undoes it; `?am_internal=1` marks a phone that never opens `/admin`.

## Could not verify

- Anything rendered: the notice's look and its position against the phone tab bar and any sticky car-page bar; the privacy page layout and the choice control.
- The lazy modal's first open, focus return to the opening button, and the first toast through the lazy toaster.
- Hydration warnings, and `document.title` timing on client navigation.
- Head tags by curl (`lang`, `theme-color`, absent preconnects, a single robots tag on 404s).
- All GA4 and Clarity network behaviour: script loading, consent mode, the queue replay, `ga-disable`, cookie expiry.
- `clarity('stop')`, which is undocumented (from the open-source clarity-js); `clarity('consent', false)` is documented.
- Whether `NEXT_PUBLIC_VERCEL_ENV` is exposed on this Vercel project.
- A real lead end to end (activity note and email rows). I did not submit one, since it would write to the live table and email the owner. `scripts/test-leads.ts` was not run for the same reason; its assertions read individual `clean` fields, so the two new keys should not break it.
- `app/page.tsx` showed a transient type error (`landingHref`) mid-session from another builder's work; it was gone by the final run.


=================== BUILDER REPORT 2 ===================
# Car pages and data layer: report

All four parts of the job are implemented. `npx tsc --noEmit` exits 0 and eslint is clean on every file I own. Two things you should know first:

- **The dev server on :3311 stopped answering part-way through** (connection refused; I did not stop or start anything). A dev server for this same working tree was listening on **:3001**, so all page verification below ran against `http://localhost:3001`.
- **The Meta feed now has empty latitude/longitude on every row**, as instructed, because no site has a verified pin. Meta may reject or warn on vehicle rows without coordinates. This is the most urgent owner question (see the end).

## Files

Created:
- `C:\Users\sahil\Downloads\am_group_jammu\app\inventory\[slug]\car-facts.ts` — pure functions for the name, title, summary, extra FAQs and the JSON-LD graph (no `next/*`, no `@/`, so it runs under plain node).

Changed:
- `app\inventory\[slug]\page.tsx`, `vehicle-client.tsx`, `vehicle-gallery.tsx`
- `lib\inventory\types.ts`, `adapter.ts`, `server.ts`
- `lib\cars\mapper.ts`
- `lib\feed\meta.ts`, `app\api\feed\meta\route.ts`
- `app\api\vehicles\public-vehicle.ts`, `app\api\vehicles\route.ts` (comment only)

Deleted: none. Untouched although owned: `components/ui/gallery.tsx` (not imported anywhere), `lib/cars/types.ts`, `lib/cars/store.ts`, `app/listings/**`, `lib/seo/legacy-listing-urls.ts`, `app/api/vehicles/[id]/route.ts`.

## What was implemented

**1. Data seam** (content-local-1 data part, schema-15, aeo-geo-11 make/model part, content-local-7 step 2, technical-3 casing)
- `InventoryVehicle` gains optional `variant`, `owners`, `registration`, `locationSlug`, `description`, `updatedAt`; `lib/cars/mapper.ts` fills them (a blank counts as null).
- `displayName()` in `lib/inventory/adapter.ts` fixes casing word by word with a small exceptions table (MG, BMW, Kia, EV, XUV, i10/i20 and so on), applied to make, model and title inside `toInventoryVehicle`, so both stock sources agree.
- It may only change letter case, and checks that itself, so slugs cannot move.
- Proof slugs are unchanged: 23 of 23 ids and slugs from `/api/vehicles` are identical before and after; `node scripts/check-cars-parity.mts` reports all 23 match; `npm run test:redirects` passes with 0 failures.
- Filters still match: `/api/vehicles?make=TATA` returns 5 cars (filter value "Tata"), `?model=VITARA%20BREZZA` returns 1. Makes are now Maruti Suzuki, Hyundai, Kia, Tata.

**2. Sold cars** (technical-1, content-local-4 step 1)
- `SOLD_PAGE_RETENTION_DAYS = 30` in `lib/inventory/server.ts`, with a comment that the owner can change it. The clock runs from `updated_at`.
- `getVehicleBySlug` keeps `vehicle: null` for a sold car and returns a separate `soldVehicle`, so lists, the sitemap, feeds and `/api/vehicles/<id>` never see it.
- The sold page returns 200 with "(sold)" in the H1 and title, a Sold badge, "See similar cars" pointing at the model page, else brand, else `/inventory`, and Offer availability `SoldOut`.
- It drops everything that would be false: the enquiry and test-drive buttons, the WhatsApp prefill, the pager, the sticky bar, the FAQ block, the "available now" notes and the `view_item` event.
- The cache key was bumped to `used-cars-db-v2` because the cached shape changed.
- **There is no sold row in the database**, so I rendered this with a temporary stub in `findRecentlySold`, then removed it (grep confirms nothing left; the stub URL is 404 again). Results with the stub: sold yesterday gave 200 with all of the above; sold 31 days ago gave 404; bare id gave 308; `/api/vehicles/<id>` gave 404.

**3. The page** (aeo-geo-7, content-local-1, content-local-3, content-local-8e, schema-1, 2, 3, 9 car part, 10, 14 car part, 15, technical-3 car titles, technical-11 first half, performance-1 car page, performance-9, critic-7 item 2, aeo-geo-10 car part, analytics-10 gallery part)
- **H1, last crumb and JSON-LD name** are one string: year, title, variant (e.g. "2016 Maruti Suzuki Vitara Brezza").
- **Titles**: all 23 are unique and 60 characters or fewer. The two duplicate pairs are told apart by kilometres, e.g. "Used 2024 Kia Seltos Petrol, 5,268 km in Jammu — ₹15.00 L" and "…, 9,652 km …".
- **Summary paragraph** sits under the price panel, e.g. "This 2021 Hyundai Creta is a petrol automatic SUV in Phantom Black that has done 26,675 km. The asking price is ₹12,50,000. It is for sale from AM Group Used Cars in Jammu. Call +91 94842 00000 to see it and to check which of our Jammu sites it is at." A site is named only when `location_slug` matches a known site.
- **Optional facts**: Variant, Owners and Registration rows, the one-site "Where to see" block, the dealer's description above the generated notes, and three extra FAQs appear only when the value exists.
- **Links up**: breadcrumbs and "Browse similar" come from `getLandingHrefResolver()` in `lib/seo/landing.ts`. Trail example: Home / Used Cars in Jammu (`/used-cars/jammu`) / Used Kia Cars (`/brands/kia`) / Kia Carens (`/used-cars/kia-carens-in-jammu`) / 2024 Kia Carens. No `/inventory?` link remains on any of the 23 pages, and the BreadcrumbList matches the visible trail.
- **JSON-LD**: one `@graph` from the page (ItemPage plus the car as Product and Car), serialised with `jsonLdString` so "<" is escaped. Seller is `{ "@id": dealerId() }`; `offeredBy` and `availableAtOrFrom` are added only when a site is known. No inline dealer copy, no rating or review.
- **Images**: the first photo is `loading="eager" fetchPriority="high"` with sizes `(max-width: 1023px) 100vw, (max-width: 1535px) 55vw, 845px`; similar cards no longer load eagerly. Slides mount only within two of the furthest photo reached, and thumbnail images mount only from 768px up. A 39-photo page went from about 80 `<img>` tags to 11.
- Arrows, thumbnail jump, swipe and the counter were checked in the browser on desktop and at 375px, with no horizontal overflow.
- Stale slug redirect is now 308. Cars without a photo get the default share image.

**4. Feeds and API** (critic-1, aeo-geo-7 step 4, aeo-geo-10 `updatedAt`)
- Meta feed: latitude and longitude only when `geo.verified`; street and PIN only when `addressConfirmed`; the car's own site when `location_slug` is set, otherwise the main site. Columns, order and `vehicle_id` are unchanged.
- The description now says "Used car from AM Group, Jammu", which fixes "Used Cars car". Live feed: 20 rows included, 3 skipped (no photo or price), as before.
- The feed origin now comes from `SITE_URL` when it is explicitly set, otherwise the request origin; it no longer reads the env directly.
- `/api/vehicles` always returns `variant`, `owners`, `registration`, `locationSlug`, `description` (null until entered) and `updatedAt`.

## Parsed Car node, `/inventory/kia-carens-2024-5676` (image list shortened)

```json
{
 "@type": ["Product", "Car"],
 "@id": "https://amgroupind.com/inventory/kia-carens-2024-5676#car",
 "name": "2024 Kia Carens",
 "url": "https://amgroupind.com/inventory/kia-carens-2024-5676",
 "mainEntityOfPage": { "@id": "https://amgroupind.com/inventory/kia-carens-2024-5676#webpage" },
 "sku": "5676",
 "description": "This 2024 Kia Carens is a petrol automatic MPV in Glacier White Peal that has done 2,603 km. The asking price is ₹19,80,000. It is for sale from AM Group Used Cars in Jammu. Call +91 94842 00000 to see it and to check which of our Jammu sites it is at.",
 "brand": { "@type": "Brand", "name": "Kia" },
 "manufacturer": { "@type": "Organization", "name": "Kia" },
 "model": "Carens",
 "productionDate": "2024",
 "vehicleModelDate": "2024",
 "fuelType": "Petrol",
 "vehicleTransmission": "Automatic",
 "bodyType": "MPV",
 "color": "Glacier White Peal",
 "vehicleEngine": { "@type": "EngineSpecification", "name": "1 5L Turbo" },
 "mileageFromOdometer": { "@type": "QuantitativeValue", "value": 2603, "unitCode": "KMT" },
 "image": ["https://nhceknbaslqdqofefyla.supabase.co/storage/v1/object/public/car-photos/wordpress/5676/01.jpg", "… 39 in all"],
 "itemCondition": "https://schema.org/UsedCondition",
 "offers": {
  "@type": "Offer",
  "@id": "https://amgroupind.com/inventory/kia-carens-2024-5676#offer",
  "url": "https://amgroupind.com/inventory/kia-carens-2024-5676",
  "priceCurrency": "INR",
  "price": 1980000,
  "availability": "https://schema.org/InStock",
  "itemCondition": "https://schema.org/UsedCondition",
  "seller": { "@id": "https://amgroupind.com/#dealer" }
 }
}
```

The page carries four JSON-LD blocks: the layout's site graph, my car graph, BreadcrumbList and FAQPage. All parse on all 23 pages, no relative URLs, and no dangling `@id` (`/#dealer` and `/#website` both exist in the layout graph).

## Skipped, and why

- **Lightbox**: the car page never had one, and `components/ui/gallery.tsx` is not mounted. Nothing to keep working; I did not build one.
- **"Only preloaded image"**: not fully met. The car photo is preloaded and is the only `fetchpriority="high"` image, but the logo is also preloaded by `components/system/site-nav.tsx`, which I do not own.
- **schema-16** (move the car schema into `lib/seo-schemas.ts`): not my file. The graph lives in `car-facts.ts`.
- **aeo-geo-1 / content-local-11** ("% off" badge and struck-through price on the car page): left as is. Rule 2 says not to touch the discount badges, and what the second price is remains an owner fact.
- **aeo-geo-11 condition mapping** ("Used Cars" to "Used"): not done. It would change the condition facet and filter values; only the feed wording was fixed.
- **content-local-1 step 5** (per-site stock on location pages), **technical-11 second half** (two-hop legacy redirects), **performance-8** outside the car page: other owners' files. The similar-cars list does now use `toCardVehicle`.
- **Registration series in JSON-LD**: kept visible-only; there is no honest schema property for it.

## For another owner

- `components/system/site-nav.tsx`: drop `priority` on the logo so the car photo is the only image preload.
- `components/ui/vehicle-card.tsx`: I pass `index + 3` to the similar cards to stay past its `EAGER_CARDS = 3`. If an explicit `eager` prop is added, remove my `BELOW_THE_FOLD` constant in `vehicle-client.tsx`.
- `lib/seo/content.ts`:
  - `buildVehicleFaqs` still says "against an originally listed price of …".
  - `buildSellerNotes` still produces "It is … paired with a automatic gearbox" and "As a suv".
  - I override one answer by exact question text ("Can I see this car before buying?") when a site is known; renaming that question silently turns the override off.
- `app/sitemap.ts`:
  - `getAllVehicleSlugs()` now also returns `updatedAt`, and every vehicle has `updatedAt`, for lastmod.
  - Only three photos per car are now `<img>` in the HTML, so sitemap `images` matter more.
- `lib/seo/landing.ts`: the car page depends on `getLandingHrefResolver()` and its `Facet` type.
- `lib/inventory/server.ts` now imports `toCardVehicle` from `lib/inventory/filter.ts` (another builder added it there).
- Admin form (`lib/cars/actions.ts`, admin pages): the five optional facts are empty on all 23 rows, so the form is where they must be entered. Staff must mark a car "sold" rather than delete it, or there is no sold page.
- `llms.txt` and `lib/seo/links.ts` inherit the fixed make/model casing automatically; no follow-up needed. Condition "Used Cars" is still printed as stored.

## Owner questions

1. **Meta feed pin (urgent).** "What is the exact map pin (latitude and longitude) of AM Business Park, taken from its Google Business Profile?" Until it is entered in `lib/locations.ts` with `verified: true`, the feed has no coordinates and Meta may drop cars from the catalogue.
2. "For Nanak Nagar and AM Auto Square Gangyal, what are the street address, PIN code and map pin exactly as on each Google Business Profile?" Without these, a car at either site goes to the feed and the page with a locality only.
3. "Which of the three sites is each of the 23 cars kept at?"
4. "For each car: the variant (e.g. SX, HTX), the number of owners, the registration series (e.g. JK02), and two or three sentences of your own about it (service history, tyres, insurance validity)?"
5. "How long should a sold car's page stay up marked Sold before it is removed? It is set to 30 days." And "Will staff mark cars sold instead of deleting them?"
6. "What is the higher, struck-through price stored on each car: the new-car price, or an earlier AM Group asking price?" It is still shown as "% off" on the car page.
7. "Photos for cars 4358, 4351 and 4337, and the asking price for 4351?" These three are left out of the Meta feed and have no car image in their markup.
8. "Are the prices ₹15,00,001 (car 5633) and ₹19,80,030 (car 4353) correct?" And the colour "Glacier White Peal" on 5676 looks like a typo for Pearl; it now appears in the summary and markup as stored.
9. "What body type is the Kia Carens (stored as MPV, SUV and blank on different cars), and the six cars with none?" The summary sentence repeats whatever is stored.

## Could not verify

- **Optional facts and site-specific output on real data**: 0 of 23 rows have variant, owners, registration, site or description. Those branches (spec rows, one-site block, extra FAQs, `offeredBy`/`availableAtOrFrom`, feed address per site, "</script>" escaping in a description) ran only on a fabricated record through the pure functions.
- **A real sold row**: rendered only through the temporary stub described above. I did not write to the database.
- **Expiry of an already-cached sold page after 30 days** relies on the page revalidating with the 300-second stock cache; not observable in dev.
- **Google Rich Results Test** was not run; it needs the canonical origin to serve this app.
- **Whether Meta accepts rows without coordinates** was not tested against Meta.
- **Production HTML size**: measured in dev only (about 160 to 200 KB per page in dev, against 447 KB in the audit's production figure).
- **:3311** was down for the verification phase, so nothing was checked against it after the first data snapshot.


=================== BUILDER REPORT 3 ===================
## READ FIRST: the dev server moved from port 3311 to 3001

The one save of `next.config.ts` (required by this job) made Next restart the dev server, and the server on 3311 then exited with code 1. The log says: "Another next dev server is already running. Local: http://localhost:3001, PID 31816".

- **Cause:** PID 31816 is a child of an older orphaned `next dev` wrapper (PID 39612, started 22:57, left over from an earlier stopped preview). It also saw the config change and respawned, taking the project lock.
- **State now:** the same working tree, with everyone's edits, is serving on **http://localhost:3001**. All my verification ran there. Port 3311 is dead.
- **What I tried:** `taskkill /PID 39612 /T /F` returned "Access is denied". I did not start a server, because `preview_start` would hit the same lock.
- **Recovery:** kill the PID 39612 tree (39612, 31816, 39184) from an elevated shell, then start `am-group-dev` again.

`npx tsc --noEmit` exits 0 and `npx eslint --quiet` on my files exits 0, both re-run after the last edit.

## Files

**Changed**
- `lib/seo-schemas.ts` (rewritten)
- `lib/seo/site.ts`
- `lib/seo/locations.ts`
- `lib/locations.ts` (type field and comments only; no address, phone, coordinate or hour touched)
- `app/locations/page.tsx`
- `app/locations/[slug]/page.tsx`
- `app/contact/page.tsx`
- `app/contact/contact-page.tsx`
- `app/sell-your-car/page.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/llms.txt/route.ts`
- `app/not-found.tsx`
- `next.config.ts`
- `proxy.ts`
- `components/system/site-footer.tsx`
- `components/seo/breadcrumbs.tsx`
- `components/layout/conditional-breadcrumbs.tsx`
- `app/icon.png` and `public/icon.png` (now a 192x192 square)

**Created**
- `app/llms-full.txt/route.ts`
- `app/llms.txt/shared.ts`
- `app/manifest.ts`
- `app/favicon.ico` (32 and 48 px)
- `app/apple-icon.png` (180 px)
- `app/locations/about-facts.ts`
- `app/locations/about.tsx`
- `app/locations/site-map.tsx`
- `app/sell-your-car/content.ts`
- `public/og-default.jpg` (a real 1200x630, 36 KB)
- `public/icon-192.png`, `public/icon-512.png`
- `public/logo-am-group-square.png`

**Deleted:** none. `public/inventory_hero_bg.png` stays because `app/page.tsx` still references it.

**Not touched though owned:** `components/system/closing-call.tsx`, `components/seo/h-promise-line.tsx`.

## The @id contract for the car-page builder

Exported from `lib/seo-schemas.ts`:
- `dealerId()` gives `${SITE_URL}/#dealer`
- `websiteId()` gives `${SITE_URL}/#website`
- `siteDealerId(slug)` gives `${SITE_URL}/locations/<slug>#dealer` (`locationId(location)` is kept as an alias)
- `dealerGraph()`, with `generateSiteSchema` kept as an alias so `app/layout.tsx` needs no change
- `jsonLdString(data)`, which escapes "<" as \u003c
- `pageSchema()`, `locationPageSchema()`, `sellServiceSchema()`, `newestStockDate()`
- `generateVehicleListSchema()` now also takes `startPosition` and emits `dateModified`

The old ids `#organization` and the type `Organization` no longer exist. I checked a car page, `/used-cars/suv-in-jammu`, `/brands` and my own pages: no dangling @id reference on any of them.

## Business name: three spellings found, one kept

- Found: "AM Group" (`SITE_NAME`, the title template), "AM Group Used Cars" (WebSite name, sell page siteName, llms.txt H1), and "AM Group Used Cars Jammu" (Organization alternateName).
- Kept: **"AM Group Used Cars"**, as the new `DEALER_NAME` in `lib/seo/site.ts`. It is used for the dealer node, the WebSite node, og:site_name, the manifest and both llms files.
- "AM Group" stays as `SITE_NAME` for the title template and is the dealer's `alternateName`.
- Site names are unchanged ("AM Group Used Cars — AM Business Park" and so on).
- `locationNames()` now prints "AM Auto Square, Gangyal" instead of plain "Gangyal", so that site has one form everywhere. This changes meta descriptions and FAQ text site-wide.

## Findings implemented

- **schema-2 and aeo-geo-7 (seller part):** the id helpers are exported for the car builder; nothing describes the dealer inline in my files.
- **schema-4:** no code change needed; everything derives from `SITE_URL`.
- **schema-5:**
  - Logo is now a 512px square (`/logo-am-group-square.png`).
  - `Location.photos?` added.
  - Site nodes emit `image` only from real photos, never the logo.
- **schema-6 and schema-7:** the two unconfirmed sites emit only @id, name, url, telephone, locality, region, country and `parentOrganization`. No street, PIN, geo, hasMap, hours, areaServed, email or makesOffer.
  - No site emits geo, since all three are `verified: false`.
  - The hours question is removed from the FAQ (and so from FAQPage JSON-LD) on the two unconfirmed pages. The visible hours line stays, because it comes from data I may not edit.
- **schema-8 (my part):** "Certified pre-owned car sales" is shown and marked up as "Used car sales" through `serviceLabel()`. Contact FAQ answers contain only data from `lib/locations.ts`.
- **schema-9:**
  - `/contact` now has a BreadcrumbList matching its visible trail.
  - `/sell-your-car` has a visible trail under the hero, with the matching list.
  - One trail and one list per page, checked on all six pages.
- **schema-13:**
  - WebPage with `mainEntity` on each location page.
  - WebPage with `about` on `/locations`.
  - ContactPage on `/contact`.
  - Service with `provider` on `/sell-your-car`.
- **schema-14:** done in my files only (see "for another owner").
- **schema-16:** `generateVehicleSchema`, `generateDealerSchema`, `generateOrganizationSchema` and `generateLocalBusinessSchema` are removed.
- **aeo-geo-3:** an "About AM Group Used Cars" section sits on `/locations#about`, and is reused in both llms files.
  - It says 1968 is when the group began, with Hindustan Petroleum fuel stations and kerosene distribution, and is not the year it began selling cars.
  - It gives the first car franchise as Chevrolet, 2004 to 2017, then the franchise years.
  - Every sentence comes from `components/home/content.ts` or `lib/locations.ts`.
  - No owner, legal entity, GST number, awards or `foundingDate`.
- **content-local-9:**
  - A lazy Google Maps iframe (no API key, searched by the confirmed address, not the unverified coordinates) plus "Get directions", on `/locations/jammu` and `/contact`. I saw it render in the browser.
  - The two unconfirmed pages each have a distinct "Finding <site>" block and keep "call for exact directions".
- **content-local-10 and aeo-geo-12:** nothing added. No existing copy supports selling to buyers outside Jammu city (see owner questions).
- **aeo-geo-4:** robots keeps `/admin` and `/api` blocked, allows `/api/vehicles`, names an explicit permissive group for the AI and search crawlers (I added Claude-User and Perplexity-User), and drops `host`.
- **aeo-geo-5:** llms.txt has a dated summary with address, hours, phone, WhatsApp and email.
  - The city page is listed and labels come from the landing directory with live counts.
  - It has an About section and points to `/llms-full.txt` and `/api/vehicles`.
  - The stock "condition" label is dropped.
- **aeo-geo-6:** `/llms-full.txt` has all 23 cars in one table, a stock summary, sites, about, buying and selling. It reuses the sell page's own steps and answers, and is cached like llms.txt (30 minutes).
- **aeo-geo-10 and technical-2:** the sitemap has 400 image entries.
  - Car dates are `updatedAt ?? postedAt`; listing pages take the newest date of their own cars; hand-written pages use a `CONTENT_REVISED` constant; legal pages carry no date. No "now" dates.
  - `/used-cars` and `/brands` are included.
  - Landing URLs still come from `getAllLandingSlugs()`.
- **technical-6:** taxonomy redirects moved to `proxy.ts`. They are checked against the live site, take one hop and carry no query string.
- **technical-7:** see the redirect table below. The stale comment in `next.config.ts` is rewritten.
- **technical-8:** share image, square icons, favicon and manifest.
- **technical-9:** `pageSocial()` is the OG helper. The sell page now uses it.
- **technical-12:** `X-Robots-Tag: noindex` for any host other than the `SITE_URL` host, through `headers()` in `next.config.ts`, only when `NEXT_PUBLIC_SITE_URL` is set.
- **technical-13 (my part):** the 404 title is now "Page not found".
- **technical-3 (my part):** descriptions on `/contact`, `/locations`, `/locations/jammu` and `/sell-your-car` are trimmed with the phone number early.
- **performance-2 (item 3):** `deviceSizes` trimmed to 1920.
- **critic-6:** the five footer titles are `<p>`, with the same classes and id.
- **critic-7 (item 1):** the contact H1 now has its space.
- **aeo-geo-8 (item 3):** a four-question FAQ on `/contact`.

## Skipped, and why

- **schema-6 `sameAs`, legalName, exact pins:** need the owner.
- **content-local-9 "noindex the unconfirmed location pages":** the brief said to keep them and make them honest.
- **technical-12 "throw when NEXT_PUBLIC_SITE_URL is unset":** it would break today's production build.
- **technical-11:** needs `skipTrailingSlashRedirect` and slash handling in the proxy for every route. Too wide for this pass.
- **performance-3 parallax in `closing-call.tsx`:** not in this job.
- **analytics-7 `data-track-branch`:** the analytics builder's call. The existing `data-track-location` values are kept, with new ones `location-map-<slug>`, `contact-map` and `location-finding-<slug>`.
- **content-local-8 contact H1 rewrite:** visible copy change beyond the critic's fix.

## Legacy URLs (tested with `curl -I` on port 3001)

| Old URL | Status | Destination |
|---|---|---|
| `/?taxonomy=make&term=chevrolet` | 302 | `/used-cars/jammu` (no query; was a 301 into a 404) |
| `/?taxonomy=body&term=suv` | 301 | `/used-cars/suv-in-jammu` (no query) |
| `/hyundai` | 301 | `/brands/hyundai` |
| `/ktm-jammu` | 410 | none |
| `/about-us` | 301 | `/locations#about` |
| `/news-updates` | 410 | none |
| `/used-cars-in-jammu` | 301 | `/used-cars/jammu` |

Also checked with GET:
- `/am-kia` and `/am-tata` go to their brand pages.
- `/?taxonomy=body&term=sedan` returns 302 to `/used-cars/jammu`.
- `/?taxonomy=serie&term=creta` returns 301 to `/used-cars/jammu`.
- `/our-businesses`, `/gallery`, `/milele` and the news posts return 410.
- `/admin` still goes to the login page.

How it works:
- **410 list:** news, blog, gallery, `/our-businesses`, `/automobile`, fuel, real estate, retail, the cafés, and the MG, Honda, KTM and Bajaj showroom URLs. The 410 has a small plain HTML body with links, so a person does not get a blank page.
- **Stock-dependent redirects:** `/hyundai`, `/am-kia`, `/am-tata` and the taxonomy URLs make a HEAD request to their target. They return 301 if it answers 200, otherwise 302 to `/used-cars/jammu`. That costs one internal request per legacy hit.
- **Unchanged:** `/book-service`, `/insurance-solutions` and `/am-hyundai-mobis` still 302 to `/contact`.

## Other verification (port 3001)

- `/robots.txt`, `/sitemap.xml` (63 URLs, parses as XML), `/llms.txt`, `/llms-full.txt`, the three location pages, `/contact`, `/sell-your-car`, `/manifest.webmanifest`, `/favicon.ico`, `/apple-icon.png` and `/og-default.jpg` all return 200.
- All JSON-LD on those pages parses.
- Every FAQPage question is visible on its page.
- The footer no longer adds H2s.
- Checked in the browser at 375px: no horizontal scroll, and the map's "Get directions" target is 44px.

## For another owner

- **`app/layout.tsx:120`** still serialises the site graph with raw `JSON.stringify`. Change it to `jsonLdString(jsonLd)` from `@/lib/seo-schemas`.
- **`app/layout.tsx:59-61` and `101-103`** hard-link `/icon.png` for every icon. The head therefore has duplicate icon links, and the apple-touch-icon is the 192px file, not `app/apple-icon.png`. Delete the `metadata.icons` block and the three manual `<link>` tags; the files in `app/` emit the right tags on their own.
- **`components/seo/faq-section.tsx`:** check that it escapes "<"; `jsonLdString` is available.
- **`app/privacy-policy/page.tsx` and `app/terms/page.tsx`:** add `...pageSocial({ title, description, path: "/privacy-policy" })` (and `/terms`) to their metadata. `/inventory`, `/used-cars` and `/brands` already call it.
- **`app/page.tsx:7`** still uses `/inventory_hero_bg.png` as its OG image (a 1024x1024 JPEG named .png). Use `OG_IMAGE` or `pageSocial`.
- **`types/seo.ts`:** `VehicleSEO` is now unused.
- **`serviceLabel()`** is applied only in my files. `components/homepage/visit.tsx` or any other place that prints `location.services` still shows "Certified pre-owned car sales".
- **Privacy policy:** `/contact` and `/locations/jammu` now embed a Google Maps iframe, loaded lazily. Google receives the visitor's IP when it loads, and the policy should say so.
- **`lib/feed/meta.ts` (critic-1):** still publishes the unverified coordinates.
- **`.env.example`:** document that setting `NEXT_PUBLIC_SITE_URL` also switches on noindex for every other host.

## Owner questions

1. **PIN code.** Google's own card for "AM Business Park, NH-1 Bye Pass Road" in the embedded map shows "Guru Tegh Bahadur Nagar, Channi Himat, Jammu, 180015". The site says 180012 and "Opposite Jammu Railway Station". Which PIN and landmark are right? (I changed nothing.)
2. For each of the three sites: what is the Google Business Profile link, the exact street address and PIN as written on the profile, and the map pin (latitude and longitude)?
3. For Nanak Nagar and AM Auto Square, Gangyal: what are the street address, PIN and nearest landmark? Does each have its own Business Profile?
4. Are the hours really Mon–Sat 9:30 am to 6:30 pm, closed Sunday, at every one of the three sites? Is +91 94842 00000 answered for all three?
5. Which Jammu localities do you want named as served by each site? The nine listed for AM Business Park are unconfirmed, and the other two sites have none.
6. What is the registered legal name of the business selling the cars? Do you want an owner or manager named? Is there a GST number or any award you want published?
7. In what year did AM Group start selling used cars, and when did each of the three sites open?
8. What are the real Facebook, Instagram, YouTube and any CarDekho, CarWale or OLX dealer page URLs?
9. Do you sell to and transfer RC for buyers from other districts of J&K? Which? Do you deliver outside Jammu city, and do you buy cars from sellers outside it?
10. What does "Certified" mean at AM Group: who inspects, against what checklist, and is there any warranty? Until this is answered the service is labelled "Used car sales".
11. Is "answered within one working day" on the contact page a promise you stand behind? (It is still on the page, and not repeated in the new FAQ.)
12. Where will the new-vehicle franchises, the news posts and the non-auto businesses live after amgroupind.com moves here? Each URL that gets a real home elsewhere should change from 410 to a 301 to that address.
13. Which origin is canonical today, and on what date does amgroupind.com point here?
14. Can you supply a vector or 512px-plus logo, one approved photograph for the share image, and 3 to 5 real photographs of each site?
15. Is it acceptable for AI crawlers to use the site for training as well as for search and citation? robots.txt currently allows both.

## Not verified, or caveated

- **Noindex rule:** proven only in a scratch harness. I loaded the real `next.config.ts` with `NEXT_PUBLIC_SITE_URL=https://amgroupind.com` and ran Next's own matcher: amgroupind.com gets no header, while the vercel.app host, www.amgroupind.com and localhost get noindex. It cannot fire on the shared server because the variable is unset.
- **Danger with that switch:** setting `NEXT_PUBLIC_SITE_URL` to amgroupind.com before DNS points here would noindex the only live copy (vercel.app). The audit's "set it now" advice (schema-4, aeo-geo-5) is only safe if it is set to the address visitors actually use.
- **Icons and share image:** upscaled from the 169x112 white logo onto the blue token ground, so they are slightly soft. The generator script is at `C:\Users\sahil\AppData\Local\Temp\claude\6e14156f7eebb3f3\7e60d0d7-542f-48a7-8b00-cc3843e97fe7\scratchpad\make-brand-assets.cjs`, not in the repo, because `scripts/` is not mine.
- **Map pin:** the embed resolves the address string to a Google place named "AM Business Park". I cannot confirm it is the dealer's actual frontage.
- **Proxy self-check:** the HEAD request works on localhost. On a Vercel deployment with deployment protection it would fail and fall back (302) to `/used-cars/jammu`, which is safe but not the best target. Check once on production.
- **Sitemap dates:** every car currently shares one `updatedAt` (the import time, 2026-11-14 18:44 UTC), so stock lastmod values are identical until cars are edited.
- **Real crawlers:** Vercel bot protection may still challenge them. A user-agent curl cannot show that.
- **Production build:** not run, as instructed.


=================== BUILDER REPORT 4 ===================
## Outcome

All five parts of the job are built in my files; `npx tsc --noEmit` is clean and `npx eslint <my files> --quiet` exits 0. Nothing committed, no build run, no server started.

**Verified on `http://localhost:3001`, not 3311.** Port 3311 stopped listening partway through (connection refused); `.next/dev/lock` names pid 31816 on port 3001, and that server is this project. I did not start or restart anything.

## Files

**Created**
- `app/used-cars/page.tsx` — index of every live landing, with counts
- `app/brands/page.tsx` — index of makes in stock, with their model pages
- `components/homepage/answers.tsx` — dealer facts and Q&A band
- `components/system/motion.tsx` — reveal that is visible without JavaScript

**Changed**
- `app/page.tsx`, `app/inventory/page.tsx`, `app/inventory/inventory-client.tsx`
- `app/used-cars/[slug]/page.tsx`, `app/brands/[slug]/page.tsx`
- `components/homepage/`: `homepage.tsx`, `used-hero.tsx`, `browse.tsx`, `stock.tsx`, `why.tsx`, `visit.tsx`, `section-head.tsx`
- `components/sections/inventory.tsx`, `components/sections/featured-spotlight.tsx`
- `components/seo/faq-section.tsx`, `frequent-searches.tsx`, `related-links.tsx`
- `components/system/rule-draw.tsx`
- `components/ui/vehicle-card.tsx`, `components/ui/inventory-filters.tsx`
- `lib/seo/landing.ts`, `lib/seo/links.ts`, `lib/seo/content.ts`, `lib/inventory/filter.ts`

**Deleted:** none. `components/seo/pagination.tsx` is untouched.

## What changed, by job

**1. One page per head term** (technical-4, content-local-6, critic conflict)
- `/` is the dealer page: title and H1 both say "Buy or sell a used car in Jammu". The count moved into the sentence under the H1.
- `/used-cars/jammu` is the "used cars in Jammu" page, unchanged in wording.
- `/inventory` is the stock browser: "All 23 Used Cars in Stock".
- Breadcrumbs on landings now point "Used Cars in Jammu" at `/used-cars/jammu`; make pages use `/brands` as level 2. Anchors to `/inventory` in my files read "All used cars in stock".

**2. Landing system** (content-local-4/6/8, technical-3, critic-2, critic-5, technical-10)
- Titles fit 60 characters including " | AM Group"; the count is dropped before the name when too long.
- One-car grammar fixed: single price instead of "A to A", singular nouns, "Used SUVs" instead of "Used SUV Cars".
- Duplicates canonicalise by comparing car-id sets. Order of strength: make page, then model, body, fuel, gearbox, budget.
- A one-car body/fuel/gearbox/budget page that is not a duplicate is `noindex,follow` (none exists in today's stock).
- `getAllLandingSlugs()` keeps its shape but now returns only indexed, self-canonical landings, so the sitemap and llms.txt drop the three duplicates on their own.
- New exports in `lib/seo/landing.ts`: `getLandingHrefResolver()` (facet → href or null), `getLandingDirectory()`, `getResolvableLandingSlugs()`, `resolveSoldOutBrand()`.
- Sold-out model and make pages: a model or make with a row marked `sold` and no live stock returns 200 with "none in stock today, the last one we listed has been sold" and a "Call me when one arrives" enquiry button.
  - Model page: indexed only when same-make cars are in stock and the sale was within 90 days; otherwise `noindex,follow`.
  - Make page: always `noindex,follow`.
  - Never-stocked slugs still 404.
- Filter aliases `?body=`, `?type=`, `?brand=` now get `noindex` + canonical `/inventory`. The rule is "any filter parameter present, or anything parsed into a filter", so `?make=Chevrolet` is also noindexed.
- `?page=` beyond the last page returns a real 404.
- `PAGE_SIZE` raised from 9 to 24, so the whole stock is in the first page's HTML. Side effect: `/inventory?page=2` is now a 404 until stock exceeds 24.

**3. Internal links** (content-local-2, critic conflict 3)
- Homepage "Find your car", the link graph and "popular searches" all go through `getLandingHrefResolver()` and fall back to a filter URL only when it returns null.
- The href is the canonical page, so the "Premium SUV" chip links to the Hyundai Alcazar page.
- The "Used Cars by Year" group is removed (no year landings exist).
- The doubled "Second hand cars under N lakh" link is removed.

**4. Answers on the page** (aeo-geo-8, aeo-geo-1, aeo-geo-2, technical-5)
- New "Questions buyers ask" band after Visit: one facts paragraph plus eight questions, all built from stock data and `lib/locations.ts`.
- 1968 reworded in `why.tsx` and `inventory-client.tsx` to "Part of AM Group … in business in Jammu & Kashmir since 1968"; "A dealer since" and "58 years trading" are gone.
- "Certified Pre-owned", "certified used" and "verified KMs" removed from `/inventory` title and description and from the grid's default subtitle.
- "against an originally listed price of" removed from the per-car FAQ. Badges and struck-through prices are untouched.
- Also fixed in `content.ts`: "and and", "a automatic", "As a suv", "It is, paired with", part-exchange now says any of the three sites, automatic FAQ answers from the real count. "leading … banks" and the same-day finance sentence removed from `landing.ts` (schema-8).

**5. Rendering and speed** (critic-4, performance-3 partly, 4, 8, 10, 11, content-local-12)
- Homepage bands (stock, browse, visit, answers) use a local `StoreBand` with the new `Settle`. Server HTML has no inline `opacity:0`; script hides only bands still below the fold and eases them in. A jump past a band still reveals it.
- `RuleDraw` and `FeaturedInventory` no longer import framer-motion. The `/inventory` featured photo is visible in server HTML.
- Sliders navigate once on release. Filter, chip and sort changes use `router.replace` with `scroll: false`; typed search still pushes.
- `toCardVehicle()` in `lib/inventory/filter.ts` trims each card to 8 photos (5 for the spotlight); `photoCount` is unchanged.
- Card alt text is now "2024 Kia Seltos, Imperial Blue" and "…, photo 2". `VehicleCard` has a `sizes` prop; the grid default is corrected.
- `/inventory` stays dynamic. Reading `searchParams` makes a route dynamic in this Next version (`page.md`), `cacheComponents` is not enabled, and the title, robots and canonical all depend on the query. The reason is written at the top of `app/inventory/page.tsx`.
- Smaller items: critic-6 heading levels in `stock.tsx` and `why.tsx`; critic-7 (3) and (4); technical-9 and schema-11 for `/inventory` only; schema-14 in my files via `jsonLdString`; the schema-12 comment; analytics-6 (4) through a `sourceLabel` prop (`landing-grid`, `brand-grid`).

## Verification (localhost:3001)

| URL | Status | Robots | Canonical | Title | H1 |
|---|---|---|---|---|---|
| `/` and `/?utm_source=x` | 200 | none | `https://amgroupind.com` | AM Group Used Cars \| Buy or Sell a Used Car in Jammu | Buy or sell a used car in Jammu |
| `/inventory` and `?utm_source=x` | 200 | index, follow | `/inventory` | All 23 Used Cars in Stock \| Search and Filter \| AM Group | All 23 Used Cars in Stock |
| `/inventory?body=SUV`, `?type=SUV` | 200 | noindex, follow | `/inventory` | 6 Used SUV Cars in Stock \| AM Group | 6 Used SUV Cars in Stock |
| `/inventory?brand=Kia` | 200 | noindex, follow | `/inventory` | 11 Used Kia Cars in Stock \| AM Group | 11 Used Kia Cars in Stock |
| `/inventory?make=Chevrolet` | 200 | noindex, follow | `/inventory` | 23 Used Cars in Stock \| AM Group | 23 Used Cars in Stock |
| `/inventory?page=99`, `?page=2` | 404 | noindex | none | Page not found \| AM Group | — |
| `/used-cars/jammu` and `?utm_source=x` | 200 | none | `/used-cars/jammu` | Used Cars in Jammu \| 23 Second Hand Cars for Sale \| AM Group | Used Cars in Jammu — 23 Second Hand Cars in Stock |
| `/used-cars` | 200 | none | `/used-cars` | Find a Used Car by Budget, Model or Type in Jammu \| AM Group | Find a used car by budget, model or type |
| `/brands` | 200 | none | `/brands` | Used Cars by Make in Jammu \| AM Group | Used cars by make in Jammu |
| `/used-cars/hyundai-i20-in-jammu` | 200 | none | self | Used Hyundai i20 in Jammu \| 1 in Stock \| AM Group | Used Hyundai i20 in Jammu — 1 for Sale |
| `/used-cars/premium-suv-in-jammu` | 200 | none | `/used-cars/hyundai-alcazar-in-jammu` | Used Premium SUVs in Jammu \| 1 in Stock \| AM Group | Used Premium SUVs in Jammu — 1 in Stock |
| `/used-cars/premium-hatchback-in-jammu` | 200 | none | `/used-cars/hyundai-i20-in-jammu` | Used Premium Hatchbacks in Jammu \| 1 in Stock \| AM Group | Used Premium Hatchbacks in Jammu — 1 in Stock |
| `/used-cars/maruti-suzuki-vitara-brezza-in-jammu` | 200 | none | `/brands/maruti-suzuki` | Used Maruti Suzuki Vitara Brezza in Jammu \| AM Group | Used Maruti Suzuki Vitara Brezza in Jammu — 1 for Sale |
| `/used-cars/maruti-suzuki-swift-in-jammu`, `/brands/mahindra`, `/used-cars/made-up` | 404 | noindex | none | Page not found \| AM Group | — |

Other checks:
- Homepage meta description: "Buy or sell a used car in Jammu at AM Group Used Cars. 23 cars in stock today from ₹3.80 L, at three Jammu sites. Call +91 94842 00000."
- i20 landing description: "1 second hand Hyundai i20 for sale in Jammu, priced at ₹3,80,000. …"
- Inline `opacity:0` in served HTML: `/` 0, `/inventory` 0.
- Largest serialised `images` array per card: `/` 8, `/used-cars/jammu` 8, `/inventory` 8, `/brands/kia` 8.
- One breadcrumb nav and one BreadcrumbList on `/used-cars`, `/brands`, `/brands/kia`, `/used-cars/suv-in-jammu`, `/inventory`.
- In the browser: a real drag of the price thumb, released off the track, produced two `input` events and one navigation. Card arrows still step one photo per click. Reveal ran on scroll and after a jump to the page foot. No console errors.

**Landing URLs that exist and are indexed (29):**
- `/used-cars`, `/used-cars/jammu`, `/brands`
- Makes: `/brands/hyundai`, `/brands/kia`, `/brands/maruti-suzuki`, `/brands/tata`
- Budget: `/used-cars/under-5-lakh-in-jammu`, `under-7-lakh-in-jammu`, `under-10-lakh-in-jammu`, `under-15-lakh-in-jammu`
- Models: `hyundai-alcazar`, `hyundai-creta`, `hyundai-exter`, `hyundai-i20`, `kia-carens`, `kia-seltos`, `kia-syros`, `tata-altroz`, `tata-nexon`, `tata-punch`, `tata-tiago` (each `/used-cars/<name>-in-jammu`)
- Body: `/used-cars/suv-in-jammu`, `compact-suv-in-jammu`, `hatchback-in-jammu`, `mpv-in-jammu`
- Fuel and gearbox: `/used-cars/petrol-cars-in-jammu`, `diesel-cars-in-jammu`, `manual-cars-in-jammu`, `automatic-cars-in-jammu`

Still resolving but canonicalised elsewhere: `premium-suv-in-jammu`, `premium-hatchback-in-jammu`, `maruti-suzuki-vitara-brezza-in-jammu`.

## Not verified

- **Sold-out model and make pages were never rendered.** I had no row with status `sold` to test against. Only the fall-through to 404 ran.
- The 90-day window reads `updated_at`, so any later edit to a sold row restarts it.
- Titles and descriptions were checked in dev mode only; page weight in dev is inflated, so I quote array sizes instead.

## Skipped, and why

- **Year landings.** Model, gearbox and under-N-lakh landings already existed. "2024 used cars in Jammu" would be a near copy of the Kia pages, so I added none and removed the year link group instead.
- **content-local-5** (finance / exchange / certified pages): needs owner facts and routes outside my files.
- **performance-1** (eager / fetchPriority): not in my job list; `VehicleCard`'s eager rule is unchanged.
- **aeo-geo-6** stock table on `/used-cars/jammu`: belongs with the llms-full builder.
- **aeo-geo-10** visible "stock checked" stamp: not in my job list.
- **schema-12 (1)**: the FAQ is still rendered on filtered `/inventory` views.
- **Unconfirmed copy left in place**, per aeo-geo-9 "hold the wording": "Each car is checked and its documents verified before it is listed" (`landing.ts`), and "Before a car reaches this page it is checked…", "Cars listed as Certified Used have been inspected…", "Documentation has been checked…" (`content.ts`).

## For another owner

- `components/system/page-kit.tsx` and `marks.tsx`: point `Band`/`Settle` at `components/system/motion.tsx` (same props). `/sell-your-car` still ships one inline `opacity:0;transform:translateY(8px)`, and every other `Band` page does too.
- `components/system/stock-rail.tsx` and `app/locations/[slug]/stock-rail.tsx`: pass `sizes="(max-width: 639px) 300px, 340px"` to `VehicleCard`; the rails still use the grid default. The default label "Certified used cars currently in stock" is also a blanket claim.
- `app/sitemap.ts`: add `/used-cars` and `/brands`. Do not add the critic-5 redirects for them in `next.config.ts`; they are real pages now.
- `app/inventory/[slug]/page.tsx` line 191 labels its head crumb "Used Cars in Jammu"; check it points at `/used-cars/jammu`. `getLandingHrefResolver()` is available for the car page's crumbs and "Browse similar" links.
- `app/contact/page.tsx` title "Contact Us | Used Cars in Jammu" uses the head term.
- `app/locations/[slug]/page.tsx` and the similar-cars list in `lib/inventory/server.ts`: apply `toCardVehicle`. `/locations/jammu` still serialises a 49-photo array.
- `SeoLinks.models` labels now include the make ("Hyundai Creta"). I found no consumer outside my files that prepends the make, but the footer and nav owners should look.
- `app/used-cars/[slug]/enquire-button.tsx` and `app/brands/[slug]/enquire-button.tsx` are imported nowhere; I left them.
- Analytics: the new enquiry source labels are `landing-grid`, `brand-grid`, `landing-sold-out`, `brand-sold-out`.
- `lib/locations.ts` `USED_CAR_SERVICES` still lists "Certified pre-owned car sales".

## Owner questions

1. What is the higher, struck-through figure stored on each car: the new-car showroom price, the on-road price, or an earlier AM Group asking price? Does any car have a real, dated price reduction?
2. In what year did AM Group start selling cars, and in what year did the used-car business start? Is 1968 correct for the group, and was it fuel retail?
3. What does "Certified Used" mean at AM Group: who inspects, against what checklist, and does any warranty come with it? Is every car checked and its documents verified before listing, as the site says?
4. Are odometer readings independently verified or recorded at intake?
5. Which banks or lenders arrange the finance?
6. Are the hours Monday to Saturday 9:30 am to 6:30 pm at all three sites, and is +91 94842 00000 answered for all three? Is that number on WhatsApp?
7. When a model sells out, how long should its page stay in search results (I used 90 days)? Will staff mark cars "sold" rather than delete them? A deleted car leaves nothing to keep the page alive.
8. Does the company find a specific model on request? The sold-out page currently promises only a call when one arrives.
9. Are ₹15,00,001 (car 5633) and ₹19,80,030 (car 4353) real prices? The second is quoted as the top of the range on the homepage and `/used-cars/jammu`.
10. What are the street addresses, PIN codes and map pins for Nanak Nagar and AM Auto Square, Gangyal? Pages still say "exact address on request".