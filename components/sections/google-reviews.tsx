"use client"

import { motion } from "framer-motion"
import { Star, ExternalLink, Quote } from "lucide-react"
import Link from "next/link"

const REVIEWS = [
  {
    id: 1,
    name: "AKASH SURI",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocK4af4puDi2_Kfv4dI6drZ3xlJ_m0b84GFozOneaarV4AcqM64=s64-c-rp-mo-ba12-br100",
    initials: "AS",
    rating: 5,
    date: "3 months ago",
    badge: "Local Guide",
    text: "I had an excellent experience working with my Sales advisors Rahida and Sheetal. They were knowledgeable and patient. They took the time to understand my preferences, explained all available options clearly, and ensured I felt confident in my purchase decision. Highly recommend AM Hyundai Jammu.",
    via: "AM Hyundai Jammu",
    profileUrl: "https://www.google.com/maps/contrib/100349261926089905779/reviews"
  },
  {
    id: 2,
    name: "Junaid Ahmad",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjX8zcw7A3eV9g7TTtKuFdXlo_9eVbO1ZI9X-un5FalVVftCdMIr=s64-c-rp-mo-br100",
    initials: "JA",
    rating: 5,
    date: "7 months ago",
    badge: "4 reviews",
    text: "Excellent experience with AM Hyundai. The staff was professional and cooperative, and the overall process was smooth and hassle-free. A special thanks to Shivani Ma'am for her outstanding support, polite behavior, and clear guidance throughout the entire buying journey.",
    via: "AM Hyundai Jammu",
    profileUrl: "https://www.google.com/maps/contrib/118386222004910967106/reviews"
  },
  {
    id: 3,
    name: "Abbu Ayad",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjUyoiC7UOiCHQC_Esu9YOkBJvhlsF-kxhqTjxxqAexoWN3P4t-cFA=s64-c-rp-mo-br100",
    initials: "AA",
    rating: 5,
    date: "4 weeks ago",
    badge: "1 review",
    text: "I had a wonderful experience purchasing my Hyundai Venue from AM Hyundai. The entire process, from booking to delivery, was smooth and transparent. The sales team was courteous, patient, and answered all my questions regarding the vehicle, insurance, loan, and documentation. Overall the interaction was excellent.",
    via: "AM Hyundai Jammu",
    profileUrl: "https://www.google.com/maps/contrib/102334173010480791060/reviews"
  }
]

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? "fill-[#FABB05] text-[#FABB05]" : "text-black/20"}`}
        />
      ))}
    </div>
  )
}

export function GoogleReviews() {
  return (
    <section className="py-20 bg-[#f8f9fa] border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {/* Google "G" logo */}
              <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#023468]">
                Google Reviews
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#023468] leading-tight">
              What Our Customers Say
            </h2>
            <p className="text-sm text-black/50 mt-2 font-medium">
              Real reviews from verified Google customers
            </p>
          </div>

          {/* Google rating summary badge */}
          <Link
            href="https://www.google.com/maps/place/AM+Hyundai+Jammu"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-white border border-black/8 hover:border-[#023468]/30 rounded-2xl px-5 py-4 shadow-sm transition-all hover:shadow-md flex-shrink-0"
          >
            <div className="text-center">
              <div className="text-3xl font-black text-[#023468]">5.0</div>
              <StarRating />
              <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider">Google Rating</p>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-[11px] font-black text-[#023468] uppercase tracking-wider">Read on Google</span>
              <ExternalLink className="h-4 w-4 text-black/30 group-hover:text-[#023468] transition-colors" />
            </div>
          </Link>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group bg-white rounded-2xl p-6 border border-black/6 hover:border-[#023468]/20 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-[#023468]/15 mb-4 flex-shrink-0" />

              {/* Review text */}
              <p className="text-sm text-black/70 leading-relaxed flex-1 mb-5 line-clamp-5">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Stars + date */}
              <div className="flex items-center justify-between mb-4">
                <StarRating count={review.rating} />
                <span className="text-[10px] font-bold text-black/35 uppercase tracking-wider">
                  {review.date}
                </span>
              </div>

              {/* Reviewer info */}
              <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                {/* Avatar */}
                <div className="relative h-10 w-10 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-[#023468]/10"
                    onError={(e) => {
                      // Fallback to initials
                      const target = e.currentTarget
                      target.style.display = "none"
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div
                    className="h-10 w-10 rounded-full bg-[#023468] text-white text-xs font-black items-center justify-center absolute inset-0 hidden"
                  >
                    {review.initials}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#023468] truncate">{review.name}</p>
                  <p className="text-[10px] text-black/40 font-medium truncate">{review.badge} · {review.via}</p>
                </div>

                {/* Google G mark */}
                <svg width="18" height="18" viewBox="0 0 48 48" className="flex-shrink-0 opacity-60">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-10 text-center">
          <Link
            href="https://www.google.com/maps/place/AM+Hyundai+Jammu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#023468]/50 hover:text-[#023468] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            View all reviews on Google Maps
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </section>
  )
}
