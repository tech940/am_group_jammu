"use client"

import React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/feedback"

const newsArticles = [
  {
    title: "AM Hyundai bags two prestigious awards",
    date: "February 26, 2021",
    category: "Awards",
    excerpt: "JAMMU, Feb 25: AM Hyundai today bagged two prestigious awards at Hyundai Motors India Ltd Annual National Digital Dealer Conference...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/AM-Hyundai-bags-two-prestigious-awards.webp",
    link: "#"
  },
  {
    title: "AM Hyundai inaugurates Smart Car Care Clinic",
    date: "December 15, 2020",
    category: "News",
    excerpt: "JAMMU, Dec 14: AM Hyundai has inaugurated Smart Car Clinic for customers in Jammu from today to December 23. The clinic offers...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/AM-Hyundai-inaugurates-Smart-Car-Care-Clinic.webp",
    link: "#"
  },
  {
    title: "AM Hyundai launches India’s first fully electric SUV ‘KONA Electric’",
    date: "December 3, 2020",
    category: "Innovation",
    excerpt: "JAMMU, Dec 2: AM Hyundai Jammu today launched India’s first fully electric SUV, KONA Electric. ‘KONA’ Electric is named after...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/KONA-Electric.webp",
    link: "#"
  },
  {
    title: "AM Hyundai launches all-new i20",
    date: "November 7, 2020",
    category: "Launches",
    excerpt: "JAMMU, Nov 6: AM Hyundai today launched India’s most anticipated car–the all-new i20. Through its sleek styling and futuristic design...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/AM-Hyundai-launches-all-new-i20.webp",
    link: "#"
  }
]

export default function BlogPage() {
  const reduce = useReducedMotion()

  return (
    <div className="min-h-screen bg-ground">
      {/* Hero Section */}
      <section
        data-ground="deep"
        className="relative min-h-[50vh] flex items-center bg-deep-2"
      >
        <div className="container mx-auto px-5 md:px-10 pt-32">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-10 inline-flex items-center gap-4">
              <span aria-hidden className="h-px w-12 bg-accent" />
              <span className="text-meta uppercase text-on-deep-2">
                Media Center
              </span>
            </div>

            <h1 className="font-display text-display uppercase text-on-deep mb-12">
              News & <br />
              <span className="text-accent-text-dark">Updates</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-20 md:py-28 bg-ground">
        <div className="container mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12">
            {newsArticles.map((article, i) => (
              <motion.article
                key={i}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden border border-line bg-ground-2 mb-6">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge>{article.category}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-meta uppercase text-ink-2">
                    <span data-num>{article.date}</span>
                    <span>3 Min Read</span>
                  </div>

                  <h3 className="font-display text-h2 uppercase text-ink mb-4">
                    {article.title}
                  </h3>

                  <p className="text-body text-ink-2 mb-6 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto border-t border-line pt-4">
                    <Button type="button" variant="link" className="px-0">
                      Read More
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More / Pagination */}
          <div className="mt-20 text-center">
            <Button type="button" size="lg">
              View All Updates
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 md:py-28 bg-ground-2 border-t border-line">
        <div className="container mx-auto px-5 md:px-10">
          <div className="max-w-5xl mx-auto border border-line bg-surface p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
              <div className="lg:w-3/5">
                <span className="text-meta uppercase text-accent-text-light mb-4 block">Subscribe</span>
                <h2 className="font-display text-h1 uppercase text-ink mb-6">Stay Ahead of <br /><span className="text-ink-3">The Curve.</span></h2>
                <p className="text-body-lg text-ink-2">
                  Get the latest automotive trends, dealership launches, and group updates delivered directly to your inbox.
                </p>
              </div>

              <div className="lg:w-2/5 w-full">
                <Button asChild size="lg">
                  <a href="/contact">Contact our team</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
