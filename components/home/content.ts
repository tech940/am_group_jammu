import { SUPABASE_MEDIA } from "@/lib/supabase-media"

/**
 * Every fact the homepage states, in one file, with its source.
 *
 * Rule of the page: verified facts are stated plainly; anything the company
 * has not published yet is marked PLACEHOLDER and listed in the replacement
 * table at the bottom. Never present a placeholder as a verified claim.
 */

/* ------------------------------------------------------------------ */
/* Timeline — from the company's own About page (amgroupind.com/about-us) */
/* ------------------------------------------------------------------ */

export interface Milestone {
  year: number
  title: string
  note: string
  /**
   * The marque's own mark, as published on the company's About page
   * ("Timeline of Excellence"). Self-hosted under /public/marques rather than
   * hot-linked from wp-content, which is being decommissioned.
   *
   * All eight are DARK artwork on transparent, so they are never recoloured —
   * a trademark is not ours to restyle. They sit on a light chip instead.
   */
  mark?: string
  /**
   * What kind of stop this is on the journey, for the pictogram shown beside
   * the year — a fuel pump, a car, a motorcycle. "multi" marks 2024, where
   * three franchises (two car, one two-wheeler) arrived in one year and no
   * single vehicle is honest; it renders as a route-flag waypoint instead.
   */
  kind: "fuel" | "car" | "bike" | "multi"
  /**
   * A short editorial stage name for the journey rendering ("The beginning",
   * "Into cars"). Framing, not fact — the factual claim stays in `note`.
   */
  stage: string
}

export const TIMELINE: Milestone[] = [
  { year: 1968, title: "Hindustan Petroleum", kind: "fuel", stage: "The beginning",   note: "The group begins with HPCL gas stations and kerosene distribution in Jammu." , mark: "/marques/hp.png" },
  { year: 1977, title: "Indian Oil", kind: "fuel", stage: "A second appointment",   note: "IOCL dealership extends the petroleum business across the region." , mark: "/marques/iocl.png" },
  { year: 2004, title: "Chevrolet", kind: "car", stage: "Into cars",   note: "First passenger-car franchise; GM awards follow from 2006." , mark: "/marques/chevrolet.png" },
  { year: 2008, title: "Hyundai", kind: "car", stage: "The breakthrough",   note: "AM Hyundai opens — the group's largest car business to this day." , mark: "/marques/hyundai.png" },
  { year: 2010, title: "Honda 2-Wheelers", kind: "bike", stage: "Onto two wheels",   note: "Diamond Honda brings the group into two-wheelers." , mark: "/marques/honda.png" },
  { year: 2012, title: "KTM", kind: "bike", stage: "The only one in Jammu",   note: "The only KTM showroom in Jammu." , mark: "/marques/ktm.png" },
  { year: 2017, title: "Tata Motors", kind: "car", stage: "The home-grown range",   note: "AM Tata adds India's home-grown passenger range." , mark: "/marques/tata.png" },
  { year: 2024, title: "Bajaj · Kia · MG", kind: "multi", stage: "Three at once",   note: "Three franchises in one year — the group's broadest expansion since 1968." , mark: "/marques/bajaj-kia-mg.png" },
]

export const FOUNDED = 1968
export const YEARS_TRADING = new Date().getFullYear() - FOUNDED

/* ------------------------------------------------------------------ */
/* Scale — published figures only                                      */
/* ------------------------------------------------------------------ */

export const SCALE = {
  outlets: 26, // "26 dealership outlets across the union territory" — company About page
  // 8 = 7 CURRENT appointments + Chevrolet, which ended in 2017 and is carried
  // in FRANCHISES as category "Heritage". Anything written in the present tense
  // must therefore say SEVEN — the homepage said "eight vehicle franchises"
  // while its own scale chapter said seven, and contradicted itself.
  franchises: 8, // Hyundai, Tata, Kia, MG, Bajaj, KTM, Honda 2W + Chevrolet (heritage)
  divisions: 4, // Automobile, Petroleum, Real Estate, Retail — company Our Businesses page
  cities: ["Jammu", "Srinagar", "Udhampur", "Kathua"],
}

/* ------------------------------------------------------------------ */
/* Divisions — the four the company publishes                          */
/* ------------------------------------------------------------------ */

export interface Division {
  key: string
  name: string
  since: number
  /** True when the year is a stand-in awaiting client confirmation — rendered
      as "c. YYYY" so the page never presents it like the verified years. */
  sinceApprox?: boolean
  summary: string
  href: string
  image: string
  imageAlt: string
  figure: string
}

export const DIVISIONS: Division[] = [
  {
    key: "automobile",
    name: "Automobile",
    since: 2004,
    summary:
      "Seven current vehicle franchises across passenger cars and two-wheelers — plus Chevrolet, held 2004–2017 and still serviced — with sales, authorised service and certified pre-owned stock.",
    href: "/automobile",
    image: SUPABASE_MEDIA.divisions.automobile,
    // The photograph behind this key is the AM Tata forecourt, not the
    // Hyundai/Kia campus the caption used to name. A caption that does not
    // match its photograph is exactly the kind of unchecked claim the rest of
    // this file exists to prevent.
    imageAlt: "The AM Tata Motors showroom in Jammu with new cars lined up on the forecourt",
    figure: "AM Tata, Jammu",
  },
  {
    key: "petroleum",
    name: "Petroleum",
    since: 1968,
    summary:
      "Where the group began: Hindustan Petroleum and Indian Oil stations serving the region's fuel demand since 1968.",
    href: "/hp-indian-oil",
    image: SUPABASE_MEDIA.divisions.petroleum,
    imageAlt: "Indian Oil and HP fuel stations",
    figure: "HP & Indian Oil stations",
  },
  {
    key: "real-estate",
    name: "Real Estate",
    since: 2000, // PLACEHOLDER year — division is real, first-project year unpublished
    sinceApprox: true,
    summary:
      "Commercial and residential development, including AM Business Park on the N-H 1 Bye-Pass — the group's own flagship address.",
    href: "/real-estate",
    image: SUPABASE_MEDIA.divisions.realEstate,
    imageAlt: "AM Group real estate project",
    figure: "Group development, Jammu",
  },
  {
    key: "retail",
    name: "Retail",
    since: 2025, // S Mega Mart photography dated 2025 on the company site
    summary:
      "S Mega Mart brings organised retail to the valley — the group's newest business and its first outside automotive and energy.",
    href: "/s-mega-mart",
    image: SUPABASE_MEDIA.divisions.retail,
    imageAlt: "S Mega Mart store entrance in Srinagar",
    figure: "S Mega Mart, Srinagar",
  },
]

/* ------------------------------------------------------------------ */
/* Franchise register — appointment years from the About-page timeline */
/* ------------------------------------------------------------------ */

export interface Franchise {
  name: string
  since: number
  category: "Passenger cars" | "Two-wheelers" | "Heritage"
  entity: string
  image: string
  imageAlt: string
  /**
   * The franchise page's URL path — the EXACT slug the old WordPress site
   * ranked under (/hyundai, /am-kia, /ktm-jammu, ...), so the page takes over
   * the legacy URL directly instead of living behind a redirect. null for
   * Chevrolet: the appointment ended in 2017 and a heritage marque gets a row
   * in the register, not a landing page.
   */
  slug: string | null
  /** One honest paragraph for the franchise page. Facts only. */
  blurb: string
}

export const FRANCHISES: Franchise[] = [
  { name: "Hyundai", since: 2008, slug: "hyundai", blurb: "AM Hyundai opened in 2008 and remains the group's largest car business, with showrooms in Jammu and Srinagar and authorised service behind both.", category: "Passenger cars", entity: "AM Hyundai", image: SUPABASE_MEDIA.branches["jammu-hyundai"].exterior, imageAlt: "AM Hyundai flagship showroom" },
  { name: "Tata Motors", since: 2017, slug: "am-tata", blurb: "AM Tata brought India's home-grown passenger range to the group in 2017 — sales, authorised service and genuine parts under one appointment.", category: "Passenger cars", entity: "AM Tata", image: SUPABASE_MEDIA.divisions.automobile, imageAlt: "AM Tata Motors dealership, Jammu" },
  { name: "Kia", since: 2024, slug: "am-kia", blurb: "AM Kia is one of the three franchises appointed in 2024, the group's broadest single year of expansion since 1968.", category: "Passenger cars", entity: "AM Kia", image: SUPABASE_MEDIA.branches["jammu-kia"].exterior, imageAlt: "AM Kia showroom interior with Carens and Seltos" },
  { name: "MG", since: 2024, slug: "amg-autocraft-jammu", blurb: "AMG Autocraft holds the MG Motor franchise for Jammu, appointed in 2024 alongside Kia and Bajaj.", category: "Passenger cars", entity: "AMG Autocraft", image: SUPABASE_MEDIA.branches["luxury-showrooms"].mg, imageAlt: "MG Morris Garages dealership building, Jammu" },
  { name: "Honda", since: 2010, slug: "honda-two-wheeler", blurb: "Diamond Honda brought the group into two-wheelers in 2010, with sales and authorised service for Honda's motorcycle and scooter range.", category: "Two-wheelers", entity: "Diamond Honda", image: SUPABASE_MEDIA.branches["two-wheelers"].honda, imageAlt: "Diamond Honda two-wheeler dealership" },
  { name: "KTM", since: 2012, slug: "ktm-jammu", blurb: "KTM Jammu, appointed 2012, is the only KTM showroom in Jammu — sales, authorised service and genuine parts for the full KTM range.", category: "Two-wheelers", entity: "KTM Jammu", image: SUPABASE_MEDIA.branches["two-wheelers"].ktm, imageAlt: "KTM Jammu showroom" },
  { name: "Bajaj", since: 2024, slug: "am-bajaj-jammu", blurb: "AM Bajaj was appointed in 2024, one of three franchises added that year, selling and servicing Bajaj's motorcycle range.", category: "Two-wheelers", entity: "AM Bajaj", image: SUPABASE_MEDIA.branches["two-wheelers"].bajaj, imageAlt: "AM Bajaj showroom" },
  { name: "Chevrolet", since: 2004, slug: null, blurb: "Held 2004–2017; General Motors left India and the franchise ended, but service on Chevrolet cars is still honoured.", category: "Heritage", entity: "2004 – 2017 · service honoured", image: SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior, imageAlt: "AM Group dealership" },
]

/**
 * Round figures as the company itself publishes them — the counters on its own
 * homepage ("Why us"). They are marketing round numbers, not audited counts,
 * and they render with that caveat in the note line rather than being dressed
 * up as measurements. The old site also said "50+ years", which is simply
 * stale; YEARS_TRADING computes the real figure.
 */
export const CLAIMS = {
  vehiclesPerYear: { value: 10, suffix: "K+", label: "Vehicles sold a year" },
  customers: { value: 5, suffix: "L+", label: "Customers served" },
} as const

/* ------------------------------------------------------------------ */
/* Awards — from the company's own Awards & Recognition tables         */
/* ------------------------------------------------------------------ */

export interface Award {
  title: string
  place: string
  year: number
  marque: "Hyundai" | "Chevrolet"
}

export const AWARDS: Award[] = [
  { title: "Best Seller of the Half Year", place: "Los Angeles, USA", year: 2009, marque: "Hyundai" },
  { title: "Best Seller Award", place: "Ho Chi Minh City, Vietnam", year: 2010, marque: "Hyundai" },
  { title: "Best Seller Award", place: "Auckland, New Zealand", year: 2010, marque: "Hyundai" },
  { title: "Best Seller Award", place: "Paris, France", year: 2011, marque: "Hyundai" },
  { title: "Best Seller Award", place: "New York, USA", year: 2012, marque: "Hyundai" },
  { title: "Business Performance Award — i20", place: "Lisbon, Portugal", year: 2018, marque: "Hyundai" },
  { title: "Business Performance Award — i20", place: "Rio de Janeiro, Brazil", year: 2019, marque: "Hyundai" },
  { title: "Customer Satisfaction Award", place: "GM Office", year: 2006, marque: "Chevrolet" },
  { title: "Sales & Achievement Award", place: "Zone Level", year: 2010, marque: "Chevrolet" },
]

/**
 * The complete award register, exactly as the company publishes it on its own
 * About page. AWARDS above is the homepage's short list; this is the full
 * table used by /about.
 */
export const AWARDS_HYUNDAI: Award[] = [
  { title: "National Best Seller Award (H1)", place: "Los Angeles, USA", year: 2009, marque: "Hyundai" },
  { title: "Best Dealership (North Region)", place: "Head Office", year: 2009, marque: "Hyundai" },
  { title: "National Best Seller Award (Volume)", place: "Ho Chi Minh City, Vietnam", year: 2009, marque: "Hyundai" },
  { title: "National Best Seller Award (Retails)", place: "Ho Chi Minh City, Vietnam", year: 2010, marque: "Hyundai" },
  { title: "National Best Seller Award", place: "Auckland, New Zealand", year: 2010, marque: "Hyundai" },
  { title: "National Best Seller Award", place: "Paris, France", year: 2011, marque: "Hyundai" },
  { title: "National Best Seller Award", place: "New York, USA", year: 2012, marque: "Hyundai" },
  { title: "Best Premium Car Seller Award", place: "Head Office", year: 2015, marque: "Hyundai" },
  { title: "Best Model Performance Award — i20", place: "Lisbon, Portugal", year: 2018, marque: "Hyundai" },
  { title: "Best Model Performance Award — i20", place: "Rio de Janeiro, Brazil", year: 2019, marque: "Hyundai" },
]

export const AWARDS_CHEVROLET: Award[] = [
  { title: "Highest Customer Satisfaction Award", place: "G.M. Office", year: 2006, marque: "Chevrolet" },
  { title: "Parts Target Achievement Award", place: "G.M. Office", year: 2006, marque: "Chevrolet" },
  { title: "Spark Fastest 50 Contest Award", place: "G.M. Office", year: 2007, marque: "Chevrolet" },
  { title: "Overall Customer Satisfaction Award", place: "Gurgaon", year: 2007, marque: "Chevrolet" },
  { title: "Best Accessory Sale Award", place: "Nainital", year: 2009, marque: "Chevrolet" },
  { title: "1st Rank Overall Performance", place: "Zone Level", year: 2010, marque: "Chevrolet" },
  { title: "5,000 Vehicle Sales Achievement", place: "Zone Level", year: 2011, marque: "Chevrolet" },
]

/* ------------------------------------------------------------------ */
/* Google reviews — the three authentic ones (real Google avatar URLs) */
/* ------------------------------------------------------------------ */

export interface Review {
  quote: string
  name: string
  meta: string
  date: string
}

export const REVIEWS: Review[] = [
  {
    quote:
      "I had an excellent experience working with my sales advisors Rahida and Sheetal. They took the time to understand my preferences, explained all available options clearly, and ensured I felt confident in my purchase decision.",
    name: "Akash Suri",
    meta: "Local Guide · AM Hyundai Jammu",
    date: "3 months ago",
  },
  {
    quote:
      "The staff was professional and cooperative, and the overall process was smooth and hassle-free. A special thanks to Shivani Ma'am for her outstanding support, polite behaviour and clear guidance throughout the entire buying journey.",
    name: "Junaid Ahmad",
    meta: "AM Hyundai Jammu",
    date: "7 months ago",
  },
  {
    quote:
      "The entire process, from booking to delivery, was smooth and transparent. The sales team was courteous, patient, and answered all my questions regarding the vehicle, insurance, loan and documentation.",
    name: "Abbu Ayad",
    meta: "AM Hyundai Jammu",
    date: "4 weeks ago",
  },
]

/* ------------------------------------------------------------------ */
/* News — the four real posts from the company's WordPress blog        */
/* ------------------------------------------------------------------ */

export interface NewsItem {
  date: string
  title: string
  note: string
}

export const NEWS: NewsItem[] = [
  { date: "26 Feb 2021", title: "AM Hyundai bags two prestigious awards", note: "National recognition for sales and service performance." },
  { date: "15 Dec 2020", title: "AM Hyundai inaugurates Smart Car Care Clinic", note: "A free multi-point inspection camp for Hyundai owners in Jammu." },
  { date: "03 Dec 2020", title: "Hyundai Kona Electric launched in Jammu", note: "India's first fully electric SUV arrives at AM Hyundai." },
  { date: "07 Nov 2020", title: "All-new Hyundai i20 launched", note: "The third-generation i20 opens for bookings at AM Hyundai." },
]

/* ------------------------------------------------------------------ */
/* People — PLACEHOLDER. Roles are real functions of the business;     */
/* headcounts and photography are pending from the client.             */
/* TODO(client): supply real team figures and photographs.             */
/* ------------------------------------------------------------------ */

export interface Team {
  name: string
  brief: string
  /** PLACEHOLDER until the client supplies real numbers. */
  strength: string
}

export const TEAMS: Team[] = [
  { name: "Sales", brief: "Showroom advisors across every franchise, Jammu to Srinagar.", strength: "—" },
  { name: "Service & Workshop", brief: "Factory-trained technicians in authorised workshops.", strength: "—" },
  { name: "Finance & Insurance", brief: "In-house desk arranging bank finance and motor insurance.", strength: "—" },
  { name: "Petroleum Operations", brief: "Station crews running HP and Indian Oil forecourts since 1968.", strength: "—" },
]

/* ------------------------------------------------------------------ */
/* Ownership circuit — services that genuinely exist today             */
/* ------------------------------------------------------------------ */

export interface CircuitStop {
  label: string
  detail: string
  href: string | null
}

export const CIRCUIT: CircuitStop[] = [
  { label: "Discover", detail: "Browse live certified stock — real photos, recorded odometer readings.", href: "/inventory" },
  { label: "Buy", detail: "New across 7 current franchises, or certified pre-owned held in Jammu.", href: "/used-cars/jammu" },
  { label: "Finance", detail: "Bank finance arranged in-house, indicative decisions same day.", href: "/contact" },
  { label: "Insure", detail: "Motor insurance and renewals handled at the dealership.", href: "/contact" },
  { label: "Service", detail: "Authorised workshops with genuine parts.", href: "/contact" },
  { label: "Exchange", detail: "Part-exchange valued while you wait; the circuit begins again.", href: "/contact" },
]

/* ------------------------------------------------------------------ */
/* REPLACEMENT LIST — placeholders awaiting real client data           */
/*  1. DIVISIONS: real-estate `since` year (2000 is a placeholder)     */
/*  2. TEAMS: headcounts ("—") and all team photography                */
/*  3. Culture / site-diary photography (reserved plates render until  */
/*     real event imagery is supplied)                                 */
/*  4. Triumph franchise omitted — only an enquiry page exists as      */
/*     evidence; add to FRANCHISES when the client confirms            */
/*  5. PHONE NUMBERS: every tel:/wa.me action renders from             */
/*     lib/locations.ts, which currently holds sequential DUMMY        */
/*     numbers (+91 94191 00000, 11111, …). Replace with the real      */
/*     published numbers there before launch — the WhatsApp number     */
/*     must be registered on WhatsApp or the button opens a dead       */
/*     "invalid number" screen.                                        */
/* ------------------------------------------------------------------ */
