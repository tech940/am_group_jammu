import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getAllVehicleSlugs, getVehicleBySlug } from "@/lib/inventory/server"
import { idFromSlug } from "@/lib/inventory/adapter"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { buildSellerNotes, buildVehicleFaqs } from "@/lib/seo/content"
import { getFrequentSearches, getSeoLinks } from "@/lib/seo/links"
import { LOCATIONS, PRIMARY_LOCATION } from "@/lib/locations"
import VehicleClient from "./vehicle-client"
import { SITE_URL } from "@/lib/seo/site"

const SITE = SITE_URL

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllVehicleSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

/** "2021 Hyundai Creta SX Diesel" — year and fuel added only when the title lacks them. */
function vehicleName(v: InventoryVehicle): string {
  const lower = v.title.toLowerCase()
  const year = v.year !== null && !lower.includes(String(v.year)) ? `${v.year} ` : ""
  const fuel = v.fuel && !lower.includes(v.fuel.toLowerCase()) ? ` ${v.fuel}` : ""
  return `${year}${v.title}${fuel}`
}

/**
 * The shared copy builders in lib/seo/content.ts still carry two facts that are
 * no longer true: the retired placeholder phone number, and the claim that every
 * car is kept at AM Business Park. Stock is spread over three Jammu sites. Until
 * that file is corrected, this page corrects what it renders (and what it puts
 * in FAQPage schema) so a buyer is never sent to the wrong number or the wrong
 * site. Both corrections are no-ops once the source text is fixed.
 */
const RETIRED_PHONE = /\+91[\s-]?94191[\s-]?00000/g
const fixPhone = (text: string) => text.replace(RETIRED_PHONE, PRIMARY_LOCATION.phone)

const SITE_NAMES = LOCATIONS.map((l) => l.shortName).join(", ")
const WHERE_TO_SEE =
  `Yes. Our used cars are kept at our Jammu sites (${SITE_NAMES}). ` +
  `Call ${PRIMARY_LOCATION.phone} before you come and we will confirm which location this car is at. ` +
  `You are welcome to bring your own mechanic, and we will arrange a test drive on request.`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { vehicle } = await getVehicleBySlug(slug)

  if (!vehicle) return { title: "Vehicle Not Found", robots: "noindex" }

  const name = vehicleName(vehicle)
  // `absolute` so the root "%s | AM Group Jammu" template is not appended to a
  // title that already ends in the site name.
  const title =
    `${name}${vehicle.price !== null ? ` — ${vehicle.priceShort}` : ""} | Used car in Jammu | AM Group`

  const facts = [
    vehicle.mileage !== null ? vehicle.mileageLabel : null,
    vehicle.fuel,
    vehicle.transmission,
  ].filter(Boolean)

  const description = [
    `Used ${vehicle.year !== null ? `${vehicle.year} ` : ""}${vehicle.title} for sale in Jammu` +
      `${facts.length ? `: ${facts.join(", ")}` : ""}.`,
    vehicle.price !== null ? `Price ${vehicle.priceLabel}.` : "Call for price.",
    `See the photos and ask AM Group for the best price, or call ${PRIMARY_LOCATION.phone}.`,
  ].join(" ")

  const url = `/inventory/${vehicle.slug}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "AM Group Used Cars",
      locale: "en_IN",
      title,
      description,
      images: vehicle.primaryImage ? [{ url: vehicle.primaryImage, alt: name }] : undefined,
    },
    twitter: {
      card: vehicle.primaryImage ? "summary_large_image" : "summary",
      title,
      description,
      images: vehicle.primaryImage ? [vehicle.primaryImage] : undefined,
    },
  }
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params
  const { vehicle, similar, canonicalSlug, position, total, prev, next } =
    await getVehicleBySlug(slug)

  if (!vehicle) notFound()

  // Keep one canonical URL per listing: a stale or hand-typed slug that still
  // carries the right ID redirects instead of serving duplicate content.
  if (canonicalSlug && canonicalSlug !== slug && idFromSlug(slug) === vehicle.id) {
    redirect(`/inventory/${canonicalSlug}`)
  }

  const sellerNotes = buildSellerNotes(vehicle).map(fixPhone)
  const faqs = buildVehicleFaqs(vehicle).map((faq) => ({
    question: faq.question,
    answer: faq.answer.includes("AM Business Park") ? WHERE_TO_SEE : fixPhone(faq.answer),
  }))
  const [frequentSearches, seoLinks] = await Promise.all([getFrequentSearches(30), getSeoLinks()])

  const pageUrl = `${SITE}/inventory/${vehicle.slug}`

  /* Car + Offer. Every property is conditional on the listing actually having
     the value; the seller block comes from lib/locations so it cannot drift
     from the NAP shown elsewhere. BreadcrumbList is emitted by <Breadcrumbs>
     and FAQPage by <FaqSection>, both in the server-rendered HTML. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${pageUrl}#car`,
    name: vehicleName(vehicle),
    url: pageUrl,
    sku: String(vehicle.id),
    description: sellerNotes[0],
    ...(vehicle.make ? { brand: { "@type": "Brand", name: vehicle.make } } : {}),
    ...(vehicle.make ? { manufacturer: { "@type": "Organization", name: vehicle.make } } : {}),
    ...(vehicle.model ? { model: vehicle.model } : {}),
    ...(vehicle.year
      ? { productionDate: String(vehicle.year), vehicleModelDate: String(vehicle.year) }
      : {}),
    ...(vehicle.fuel ? { fuelType: vehicle.fuel } : {}),
    ...(vehicle.transmission ? { vehicleTransmission: vehicle.transmission } : {}),
    ...(vehicle.drivetrain ? { driveWheelConfiguration: vehicle.drivetrain } : {}),
    ...(vehicle.bodyType ? { bodyType: vehicle.bodyType } : {}),
    ...(vehicle.colour ? { color: vehicle.colour } : {}),
    ...(vehicle.engine ? { vehicleEngine: { "@type": "EngineSpecification", name: vehicle.engine } } : {}),
    ...(vehicle.mileage !== null
      ? {
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: vehicle.mileage,
            unitCode: "KMT",
          },
        }
      : {}),
    ...(vehicle.images.length > 0 ? { image: vehicle.images } : {}),
    itemCondition: "https://schema.org/UsedCondition",
    ...(vehicle.price !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: vehicle.price,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/UsedCondition",
            url: pageUrl,
            seller: {
              "@type": "AutoDealer",
              name: PRIMARY_LOCATION.name,
              url: SITE,
              telephone: PRIMARY_LOCATION.phoneE164,
              email: PRIMARY_LOCATION.email,
              areaServed: PRIMARY_LOCATION.city,
              address: {
                "@type": "PostalAddress",
                streetAddress: `${PRIMARY_LOCATION.streetAddress}, ${PRIMARY_LOCATION.landmark}`,
                addressLocality: PRIMARY_LOCATION.city,
                addressRegion: PRIMARY_LOCATION.region,
                ...(PRIMARY_LOCATION.postalCode ? { postalCode: PRIMARY_LOCATION.postalCode } : {}),
                addressCountry: "IN",
              },
            },
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VehicleClient
        vehicle={vehicle}
        similar={similar}
        sellerNotes={sellerNotes}
        faqs={faqs}
        frequentSearches={frequentSearches}
        seoGroups={seoLinks.groups}
        position={position}
        total={total}
        prev={prev}
        next={next}
      />
    </>
  )
}
