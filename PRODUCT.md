# PRODUCT.md — AM Group

## What this is
Corporate website of AM Group, a family-run automotive and industrial conglomerate in
Jammu & Kashmir, India, trading since 1968. This Next.js app replaces the live WordPress
site at amgroupind.com. It also sells the group's certified pre-owned cars directly
(live inventory scraped from the outgoing WordPress/Motors system).

## Verified product truth (sources: company's own WordPress pages, lib/locations.ts, live inventory)
- Founded **1968** with Hindustan Petroleum (HPCL) gas stations and kerosene distribution.
- Growth timeline (from the company's own About page):
  1968 HPCL · 1977 IOCL · 2004 Chevrolet · 2008 Hyundai · 2010 Honda 2-Wheeler ·
  2012 KTM · 2017 Tata Motors · 2024 Bajaj, Kia, MG.
- **26 dealership outlets** across Jammu & Kashmir (two-wheelers + passenger vehicles) —
  the company's own published figure. Do NOT use "500,000 customers" (unverified).
- Four published divisions: **Automobile, Petroleum (HP & Indian Oil), Real Estate, Retail
  (S Mega Mart)**; logistics mentioned as ancillary.
- New-vehicle franchises: Hyundai, Tata Motors, Kia, MG (AMG Autocraft), plus two-wheelers:
  Bajaj, KTM, Honda (Diamond Honda), Triumph (enquiry channel).
- Certified pre-owned arm: live multi-brand stock (Hyundai, Kia, Maruti Suzuki, Chevrolet),
  ~27 cars at any time, real photos and odometer readings; served by `getHomeInventory()`.
- Two showroom entities in code (lib/locations.ts): Jammu flagship (AM Business Park,
  N-H 1 Bye-Pass Road, opposite the railway station) and Srinagar (AM Tower, Hyderpora
  Bye-Pass). All used stock is held in Jammu.
- Real international awards on record: Hyundai Business Performance / Best Seller awards
  (Los Angeles 2009, Ho Chi Minh City 2009–10, Auckland 2010, Paris 2011, New York 2012,
  Lisbon 2018, Rio de Janeiro 2019); Chevrolet awards 2006–2011.
- Four real news posts exist (Hyundai awards, Smart Car Care Clinic, Kona Electric launch,
  all-new i20 launch) — currently only /blog index exists in this app.
- No company video assets exist anywhere. Real photography exists only on the WordPress
  host under wp-content/uploads (showroom exteriors, brand banners, model catalogue shots).

## Audience
Car and two-wheeler buyers in J&K (Jammu, Srinagar, Udhampur, Kathua); families making
their largest purchase after a home; Hindi/Urdu/English speakers browsing on midrange
Android phones over uneven networks. Secondary: banks, OEM partners, job seekers.

## Brand commitments
- Trust is earned with specifics: real stock counts, real years, real addresses, real awards.
  Never invent customers, employees, testimonials, or statistics.
- NAP consistency matters for local SEO — phone/address always from lib/locations.ts.
- Existing site accents: navy #023468 / red #E31837 are the incumbent's, NOT a commitment;
  the homepage rebuild replaces the visual world (user-directed, 2026-08).
- Google reviews shown must be the authentic ones (real Google avatar URLs).

## Hard constraints
- Next.js 16.2.6 App Router (breaking changes vs training data — read node_modules/next/dist/docs).
- Server data via `getHomeInventory()` / `getInventory()` (30-min cached WordPress scrape);
  every page must degrade gracefully when the scrape fails (degraded=true, zero vehicles).
- Homepage rebuild scope: app/page.tsx + new components; navigation for the homepage;
  NO lucide-react anywhere in the new homepage; no generic fonts (Arial/Inter/Roboto/
  Poppins/Open Sans/system-ui); inner pages and backend untouched.
- Leads flow through useEnquiryModal / submitLead — reuse, do not fork.
- GTM events fire via delegated LinkTracker (tel:/wa.me links need no onClick).
