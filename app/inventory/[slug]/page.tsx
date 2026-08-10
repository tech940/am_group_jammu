import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getAllVehicleSlugs, getVehicleBySlug } from "@/lib/inventory/server"
import { idFromSlug } from "@/lib/inventory/adapter"
import { buildSellerNotes, buildVehicleFaqs } from "@/lib/seo/content"
import { getFrequentSearches, getSeoLinks } from "@/lib/seo/links"
import VehicleClient from "./vehicle-client"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllVehicleSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { vehicle } = await getVehicleBySlug(slug)

  if (!vehicle) return { title: "Vehicle Not Found", robots: "noindex" }

  const bits = [
    vehicle.year ? String(vehicle.year) : null,
    vehicle.title,
    vehicle.price !== null ? `for ${vehicle.priceLabel}` : null,
  ].filter(Boolean)

  const title = `${bits.join(" ")} in Jammu`
  const description = [
    `${vehicle.condition ?? "Used"} ${vehicle.title}`,
    vehicle.year ? `(${vehicle.year})` : null,
    vehicle.mileage !== null ? `with ${vehicle.mileageLabel} on the odometer` : null,
    vehicle.fuel ? `• ${vehicle.fuel}` : null,
    vehicle.transmission ? `• ${vehicle.transmission}` : null,
    `for sale at AM Group Jammu.`,
    vehicle.price !== null ? `Asking ${vehicle.priceLabel}.` : "Call for price.",
    "Book a test drive today.",
  ]
    .filter(Boolean)
    .join(" ")

  return {
    title,
    description,
    alternates: { canonical: `/inventory/${vehicle.slug}` },
    openGraph: {
      title,
      description,
      images: vehicle.primaryImage ? [{ url: vehicle.primaryImage, alt: vehicle.title }] : undefined,
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

  const sellerNotes = buildSellerNotes(vehicle)
  const faqs = buildVehicleFaqs(vehicle)
  const [frequentSearches, seoLinks] = await Promise.all([getFrequentSearches(30), getSeoLinks()])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.title,
    description: sellerNotes[0],
    ...(vehicle.make ? { brand: { "@type": "Brand", name: vehicle.make } } : {}),
    ...(vehicle.model ? { model: vehicle.model } : {}),
    ...(vehicle.year
      ? { productionDate: String(vehicle.year), vehicleModelDate: String(vehicle.year) }
      : {}),
    ...(vehicle.fuel ? { fuelType: vehicle.fuel } : {}),
    ...(vehicle.transmission ? { vehicleTransmission: vehicle.transmission } : {}),
    ...(vehicle.drivetrain ? { driveWheelConfiguration: vehicle.drivetrain } : {}),
    ...(vehicle.bodyType ? { bodyType: vehicle.bodyType } : {}),
    ...(vehicle.colour ? { color: vehicle.colour } : {}),
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
            url: `https://amgroupind.com/inventory/${vehicle.slug}`,
            seller: {
              "@type": "AutoDealer",
              name: "AM Group Jammu",
              telephone: "+91-94191-00000",
              address: {
                "@type": "PostalAddress",
                streetAddress: "AM Business Park, N-H 1 Bye-Pass Road, Opp. Railway Station",
                addressLocality: "Jammu",
                addressRegion: "Jammu and Kashmir",
                postalCode: "180012",
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
