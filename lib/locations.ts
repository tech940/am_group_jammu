/**
 * Single source of truth for NAP (Name, Address, Phone).
 *
 * NAP consistency is one of the strongest local-ranking signals there is:
 * Google cross-references what your site says against your Google Business
 * Profile and third-party directories, and punishes disagreement. The same
 * address and phone were previously hardcoded in ~10 separate files, which
 * guarantees drift the first time something changes.
 *
 * IMPORTANT — the `geo` coordinates below are approximate and MUST be replaced
 * with the exact pin from each Google Business Profile listing before launch.
 * Wrong coordinates are worse than none: they contradict your GBP and can send
 * a customer to the wrong side of town.
 *
 * WHAT READS THIS FILE, AND WHAT EACH FLAG SWITCHES ON
 *   addressConfirmed: true   street, PIN, landmark, map embed, directions link,
 *                            opening hours and served localities in structured
 *                            data (lib/seo-schemas.ts, lib/seo/locations.ts)
 *   geo.verified: true       coordinates in structured data
 *   photos: [...]            the site's image in structured data
 * While a flag is false the pages say "call for exact directions" and the
 * structured data gives the locality only. Setting a flag is how a fact gets
 * published; never set one to make a page look fuller.
 */

export interface Location {
  slug: string
  /** Branch name as it appears on the Google Business Profile. */
  name: string
  shortName: string
  city: string
  streetAddress: string
  /** Nearby landmark — how people in J&K actually give directions. */
  landmark: string
  /** Localities this branch realistically serves, for on-page copy. */
  areasServed: string[]
  region: string
  /** Empty when the company has not supplied it. Never guessed. */
  postalCode: string
  /** False when only the locality is known — pages then say "address on request". */
  addressConfirmed: boolean
  phone: string
  /** E.164, for tel: links and schema. */
  phoneE164: string
  email: string
  geo: { latitude: number; longitude: number; verified: boolean }
  /** Google Maps directions link. */
  mapUrl: string
  /**
   * Real photographs of this site (frontage, yard), as site paths or absolute
   * URLs. Optional and empty today: none has been supplied. Structured data
   * uses these as the site's image and falls back to nothing, never the logo.
   */
  photos?: string[]
  hours: { days: string[]; opens: string; closes: string }[]
  /** What this branch actually does. */
  services: string[]
  isPrimary: boolean
  /** Short blurb used on the hub page. */
  blurb: string
}

const STANDARD_HOURS = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:30',
    closes: '18:30',
  },
]

/**
 * The switchboard number published on amgroupind.com (header, footer, schema
 * and the WhatsApp widget all use it). It replaced a sequential dummy number
 * (+91 94191 00000) on 2026-11-14.
 */
const MAIN_PHONE = '+91 94842 00000'
const MAIN_PHONE_E164 = '+919484200000'

// "Used car sales", not "Certified pre-owned car sales": nothing on record
// says who certifies the cars or against what checklist, and this label is
// printed on pages and in structured data for every site.
const USED_CAR_SERVICES = [
  'Used car sales',
  'Test drives',
  'Sell or exchange your car',
  'Car finance assistance',
  'RC & insurance transfer',
]

/**
 * The three used-car sites, all in Jammu.
 *
 * This list used to hold a Jammu site and a Srinagar office. The managing
 * director's instruction of 2026-11-14 is that used cars are sold from three
 * Jammu locations: Nanak Nagar, AM Auto Square at Gangyal, and AM Business
 * Park. There is no Srinagar used-car location.
 *
 * WHAT IS CONFIRMED AND WHAT IS NOT. Only AM Business Park has a street
 * address on record. For Nanak Nagar and Gangyal the company has given a
 * locality and nothing else, so `streetAddress` is the locality, `postalCode`
 * is empty and `addressConfirmed` is false — pages show "exact address on
 * request" rather than a guessed street. Fill these in from the Google
 * Business Profile for each site; do not approximate them.
 */
export const LOCATIONS: Location[] = [
  {
    slug: 'jammu',
    name: 'AM Group Used Cars — AM Business Park',
    shortName: 'AM Business Park',
    city: 'Jammu',
    streetAddress: 'AM Business Park, N-H 1 Bye-Pass Road',
    landmark: 'Opposite Jammu Railway Station',
    areasServed: [
      'Channi Himmat', 'Gandhi Nagar', 'Trikuta Nagar', 'Bahu Plaza', 'Talab Tillo',
      'Satwari', 'Rehari', 'Bakshi Nagar', 'Sidhra',
    ],
    region: 'Jammu and Kashmir',
    postalCode: '180012',
    addressConfirmed: true,
    phone: MAIN_PHONE,
    phoneE164: MAIN_PHONE_E164,
    email: 'info@amgroupind.com',
    // TODO: replace with the exact pin from the Google Business Profile.
    geo: { latitude: 32.7266, longitude: 74.857, verified: false },
    mapUrl:
      'https://www.google.com/maps/dir/?api=1&destination=AM+Business+Park+NH+1+Bye+Pass+Road+Jammu+180012',
    hours: STANDARD_HOURS,
    services: USED_CAR_SERVICES,
    isPrimary: true,
    blurb:
      'On the N-H 1 Bye-Pass Road, opposite the railway station. Walk in during opening hours ' +
      'to see used cars and get your own car valued.',
  },
  {
    slug: 'nanak-nagar',
    name: 'AM Group Used Cars — Nanak Nagar',
    shortName: 'Nanak Nagar',
    city: 'Jammu',
    streetAddress: 'Nanak Nagar',
    landmark: 'Nanak Nagar, Jammu',
    // Not supplied by the company — left empty rather than guessed.
    areasServed: [],
    region: 'Jammu and Kashmir',
    postalCode: '',
    addressConfirmed: false,
    phone: MAIN_PHONE,
    phoneE164: MAIN_PHONE_E164,
    email: 'info@amgroupind.com',
    // Locality centre only — NOT a pin for the showroom. Replace before launch.
    geo: { latitude: 32.7, longitude: 74.866, verified: false },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=AM+Group+Nanak+Nagar+Jammu',
    hours: STANDARD_HOURS,
    services: USED_CAR_SERVICES,
    isPrimary: false,
    blurb:
      'Our used-car location in Nanak Nagar. Call before you come and we will confirm which ' +
      'cars are on site and give you exact directions.',
  },
  {
    slug: 'gangyal',
    name: 'AM Group Used Cars — AM Auto Square, Gangyal',
    shortName: 'AM Auto Square, Gangyal',
    city: 'Jammu',
    streetAddress: 'AM Auto Square, Gangyal',
    landmark: 'Gangyal, Jammu',
    // Not supplied by the company — left empty rather than guessed.
    areasServed: [],
    region: 'Jammu and Kashmir',
    postalCode: '',
    addressConfirmed: false,
    phone: MAIN_PHONE,
    phoneE164: MAIN_PHONE_E164,
    email: 'info@amgroupind.com',
    // Locality centre only — NOT a pin for the showroom. Replace before launch.
    geo: { latitude: 32.676, longitude: 74.866, verified: false },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=AM+Auto+Square+Gangyal+Jammu',
    hours: STANDARD_HOURS,
    services: USED_CAR_SERVICES,
    isPrimary: false,
    blurb:
      'AM Auto Square at Gangyal. Call before you come and we will confirm which cars are on ' +
      'site and give you exact directions.',
  },
]

/**
 * The Hyundai Promise (H Promise) used-car line.
 *
 * TODO(client): the managing director asked for this number on the site on
 * 2026-11-14 but it has not been supplied. Set NEXT_PUBLIC_HPROMISE_PHONE to a
 * 10-digit mobile number and every surface that reads H_PROMISE picks it up;
 * while it is unset nothing renders, so no page shows a guessed number.
 */
const hpDigits = (process.env.NEXT_PUBLIC_HPROMISE_PHONE || '').replace(/\D/g, '').slice(-10)
export const H_PROMISE: { phone: string; phoneE164: string } | null =
  hpDigits.length === 10
    ? { phone: `+91 ${hpDigits.slice(0, 5)} ${hpDigits.slice(5)}`, phoneE164: `+91${hpDigits}` }
    : null

export const PRIMARY_LOCATION = LOCATIONS.find((l) => l.isPrimary) ?? LOCATIONS[0]

export function getLocation(slug: string): Location | null {
  return LOCATIONS.find((l) => l.slug === slug.toLowerCase()) ?? null
}

/** "Mon–Sat, 9:30 am – 6:30 pm" */
export function formatHours(location: Location): string {
  return location.hours
    .map((h) => {
      const span =
        h.days.length > 1 ? `${h.days[0].slice(0, 3)}–${h.days[h.days.length - 1].slice(0, 3)}` : h.days[0].slice(0, 3)
      const to12 = (t: string) => {
        const [hh, mm] = t.split(':').map(Number)
        const suffix = hh >= 12 ? 'pm' : 'am'
        const h12 = hh % 12 === 0 ? 12 : hh % 12
        return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
      }
      return `${span}, ${to12(h.opens)} – ${to12(h.closes)}`
    })
    .join(' · ')
}

/**
 * WhatsApp number in wa.me form — digits only, country code, no "+".
 *
 * IMPORTANT: this must be a number that is actually registered on WhatsApp
 * (ideally WhatsApp Business). A wa.me link to a number with no WhatsApp
 * account opens a dead "phone number shared via url is invalid" screen, which
 * is worse than having no button. Override with NEXT_PUBLIC_WHATSAPP_NUMBER if
 * the WhatsApp line differs from the switchboard.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') ||
  PRIMARY_LOCATION.phoneE164.replace(/\D/g, '')

/** Build a wa.me link with a prefilled message. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/** Full one-line address, for display and for NAP consistency checks. */
export function formatAddress(location: Location): string {
  const tail = [location.region, location.postalCode].filter(Boolean).join(' ')
  const street =
    location.streetAddress.toLowerCase().includes(location.city.toLowerCase())
      ? location.streetAddress
      : `${location.streetAddress}, ${location.city}`
  return `${street}, ${tail}`
}
