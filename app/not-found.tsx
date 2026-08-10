import Link from "next/link"
import { getInventory } from "@/lib/inventory/server"
import { Phone, Home, Search, ArrowRight, ChevronRight, MapPin } from "lucide-react"

export default async function NotFound() {
  // Pull a few real cars to show as suggestions
  let suggestedCars: Awaited<ReturnType<typeof getInventory>>["vehicles"] = []
  try {
    const { vehicles } = await getInventory()
    // Pick 3 random-ish recent cars
    suggestedCars = vehicles.slice(0, 3)
  } catch {
    // silently degrade — not-found must never throw
  }

  const quickLinks = [
    { label: "Browse All Used Cars", href: "/inventory", icon: Search },
    { label: "Go to Homepage", href: "/", icon: Home },
    { label: "Contact Us", href: "/contact", icon: Phone },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-[#012050] pt-32 pb-24 px-4">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#023468] opacity-60 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[#E31837]/20 blur-3xl" />
        </div>

        {/* Giant ghost "404" */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="text-[280px] md:text-[380px] font-black text-white/[0.03] leading-none tracking-tighter">
            404
          </span>
        </div>

        <div className="relative z-10 container mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E31837]/15 border border-[#E31837]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E31837] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E31837]">
              404 — Page Not Found
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            This page has<br />
            <span className="text-[#E31837]">driven off</span>
          </h1>

          <p className="text-base md:text-lg text-white/55 leading-relaxed max-w-xl mx-auto mb-10">
            The page you are looking for does not exist or may have been moved.
            Our inventory, however, is very much here — explore below.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/inventory"
              className="group inline-flex items-center gap-2.5 bg-[#E31837] hover:bg-[#c41230] text-white px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-[#E31837]/20"
            >
              Browse Inventory
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 hover:bg-white/15 text-white px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider transition-all"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 20C480 40 240 10 0 30L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-black/30 mb-8">
            Where would you like to go?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-black/8 hover:border-[#023468]/30 hover:bg-[#EBF0F8] transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-[#023468]/8 group-hover:bg-[#023468] flex items-center justify-center text-[#023468] group-hover:text-white transition-all flex-shrink-0">
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-[#023468] group-hover:text-[#023468]">
                  {link.label}
                </span>
                <ChevronRight className="h-4 w-4 text-black/25 group-hover:text-[#023468] ml-auto transition-all group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUGGESTED CARS ── (only if we got data) */}
      {suggestedCars.length > 0 && (
        <section className="py-14 px-4 bg-[#EBF0F8] border-t-2 border-[#023468]/10">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#E31837] mb-1">
                  While you&apos;re here
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-[#023468]">
                  Cars you might like
                </h2>
              </div>
              <Link
                href="/inventory"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#023468] hover:text-[#E31837] transition-colors"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {suggestedCars.map((car) => (
                <Link
                  key={car.id}
                  href={`/inventory/${car.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#023468]/10 hover:border-[#023468]/30 hover:shadow-xl transition-all duration-300"
                >
                  {/* Car image */}
                  <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                    {car.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/20">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 6h2l3 5v5h-2"/>
                        </svg>
                      </div>
                    )}
                    {/* Condition badge */}
                    {car.condition && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#023468] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {car.condition}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Car info */}
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#023468]/50 mb-0.5">
                      {car.year} · {car.make}
                    </p>
                    <h3 className="text-base font-black text-[#023468] mb-2 leading-snug group-hover:text-[#E31837] transition-colors line-clamp-1">
                      {car.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {car.fuel && (
                        <span className="text-[10px] font-bold text-black/50 bg-zinc-50 border border-black/8 px-2 py-0.5 rounded-full">
                          {car.fuel}
                        </span>
                      )}
                      {car.transmission && (
                        <span className="text-[10px] font-bold text-black/50 bg-zinc-50 border border-black/8 px-2 py-0.5 rounded-full">
                          {car.transmission}
                        </span>
                      )}
                      {car.mileageLabel && (
                        <span className="text-[10px] font-bold text-black/50 bg-zinc-50 border border-black/8 px-2 py-0.5 rounded-full">
                          {car.mileageLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black text-[#023468]">{car.priceLabel}</p>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#E31837] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 sm:hidden text-center">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#023468] hover:text-[#E31837] transition-colors"
              >
                View all cars <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT STRIP ── */}
      <section className="py-12 px-4 bg-white border-t border-black/5">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl bg-[#012050] p-8 md:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#E31837]/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#023468]/50 blur-3xl" />
            </div>
            <div className="relative z-10">
              <MapPin className="h-8 w-8 text-[#E31837] mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">
                Need help finding a car?
              </h2>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                Our team at AM Business Park, Jammu is available to help you find the right vehicle.
              </p>
              <a
                href="tel:+919419100000"
                className="inline-flex items-center gap-3 bg-white text-[#023468] px-8 py-3.5 rounded-full font-black text-sm hover:bg-[#E31837] hover:text-white transition-all shadow-lg"
              >
                <Phone className="h-4 w-4" />
                +91 94191 00000
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
