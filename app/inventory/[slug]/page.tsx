import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getVehicleById, vehicles, Vehicle } from "@/lib/vehicle-data"
import { generateVehicleSchema } from "@/lib/seo-schemas"
import VehicleClient from "./vehicle-client"

type Props = {
  params: Promise<{ slug: string }>
}

// "₹ 46.05 Lakh*" -> 4605000 (INR) for the Offer schema
function parsePriceToINR(price: string): number | string {
  const value = parseFloat(price.replace(/[^\d.]/g, ""))
  if (isNaN(value)) return price
  return Math.round(value * 100000)
}

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vehicle = getVehicleById(slug)

  if (!vehicle) {
    return { title: "Vehicle Not Found" }
  }

  const title = `${vehicle.brand} ${vehicle.name} Price in Jammu - ${vehicle.price}`
  const description = `${vehicle.brand} ${vehicle.name} ${vehicle.type} at ${vehicle.price} ex-showroom in Jammu. Check specifications, features, and colours. Book a test drive at AM Group today.`

  return {
    title,
    description,
    alternates: {
      canonical: `/inventory/${vehicle.id}`,
    },
    openGraph: {
      title,
      description,
      images: [{ url: vehicle.image, alt: `${vehicle.brand} ${vehicle.name}` }],
    },
  }
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params
  const vehicle: Vehicle | undefined = getVehicleById(slug)

  if (!vehicle) {
    notFound()
  }

  const jsonLd = generateVehicleSchema({
    name: `${vehicle.brand} ${vehicle.name}`,
    description: vehicle.description ?? `${vehicle.brand} ${vehicle.name} ${vehicle.type} available at AM Group Jammu.`,
    brand: vehicle.brand,
    model: vehicle.name,
    engine: vehicle.specs.engine ?? "",
    fuelType: vehicle.specs.fuel ?? "",
    image: vehicle.image,
    priceValue: parsePriceToINR(vehicle.price),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VehicleClient vehicle={vehicle} />
    </>
  )
}
