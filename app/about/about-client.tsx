"use client"

import React from "react"
import Image from "next/image"
import { Settle } from "@/components/system/marks"

export default function AboutPage() {
  const timeline = [
    { year: "1968", title: "Gas HPCL", image: "https://amgroupind.com/wp-content/uploads/2024/10/HP.png" },
    { year: "1977", title: "IOCL", image: "https://amgroupind.com/wp-content/uploads/2024/10/IOCL.png" },
    { year: "2004", title: "Chevrolet", image: "https://amgroupind.com/wp-content/uploads/2024/10/Chevrolet-2.png" },
    { year: "2008", title: "Hyundai", image: "https://amgroupind.com/wp-content/uploads/2024/10/hyundai-3.png" },
    { year: "2010", title: "Honda 2 Wheeler", image: "https://amgroupind.com/wp-content/uploads/2024/10/honda.png" },
    { year: "2012", title: "KTM", image: "https://amgroupind.com/wp-content/uploads/2024/10/ktm-logo-3.png" },
    { year: "2017", title: "TATA", image: "https://amgroupind.com/wp-content/uploads/2024/10/tata-1-1.png" },
    { year: "2024", title: "Bajaj | Kia | MG", image: "https://amgroupind.com/wp-content/uploads/2024/11/Untitled-design-1.png" }
  ]

  const hyundaiAwards = [
    { title: "National Best Seller Award (H1)", destination: "Los Angeles, USA", year: "2009" },
    { title: "Best Dealership (North Region)", destination: "Head Office", year: "2009" },
    { title: "National Best Seller Award (Volume)", destination: "Chi Minh City, Vietnam", year: "2009" },
    { title: "National Best Seller Award (Retails)", destination: "Chi Minh City, Vietnam", year: "2010" },
    { title: "National Best Seller Award", destination: "Auckland, New Zealand", year: "2010" },
    { title: "National Best Seller Award", destination: "Paris, France", year: "2011" },
    { title: "National Best Seller Award", destination: "New York, USA", year: "2012" },
    { title: "Best Premium Car Seller Award", destination: "Head Office", year: "2015" },
    { title: "Best Model Performance Award i20", destination: "Lisbon", year: "2018" },
    { title: "Best Model Performance Award i20", destination: "Rio De Janeiro", year: "2019" }
  ]

  const chevroletAwards = [
    { title: "Highest Customer Satisfaction Award", destination: "G.M Office", year: "2006" },
    { title: "Parts Target Achievement Award", destination: "G.M Office", year: "2006" },
    { title: "Spark Fastest 50 Contest Award", destination: "G.M Office", year: "2007" },
    { title: "Overall Customer Satisfaction Award", destination: "Gurgaon", year: "2007" },
    { title: "Best Accessory Sale Award", destination: "Nanital", year: "2009" },
    { title: "1st Rank Overall Performance", destination: "Zone Level", year: "2010" },
    { title: "5000 Vehicle Sales Achievement", destination: "Zone Level", year: "2011" }
  ]

  return (
    <div className="min-h-screen bg-ground">
      {/* Cinematic Hero Section */}
      <section
        data-ground="deep"
        className="relative flex min-h-[60vh] items-center overflow-hidden bg-deep-2"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://amgroupind.com/wp-content/uploads/2024/10/IMG_4571.webp"
            alt="AM Group Leadership"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          {/* Scrim over photography — keeps the heading legible. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-2 via-deep-2/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pt-32 md:px-10">
          <Settle>
            <div className="mb-10 inline-flex items-center gap-4">
              <span aria-hidden className="block h-px w-12 bg-accent" />
              <span className="text-meta uppercase text-on-deep-2">
                Legacy of Excellence
              </span>
            </div>

            <h1 className="mb-12 font-display text-display uppercase text-on-deep">
              About <br />
              <span className="text-accent-text-dark">Us</span>
            </h1>
          </Settle>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Settle className="space-y-10">
              <h2 className="font-display text-h1 uppercase text-ink">
                Driving Change <br />
                <span className="text-ink-3">Since 1968.</span>
              </h2>
              <div className="space-y-6 text-body-lg text-ink-2">
                <p>
                  The AM Group has 26 dealership outlets across the union territory of Jammu &amp; Kashmir which include two wheelers and passenger vehicles. The group is also diversified in many other businesses which include petroleum business, real estate developments, and logistics.
                </p>
                <p>
                  The group has come a long way since 1968, when the group started with a dealership for Hindustan Petroleum Corporation Ltd. gas stations and kerosene oil. In 1977, the group expanded its presence with Indian Oil Corporation Ltd.
                </p>
                <p>
                  Our strong focus on customer satisfaction and quality products has earned us a reputation for excellence in the automobile industry. Today, AM Group stands as a symbol of trust and growth across multiple sectors.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 border-t border-line pt-10">
                <div>
                  <div data-num className="mb-2 font-display text-h1 text-ink">26+</div>
                  <div className="text-meta uppercase text-ink-2">Dealership Outlets</div>
                </div>
                <div>
                  <div data-num className="mb-2 font-display text-h1 text-accent">55+</div>
                  <div className="text-meta uppercase text-ink-2">Years of Legacy</div>
                </div>
              </div>
            </Settle>

            <Settle>
              <figure className="relative aspect-[4/3] overflow-hidden border border-line">
                <Image
                  src="https://amgroupind.com/wp-content/uploads/2024/10/IMG_4571.webp"
                  alt="AM Group Headquarters"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </figure>
            </Settle>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="border-y border-line bg-ground-2 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-16 text-center md:mb-20">
            <span className="mb-4 block text-meta uppercase text-accent-text-light">Our Journey</span>
            <h2 className="font-display text-h1 uppercase text-ink">
              Timeline of <span className="text-ink-3">Excellence</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div
              aria-hidden
              className="absolute top-1/2 left-0 right-0 hidden h-px -translate-y-1/2 bg-line lg:block"
            />

            <ol className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {timeline.map((item, i) => (
                <li key={i} className="relative">
                  <Settle delay={i * 0.1}>
                    <div className="border border-line bg-surface p-8 text-center">
                      <div data-num className="mb-8 font-display text-h1 text-ink-3">
                        {item.year}
                      </div>
                      <div className="relative mb-8 h-20">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 60vw, 220px"
                          className="object-contain grayscale"
                        />
                      </div>
                      <h4 className="text-label uppercase text-ink">{item.title}</h4>
                    </div>
                  </Settle>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Awards & Recognition Header */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Settle>
              <span className="mb-4 block text-meta uppercase text-accent-text-light">Recognition</span>
              <h2 className="mb-10 font-display text-h1 uppercase text-ink">
                Awards &amp; <br /><span className="text-ink-3">Accolades</span>
              </h2>
              <p className="mb-10 max-w-[52ch] text-body-lg text-ink-2">
                Our relentless pursuit of excellence has been recognized globally by our partners.
                From National Best Seller awards to Customer Satisfaction excellence,
                our shelf reflects our commitment to being the best.
              </p>
              <p className="border-l-2 border-accent pl-4 text-label uppercase text-ink">
                Global recognition across 4 countries
              </p>
            </Settle>

            <Settle>
              <figure className="border border-line">
                {/* Natural dimensions of this plate are not knowable, so it stays a
                    plain img with explicit lazy decoding rather than next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://amgroupind.com/wp-content/uploads/2024/10/awards.png"
                  alt="Awards Showcase"
                  loading="lazy"
                  decoding="async"
                  className="w-full"
                />
              </figure>
            </Settle>
          </div>
        </div>
      </section>

      {/* Awards Lists */}
      <section data-ground="deep" className="bg-deep py-20 text-on-deep md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Hyundai Awards */}
            <div>
              <div className="mb-10 flex items-center gap-6 border-b border-line-on-deep pb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://amgroupind.com/wp-content/uploads/2024/10/hyundai-3.png"
                  alt="Hyundai"
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-auto brightness-0 invert"
                />
                <h3 className="font-display text-h2 uppercase text-on-deep">Hyundai Awards</h3>
              </div>
              <ul className="space-y-3">
                {hyundaiAwards.map((award, i) => (
                  <li key={i}>
                    <Settle
                      delay={i * 0.05}
                      className="flex items-center justify-between gap-4 border border-line-on-deep bg-deep-2 p-5"
                    >
                      <div className="min-w-0">
                        <h4 className="mb-1 text-label text-on-deep">{award.title}</h4>
                        <p className="text-meta uppercase text-on-deep-2">{award.destination}</p>
                      </div>
                      <div data-num className="font-display text-h3 text-accent-text-dark">
                        {award.year}
                      </div>
                    </Settle>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chevrolet Awards */}
            <div>
              <div className="mb-10 flex items-center gap-6 border-b border-line-on-deep pb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://amgroupind.com/wp-content/uploads/2024/10/Chevrolet-2.png"
                  alt="Chevrolet"
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-auto brightness-0 invert"
                />
                <h3 className="font-display text-h2 uppercase text-on-deep">Chevrolet Awards</h3>
              </div>
              <ul className="space-y-3">
                {chevroletAwards.map((award, i) => (
                  <li key={i}>
                    <Settle
                      delay={i * 0.05}
                      className="flex items-center justify-between gap-4 border border-line-on-deep bg-deep-2 p-5"
                    >
                      <div className="min-w-0">
                        <h4 className="mb-1 text-label text-on-deep">{award.title}</h4>
                        <p className="text-meta uppercase text-on-deep-2">{award.destination}</p>
                      </div>
                      <div data-num className="font-display text-h3 text-on-deep-2">
                        {award.year}
                      </div>
                    </Settle>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Shared Design Footer / CTA section can go here or use global footer */}
    </div>
  )
}
