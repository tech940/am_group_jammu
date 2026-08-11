"use client"

import React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

export default function RealEstatePage() {
  const reduce = useReducedMotion()
  const enter = reduce ? false : { opacity: 0, y: 8 }

  return (
    <div className="min-h-screen bg-ground">
      {/* Hero Section with Official Image */}
      <section
        data-ground="deep"
        className="relative flex min-h-[70vh] items-center overflow-hidden bg-deep text-on-deep"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://amgroupind.com/wp-content/uploads/2024/10/real-estate.jpg"
            alt="AM Real Estate"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          {/* Scrim: keeps the hero copy legible over photography. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-deep via-deep/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pt-32 md:px-10">
          <div className="max-w-4xl">
            <motion.div
              initial={enter}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-10 inline-flex items-center gap-4">
                <div aria-hidden className="h-px w-12 bg-line-on-deep" />
                <span className="text-meta uppercase text-on-deep-2">
                  Development Portfolio
                </span>
              </div>

              <h1 className="mb-12 font-display text-display uppercase text-on-deep">
                Real <br />
                <span className="text-on-deep-2">Estate</span>
              </h1>

              <p className="mb-12 max-w-2xl border-l border-line-on-deep pl-10 text-body-lg text-on-deep-2">
                The AM Group specializes in real estate developments, including building apartments,
                villas, automotive dealerships, and remodeling. We are committed to delivering high-quality
                properties that meet the specific needs of our clients.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
           <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
              <motion.div
                initial={enter}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                <h2 className="mb-8 font-display text-h1 uppercase text-ink">
                  Expertise &amp; <span className="text-ink-3">Innovation</span>
                </h2>
                <p className="mb-8 text-body-lg text-ink-2">
                  With extensive experience in the industry, we bring expertise and innovation to every project. From luxurious residential villas to specialized automotive dealerships, our developments are a testament to our commitment to excellence.
                </p>
                <div className="grid grid-cols-2 gap-8">
                   {[
                     { label: "Design", value: "Modern" },
                     { label: "Quality", value: "Premium" },
                     { label: "Projects", value: "25+" },
                     { label: "Legacy", value: "Decades" }
                   ].map((stat) => (
                     <div key={stat.label} className="border-l border-line pl-6">
                        <div className="mb-1 text-meta uppercase text-ink-2">{stat.label}</div>
                        <div data-num className="font-display text-h3 uppercase text-ink">{stat.value}</div>
                     </div>
                   ))}
                </div>
              </motion.div>

              {/* Video Showcase Placeholder */}
              <motion.div
                initial={enter}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="relative aspect-video overflow-hidden border border-line bg-deep-2"
              >
                <iframe
                  src="https://www.youtube.com/embed/yQ1dFQMrZuQ?rel=0&showinfo=0"
                  className="absolute inset-0 w-full h-full"
                  title="The Amaltas One"
                  allowFullScreen
                />
              </motion.div>
           </div>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="bg-ground-2 py-20 md:py-28">
        <div className="mx-auto mb-16 max-w-[1400px] px-5 text-center md:px-10">
           <span className="mb-4 block text-meta uppercase text-ink-2">Our Projects</span>
           <h2 className="font-display text-h1 uppercase text-ink">Architectural <span className="text-ink-3">Masterpieces</span></h2>
        </div>

        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              "https://amgroupind.com/wp-content/uploads/2024/10/02.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/01.png",
              "https://amgroupind.com/wp-content/uploads/2024/10/03.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/04.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/05.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/triumph-1.jpg",
              "https://amgroupind.com/wp-content/uploads/2025/01/be709646-8ac1-43d5-b3aa-01164b776500.jpg",
              "https://amgroupind.com/wp-content/uploads/2025/01/IMG_9035.jpeg"
            ].map((src, index) => (
              <motion.div
                key={index}
                initial={enter}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="group relative break-inside-avoid overflow-hidden border border-line"
              >
                {/* Intrinsic dimensions are unknown for this masonry column, so
                    this stays a plain <img> rather than a mis-sized next/image. */}
                <img
                  src={src}
                  alt={`Project ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
                {/* Scrim over photography — carries the caption on hover. */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-transparent to-transparent p-8 opacity-0 transition-opacity duration-(--duration-2) group-hover:opacity-100">
                   <div className="text-on-deep">
                      <div className="mb-2 text-meta uppercase text-on-deep-2">Signature Project</div>
                      <div className="font-display text-h3 uppercase">Premium Development</div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Highlight (Shared Style) */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Modern Design", desc: "Contemporary architectural masterpieces designed for the future." },
              { title: "Luxury Living", desc: "Thoughtfully crafted spaces with premium amenities and finishes." },
              { title: "Prime Locations", desc: "Developing properties in the most coveted neighborhoods." },
              { title: "Investment", desc: "High-value real estate opportunities with significant growth potential." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={enter}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="border-t border-line pt-6"
              >
                <h3 className="mb-4 font-display text-h3 uppercase text-ink">{item.title}</h3>
                <p className="text-body text-ink-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
