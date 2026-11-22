import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getAllVehicleSlugs, getInventory, getVehicleBySlug } from "@/lib/inventory/server"
import { idFromSlug } from "@/lib/inventory/adapter"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { buildSellerNotes, buildVehicleFaqs } from "@/lib/seo/content"
import { getLandingHrefResolver } from "@/lib/seo/landing"
import { getFrequentSearches } from "@/lib/seo/links"
import { getLocation, PRIMARY_LOCATION } from "@/lib/locations"
import { dealerId, jsonLdString, siteDealerId, websiteId } from "@/lib/seo-schemas"
import { searchImageUrl, INDEX_ROBOTS, DEALER_NAME, OG_IMAGE, SITE_URL } from "@/lib/seo/site"
import {
  carFactFaqs,
  carGraph,
  carHeading,
  carMetaDescription,
  carSummary,
  carTitle,
  descriptionParagraphs,
  soldCarTitle,
} from "./car-facts"
import VehicleClient from "./vehicle-client"
import type { CarLink } from "./vehicle-client"

type Props = {
  params: Promise<{ slug: string }>
}

const PHONE = PRIMARY_LOCATION.phone

/** Only cars on sale are built ahead of time. A sold car's page is made on request. */
export async function generateStaticParams() {
  const slugs = await getAllVehicleSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

/**
 * The site a car is kept at, when the stock record names one that
 * lib/locations.ts knows. A slug that matches no site is treated as "not
 * recorded", so a typing slip in the admin can never invent a location.
 */
function siteOf(v: InventoryVehicle) {
  return v.locationSlug ? getLocation(v.locationSlug) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { vehicle, soldVehicle } = await getVehicleBySlug(slug)
  const car = vehicle ?? soldVehicle

  if (!car) return { title: "Vehicle Not Found", robots: "noindex" }

  const sold = vehicle === null
  const onSale = (await getInventory()).vehicles
  const name = carHeading(car, onSale)
  // `absolute` so the root "%s | AM Group" template is not appended to a title
  // that already ends in the site name.
  const title = sold ? soldCarTitle(car) : carTitle(car, onSale)
  const description = carMetaDescription(car, { phone: PHONE, sold })
  const url = `/inventory/${car.slug}`
  // A car with no photograph still needs a share image; the site's default
  // stands in rather than leaving the tag out.
  // Through the site's own image route: see searchImageUrl.
  const photo = car.primaryImage ? searchImageUrl(car.primaryImage) : null

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // A sold car's page stays in the index for as long as it is served (see
    // SOLD_PAGE_RETENTION_DAYS); after that the address is a 404.
    robots: INDEX_ROBOTS,
    openGraph: {
      type: "website",
      url,
      siteName: DEALER_NAME,
      locale: "en_IN",
      title,
      description,
      images: photo ? [{ url: photo, alt: name }] : [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [photo ?? OG_IMAGE.url],
    },
  }
}

/** "SUV" -> "SUVs", "Hatchback" -> "Hatchbacks". */
const plural = (label: string) => (/s$/i.test(label) ? label : `${label}s`)

/**
 * Where this car's page links up to.
 *
 * lib/seo/landing.ts decides which pages exist: its resolver is asked for the
 * page for this car's make, model, body, fuel and gearbox, and answers with
 * the address that is indexed for those cars, or nothing. A filter address
 * such as /inventory?make=Hyundai is never used here: those are marked
 * noindex, so a link to one passes nothing on. A page that does not exist is
 * left out rather than pointed at a search.
 */
async function linksUp(v: InventoryVehicle): Promise<{
  /** The page for "used cars in Jammu", the top of the trail. */
  head: string
  brand: CarLink | null
  model: CarLink | null
  more: CarLink[]
}> {
  const hrefFor = await getLandingHrefResolver()
  type Facet = Parameters<typeof hrefFor>[0]
  const link = (value: string | null, kind: Exclude<Facet["kind"], "budget" | "city">, label: string): CarLink | null => {
    const href = value ? hrefFor({ kind, value }) : null
    return href ? { label, href } : null
  }

  const brand = link(v.make, "make", `Used ${v.make} cars in Jammu`)
  const model = link(v.model, "model", `Used ${[v.make, v.model].filter(Boolean).join(" ")} in Jammu`)
  const more = [
    link(v.bodyType, "body", `Used ${plural(v.bodyType ?? "")} in Jammu`),
    link(v.fuel, "fuel", `Used ${(v.fuel ?? "").toLowerCase()} cars in Jammu`),
    link(v.transmission, "transmission", `Used ${(v.transmission ?? "").toLowerCase()} cars in Jammu`),
  ].filter((l): l is CarLink => l !== null)

  // Up to the car's budget page: the smallest band the car is under, e.g. a
  // car at 4.8 lakh links to "Used cars under 5 lakh in Jammu". No car page
  // linked to a budget page before, so those pages had almost no links in.
  // Only when the band has a page of its own (a band that holds every car
  // points at the city page, which the trail already links).
  // Not from a sold car (it is no longer on that page), and only to a band
  // with at least two cars: a smaller band is not indexed.
  const { vehicles: onSale } = await getInventory()
  if (v.price !== null && onSale.some((c) => c.id === v.id)) {
    const lakhs = [2, 3, 5, 7, 10, 15].find((l) => v.price !== null && v.price < l * 100_000)
    const inBand = lakhs ? onSale.filter((c) => c.price !== null && c.price < lakhs * 100_000).length : 0
    const href = lakhs && inBand >= 2 ? hrefFor({ kind: "budget", lakhs }) : null
    if (lakhs && href && href.includes(`under-${lakhs}-lakh`)) {
      more.unshift({ label: `Used cars under ${lakhs} lakh in Jammu`, href })
    }
  }

  // When a make has one model in stock, the two share one indexed page (the
  // resolver hands back the same address for both). It is then listed once.
  const taken = new Set<string>(brand ? [brand.href] : [])
  const once = (l: CarLink | null) => (l && !taken.has(l.href) ? (taken.add(l.href), l) : null)

  return {
    head: hrefFor({ kind: "city" }) ?? "/inventory",
    brand,
    model: once(model),
    more: more.map(once).filter((l): l is CarLink => l !== null),
  }
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params
  const { vehicle, soldVehicle, similar, canonicalSlug, position, total, prev, next } =
    await getVehicleBySlug(slug)

  // On sale, or sold recently enough to still have a page. Anything else (a
  // draft, a deleted car, one sold long ago, a number that never existed) is
  // a real 404.
  const car = vehicle ?? soldVehicle
  if (!car) notFound()
  const sold = vehicle === null

  // One address per car, for good: a stale or hand-typed slug that still ends
  // in the right stock number is sent to the current one with a permanent
  // redirect (308), so search engines move what they know to it.
  if (canonicalSlug && canonicalSlug !== slug && idFromSlug(slug) === car.id) {
    permanentRedirect(`/inventory/${canonicalSlug}`)
  }

  const site = siteOf(car)
  const pageUrl = `${SITE_URL}/inventory/${car.slug}`

  const [frequentSearches, up, { vehicles: onSale }] = await Promise.all([
    getFrequentSearches(30),
    linksUp(car),
    getInventory(),
  ])

  // The heading, the last crumb and the structured data's name: the car's
  // name, plus a recorded fact or two when another car on sale has the same
  // name (see carHeading). Sentences about the car keep the plain name.
  const name = carHeading(car, onSale)

  const summary = carSummary(car, { site, dealer: DEALER_NAME, phone: PHONE, sold })
  const dealerNotes = descriptionParagraphs(car.description)

  // The generated notes and questions describe a car that is for sale ("is
  // available now", "if it is shown here it has not been sold"). On a sold
  // car's page every one of those would be false, so none is rendered.
  const sellerNotes = sold ? [] : buildSellerNotes(car)
  const faqs = sold
    ? []
    : // The site is handed in, so the "can I see it" answer names it when the
      // record does (lib/seo/content.ts).
      [...buildVehicleFaqs(car, site), ...carFactFaqs(car, { site, phone: PHONE })]

  // The visible trail. <Breadcrumbs> writes the BreadcrumbList from these same
  // items, so the structured data cannot name a page the trail does not.
  const crumbs = [
    { label: "Used Cars in Jammu", href: up.head },
    ...(up.brand && car.make ? [{ label: `Used ${car.make} Cars`, href: up.brand.href }] : []),
    ...(up.model && car.model ? [{ label: [car.make, car.model].filter(Boolean).join(" "), href: up.model.href }] : []),
    { label: name },
  ]

  const browseLinks: CarLink[] = [
    ...(up.brand ? [up.brand] : []),
    ...(up.model ? [up.model] : []),
    ...up.more,
    { label: "All used cars in stock", href: "/inventory" },
  ]

  const graph = carGraph({
    vehicle: car,
    name,
    pageUrl,
    // The dealer's own words, when there are any, follow the plain summary.
    description: [summary, ...dealerNotes].join(" "),
    site,
    sold,
    ids: { dealer: dealerId(), website: websiteId(), site: siteDealerId },
  })

  return (
    <>
      {/* jsonLdString escapes "<", so a "</script>" typed into a car's
          description in the admin panel cannot end this element early. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(graph) }} />
      <VehicleClient
        vehicle={car}
        name={name}
        sold={sold}
        summary={summary}
        dealerNotes={dealerNotes}
        sellerNotes={sellerNotes}
        faqs={faqs}
        crumbs={crumbs}
        browseLinks={browseLinks}
        // Where "See similar cars" goes on a sold car's page: the closest
        // page that still has cars on it.
        upLink={up.model ?? up.brand ?? { label: "All used cars in stock", href: "/inventory" }}
        site={
          site
            ? {
                slug: site.slug,
                shortName: site.shortName,
                city: site.city,
                // A street is shown only for a site whose address is confirmed.
                address: site.addressConfirmed ? `${site.streetAddress}, ${site.landmark}` : null,
              }
            : null
        }
        similar={similar}
        frequentSearches={frequentSearches}
        position={position}
        total={total}
        prev={prev}
        next={next}
      />
    </>
  )
}
