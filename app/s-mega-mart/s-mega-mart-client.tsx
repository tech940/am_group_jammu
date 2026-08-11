"use client"

import React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

export default function RetailPage() {
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
            src="https://amgroupind.com/wp-content/uploads/2025/04/2025-04-02-1024x768.jpg"
            alt="S Mega Mart Storefront"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
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
                  Our Retail Mission
                </span>
              </div>

              <h1 className="mb-12 font-display text-display uppercase text-on-deep">
                S Mega <br />
                <span className="text-on-deep-2">Mart</span>
              </h1>

              <p className="mb-12 max-w-2xl border-l border-line-on-deep pl-10 text-body-lg text-on-deep-2">
                At S Mega Mart, our mission is to become a trusted, nationwide destination
                for affordable shopping. We are committed to simplifying daily life
                through value-driven retail.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Strategy Section */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
           <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
              <motion.div
                initial={enter}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                <h2 className="mb-10 font-display text-h1 uppercase text-ink">
                  Our <span className="text-ink-3">Growth Strategy</span>
                </h2>
                <div className="space-y-8">
                   {[
                     { title: "Pan-India Expansion", desc: "Opening stores in key cities and towns to build a strong national presence." },
                     { title: "Value + Variety", desc: "Offering a wide product range from groceries to home appliances at unbeatable prices." },
                     { title: "Customer First", desc: "Prioritizing great service, clean stores, and a smooth shopping experience." },
                     { title: "Smart Operations", desc: "Leveraging technology for efficient inventory and future e-commerce growth." },
                     { title: "Local Connection", desc: "Hiring locally and stocking region-relevant products to support communities." }
                   ].map((item, i) => (
                     <div key={i} className="flex items-start gap-6">
                        <span aria-hidden className="mt-2 h-2 w-2 shrink-0 bg-accent" />
                        <div>
                           <h3 className="mb-2 font-display text-h4 uppercase text-ink">{item.title}</h3>
                           <p className="text-small text-ink-2">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>

              <motion.figure
                initial={enter}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="m-0"
              >
                <div className="relative aspect-square overflow-hidden border border-line">
                  <Image
                    src="https://amgroupind.com/wp-content/uploads/2025/04/2025-04-02-1024x768.jpg"
                    alt="S Mega Mart Operations"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-meta uppercase text-ink-2">
                  S Mega Mart Operations
                </figcaption>
              </motion.figure>
           </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section data-ground="deep" className="bg-deep-2 py-20 text-on-deep md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
           <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                 <span className="mb-4 block text-meta uppercase text-accent-text-dark">Future Outlook</span>
                 <h2 className="font-display text-h1 uppercase text-on-deep">Mission &amp; <span className="text-on-deep-2">Vision</span></h2>
              </div>

              <div className="grid gap-10 md:grid-cols-2">
                 <motion.div
                    initial={enter}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="border border-line-on-deep p-8 transition-colors duration-(--duration-1) hover:border-line-deep md:p-10"
                 >
                    <h3 className="mb-6 flex items-center gap-4 font-display text-h2 uppercase text-on-deep">
                       <span aria-hidden className="h-px w-10 shrink-0 bg-accent" />
                       Our Mission
                    </h3>
                    <p className="text-body-lg text-on-deep-2">
                       To provide every Indian household with a smart, affordable, and convenient shopping experience by offering a wide range of quality products under one roof. We aim to simplify daily life through value-driven retail.
                    </p>
                 </motion.div>

                 <motion.div
                    initial={enter}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="border border-line-on-deep p-8 transition-colors duration-(--duration-1) hover:border-line-deep md:p-10"
                 >
                    <h3 className="mb-6 flex items-center gap-4 font-display text-h2 uppercase text-on-deep">
                       <span aria-hidden className="h-px w-10 shrink-0 bg-accent" />
                       Our Vision
                    </h3>
                    <p className="text-body-lg text-on-deep-2">
                       To become India&apos;s most trusted and preferred hypermarket brand—known for affordability, variety, and customer-centric innovation—while creating a positive impact in every community we serve.
                    </p>
                 </motion.div>
              </div>
           </div>
        </div>
      </section>

      {/* Excellence Grid (Shared Style) */}
      <section className="bg-ground-2 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Curated Goods", desc: "A handpicked selection of daily essentials and premium global brands." },
              { title: "Premium Quality", desc: "Rigorous quality checks to ensure the best products for your family." },
              { title: "Freshness", desc: "Fresh produce and dairy products delivered daily to our shelves." },
              { title: "Customer Care", desc: "Dedicated support team committed to an exceptional shopping experience." },
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
