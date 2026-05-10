import { Metadata } from "next"
import { FeaturedInventory } from "@/components/sections/inventory"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ShieldCheck, Star } from "lucide-react"

type Props = {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params
  const cityName = location.charAt(0).toUpperCase() + location.slice(1)
  
  return {
    title: `Certified Used Cars in ${cityName} | Best Pre-owned Car Prices`,
    description: `Buy certified second hand cars in ${cityName} with warranty. Explore wide range of pre-owned cars at AM Group. Best prices, easy finance, and 200+ point quality check.`,
  }
}

export default async function LocationUsedCarsPage({ params }: Props) {
  const { location } = await params
  const cityName = location.charAt(0).toUpperCase() + location.slice(1)

  return (
    <div className="pt-24 min-h-screen bg-black">
      {/* City Hero */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-b from-zinc-900 to-black">
        <div className="container px-4 md:px-8">
           <div className="max-w-3xl">
              <span className="flex items-center text-primary gold-gradient text-xs font-black uppercase tracking-[0.3em] mb-4">
                 <MapPin className="h-4 w-4 mr-2" /> {cityName} Division
              </span>
              <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-8 uppercase">
                 Certified Pre-owned <br />
                 <span className="text-white/40 italic font-light">Cars in {cityName}</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                 Find your next perfect ride with AM Group&apos;s certified pre-owned program. 
                 Every car undergoes a rigorous 200+ point inspection to ensure you get nothing but the best.
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <div className="glass px-6 py-4 flex items-center space-x-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">6 Month Warranty</span>
                 </div>
                 <div className="glass px-6 py-4 flex items-center space-x-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Certified History</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* City Inventory */}
      <div className="py-12 bg-black">
         <div className="container px-4 md:px-8 flex justify-between items-center mb-12">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Stock in {cityName}</h2>
            <Button variant="outline" className="border-white/10 text-white rounded-none">
               Sort by Price
            </Button>
         </div>
         <FeaturedInventory />
      </div>

      {/* Local SEO Content */}
      <section className="py-24 bg-zinc-950 border-t border-white/5">
         <div className="container px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
               <div className="prose prose-invert max-w-none">
                  <h2 className="text-white">Why Buy Used Cars from AM Group {cityName}?</h2>
                  <p className="text-white/60">
                    Choosing a used car in {cityName} can be challenging. At AM Group, we simplify the process by providing transparent history, verified documentation, and mechanical certification for every vehicle in our showroom.
                  </p>
                  <ul>
                    <li className="text-white/60">Comprehensive 200+ Point Inspection</li>
                    <li className="text-white/60">Non-Accidental & Non-Flooded Certification</li>
                    <li className="text-white/60">Refurbished to OEM Standards</li>
                    <li className="text-white/60">On-the-spot Valuation for Exchange</li>
                  </ul>
               </div>
               
               <div className="glass-dark p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Visit Our {cityName} Yard</h3>
                  <p className="text-white/40 text-sm mb-8">
                    Walk in to experience a wide variety of brands under one roof. Our experts will help you find the best car for your needs.
                  </p>
                  <div className="space-y-4 mb-8">
                     <div className="flex items-center text-sm text-white/80">
                        <MapPin className="h-4 w-4 mr-3 text-primary" />
                        Main Market Area, {cityName}, J&K
                     </div>
                     <div className="flex items-center text-sm text-white/80">
                        <Search className="h-4 w-4 mr-3 text-primary" />
                        Open 10:00 AM - 7:00 PM
                     </div>
                  </div>
                  <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none h-14 font-black uppercase tracking-widest text-xs">
                     Get Exact Location
                  </Button>
               </div>
            </div>
         </div>
      </section>
    </div>
  )
}
