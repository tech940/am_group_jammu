import { Metadata } from "next"
import Image from "next/image"
import { FeaturedInventory } from "@/components/sections/inventory"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Globe, Phone } from "lucide-react"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1)
  
  return {
    title: `${brandName} Showroom in Jammu | AM Group`,
    description: `Discover the latest ${brandName} car models, price list, and exclusive offers at AM Group ${brandName} showroom in Jammu. Book a test drive today!`,
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1)

  return (
    <div className="flex flex-col">
      {/* Brand Hero */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-black pt-20">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
             src={`https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1600`} 
             className="h-full w-full object-cover" 
             alt={brandName}
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="container relative z-10 flex h-full items-center px-4 md:px-8">
           <div className="max-w-2xl">
              <span className="mb-4 inline-block text-sm font-bold uppercase tracking-[0.4em] text-primary gold-gradient">Official Partner</span>
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8">
                 {brandName}
              </h1>
              <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-12">
                 Experience the innovation and engineering excellence of {brandName}. From sustainable mobility to performance-driven icons, explore the future today.
              </p>
              <div className="flex space-x-6">
                 <Button className="bg-white text-black hover:bg-white/90 rounded-none h-14 px-10 uppercase tracking-widest text-xs font-bold">
                    Download Brochure
                 </Button>
                 <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none h-14 px-10 uppercase tracking-widest text-xs font-bold">
                    Contact Dealer
                 </Button>
              </div>
           </div>
        </div>
      </section>

      {/* Brand Info & Showrooms */}
      <section className="py-24 bg-zinc-950">
         <div className="container px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               <div className="lg:col-span-2">
                  <h2 className="text-3xl font-bold text-white mb-8">Why Choose {brandName} at AM Group?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {[
                       { title: "Exclusive Offers", desc: "Get best-in-class deals and corporate discounts exclusively at AM Group." },
                       { title: "Certified Service", desc: "Factory trained technicians and genuine spare parts for your peace of mind." },
                       { title: "Fast Delivery", desc: "Largest stock holding in North India ensures minimal waiting periods." },
                       { title: "Hassle-free Finance", desc: "Instant loan approvals and customized EMI plans to suit your budget." }
                     ].map((feature) => (
                       <div key={feature.title} className="space-y-4">
                          <h4 className="text-white font-bold uppercase tracking-wider text-sm">{feature.title}</h4>
                          <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="glass-dark p-8 border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">Locate Showroom</h3>
                  <div className="space-y-6">
                     <div className="p-4 bg-white/5 border border-white/10">
                        <span className="block text-white font-bold mb-1">AM {brandName} Jammu</span>
                        <span className="block text-xs text-white/40 mb-4">Bye Pass Road, Channi Himmat, Jammu</span>
                        <div className="flex space-x-4">
                           <a href="#" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> Directions
                           </a>
                           <a href="#" className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center">
                              <Phone className="h-3 w-3 mr-1" /> Call Now
                           </a>
                        </div>
                     </div>
                  </div>
                  <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-widest text-xs h-12 font-black">
                     Book Test Drive
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Brand Specific Inventory */}
      <div className="bg-black py-20 border-t border-white/5">
         <div className="container px-4 md:px-8 mb-12 text-center">
            <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Available {brandName} Models</h2>
         </div>
         <FeaturedInventory />
      </div>

      {/* SEO Content Section */}
      <section className="py-24 bg-zinc-950 border-t border-white/5">
         <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto prose prose-invert">
               <h2 className="text-white">Authorized {brandName} Dealer in Jammu</h2>
               <p className="text-white/60">
                 AM Group is proud to be the leading authorized {brandName} dealer in Jammu & Kashmir. We offer a comprehensive range of {brandName} vehicles, from the popular compacts to premium SUVs. Our state-of-the-art facility in Jammu provides a world-class car buying experience.
               </p>
               <h3 className="text-white">Latest {brandName} Models & Prices</h3>
               <p className="text-white/60">
                 Looking for the {brandName} price list in Jammu? Contact our sales team for the latest on-road prices, insurance options, and registration details for all {brandName} models including the latest electric vehicles.
               </p>
            </div>
         </div>
      </section>
    </div>
  )
}
