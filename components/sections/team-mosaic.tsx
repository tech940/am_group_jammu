"use client"

import { motion } from "framer-motion"

const photos = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    className: "col-span-1 row-span-1 h-64",
    initial: { x: -200, y: -100, rotate: -15, opacity: 0 }
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    className: "col-span-1 row-span-1 h-64",
    initial: { x: -300, y: 150, rotate: 10, opacity: 0 }
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
    className: "col-span-1 row-span-2 h-full min-h-[512px]",
    initial: { y: 300, rotate: 0, opacity: 0 }
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800",
    className: "col-span-1 row-span-1 h-64",
    initial: { x: 250, y: -150, rotate: 20, opacity: 0 }
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    className: "col-span-1 row-span-1 h-64",
    initial: { x: 400, y: 50, rotate: -10, opacity: 0 }
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1200",
    className: "col-span-2 row-span-1 h-64",
    initial: { x: 100, y: 200, rotate: 5, opacity: 0 }
  }
]

export function TeamMosaic() {
  return (
    <section className="py-24 bg-[#FAFAFA] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E31837] mb-6 inline-block bg-[#E31837]/5 px-3 py-1 rounded">
              Culture
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#023468] mb-6">
              Life at <span className="text-black/20">AM Group</span>
            </h2>
            <p className="text-black/50 max-w-2xl mx-auto font-light">
              Beyond the showrooms and service bays, we are a family. 
              Celebrating milestones, fostering talent, and building a legacy together.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              className={`relative overflow-hidden rounded-3xl shadow-xl ${photo.className}`}
              initial={photo.initial}
              whileInView={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 50, 
                damping: 20,
                duration: 1.5,
                delay: photo.id * 0.1 
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <img 
                src={photo.src} 
                alt="Team moment" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
