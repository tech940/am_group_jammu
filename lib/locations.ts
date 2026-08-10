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
  postalCode: string
  phone: string
  /** E.164, for tel: links and schema. */
  phoneE164: string
  email: string
  geo: { latitude: number; longitude: number; verified: boolean }
  /** Google Maps directions link. */
  mapUrl: string
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

export const LOCATIONS: Location[] = [
  {
    slug: 'jammu',
    name: 'AM Group Jammu — AM Business Park',
    shortName: 'Jammu',
    city: 'Jammu',
    streetAddress: 'AM Business Park, N-H 1 Bye-Pass Road',
    landmark: 'Opposite Jammu Railway Station',
    areasServed: [
      'Channi Himmat', 'Gandhi Nagar', 'Trikuta Nagar', 'Bahu Plaza', 'Talab Tillo',
      'Satwari', 'Nanak Nagar', 'Rehari', 'Bakshi Nagar', 'Digiana', 'Sidhra',
    ],
    region: 'Jammu and Kashmir',
    postalCode: '180012',
    phone: '+91 94191 00000',
    phoneE164: '+919419100000',
    email: 'info@amgroupind.com',
    // TODO: replace with the exact pin from the Jammu Google Business Profile.
    geo: { latitude: 32.7266, longitude: 74.857, verified: false },
    mapUrl:
      'https://www.google.com/maps/dir/?api=1&destination=AM+Business+Park+NH+1+Bye+Pass+Road+Jammu+180012',
    hours: STANDARD_HOURS,
    services: [
      'Certified pre-owned car sales',
      'Test drives',
      'Car finance assistance',
      'Part-exchange valuation',
      'RC & insurance transfer',
      'Service and workshop',
    ],
    isPrimary: true,
    blurb:
      'Our flagship site on the N-H 1 Bye-Pass Road, opposite the railway station. All certified ' +
      'pre-owned stock is held here and can be inspected without an appointment.',
  },
  {
    slug: 'srinagar',
    name: 'AM Group Srinagar — AM Tower',
    shortName: 'Srinagar',
    city: 'Srinagar',
    streetAddress: 'AM Tower, Hyderpora Bye-Pass',
    landmark: 'Hyderpora Bye-Pass, near the airport road',
    areasServed: [
      'Hyderpora', 'Rawalpora', 'Bemina', 'Sanat Nagar', 'Baghat', 'Natipora',
      'Barzulla', 'Rambagh', 'Budgam',
    ],
    region: 'Jammu and Kashmir',
    postalCode: '190014',
    phone: '+91 94191 00000',
    phoneE164: '+919419100000',
    email: 'info@amgroupind.com',
    // TODO: replace with the exact pin from the Srinagar Google Business Profile.
    geo: { latitude: 34.0179, longitude: 74.7847, verified: false },
    mapUrl:
      'https://www.google.com/maps/dir/?api=1&destination=AM+Tower+Hyderpora+Bye+Pass+Srinagar+190014',
    hours: STANDARD_HOURS,
    services: [
      'Certified pre-owned car sales',
      'Test drives by appointment',
      'Car finance assistance',
      'Part-exchange valuation',
      'RC & insurance transfer',
    ],
    isPrimary: false,
    blurb:
      'Our Kashmir Valley office at AM Tower on the Hyderpora Bye-Pass. Cars from the Jammu stock ' +
      'can be brought here for inspection — call ahead so we have the one you want on site.',
  },
]

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
  return `${location.streetAddress}, ${location.city}, ${location.region} ${location.postalCode}`
}
