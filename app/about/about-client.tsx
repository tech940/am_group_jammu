"use client"

import React from "react"
import { motion } from "framer-motion"
import { Award, Target, History, Users, TrendingUp, Building2 } from "lucide-react"

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
    <div className="min-h-screen bg-white">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://amgroupind.com/wp-content/uploads/2024/10/IMG_4571.webp" 
            alt="AM Group Leadership" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
          >
            <div className="mb-10 inline-flex items-center gap-4">
              <div className="h-[1px] w-12 bg-[#E31837]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">
                Legacy of Excellence
              </span>
            </div>
            
            <h1 className="text-[44px] sm:text-[64px] md:text-[120px] font-bold text-white leading-[0.8] tracking-tight mb-12">
              About <br />
              <span className="text-[#E31837] italic font-light">Us</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-[#023468] tracking-tight">
                Driving Change <br />
                <span className="text-black/20">Since 1968.</span>
              </h2>
              <div className="space-y-6 text-black/60 text-lg md:text-xl font-light leading-relaxed">
                <p>
                  The AM Group has 26 dealership outlets across the union territory of Jammu & Kashmir which include two wheelers and passenger vehicles. The group is also diversified in many other businesses which include petroleum business, real estate developments, and logistics.
                </p>
                <p>
                  The group has come a long way since 1968, when the group started with a dealership for Hindustan Petroleum Corporation Ltd. gas stations and kerosene oil. In 1977, the group expanded its presence with Indian Oil Corporation Ltd.
                </p>
                <p>
                  Our strong focus on customer satisfaction and quality products has earned us a reputation for excellence in the automobile industry. Today, AM Group stands as a symbol of trust and growth across multiple sectors.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-10">
                <div>
                  <div className="text-4xl font-bold text-[#023468] mb-2">26+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Dealership Outlets</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#E31837] mb-2">55+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Years of Legacy</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl"
            >
              <img 
                src="https://amgroupind.com/wp-content/uploads/2024/10/IMG_4571.webp" 
                alt="AM Group Headquarters" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#023468]/20 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-32 bg-zinc-50 border-y border-black/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-4 block">Our Journey</span>
            <h2 className="text-4xl md:text-6xl font-bold text-[#023468] tracking-tight">Timeline of <span className="text-black/20">Excellence</span></h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/5 hidden lg:block -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="bg-white p-10 rounded-[40px] shadow-sm border border-black/5 hover:shadow-xl hover:border-[#E31837]/20 transition-all duration-500 text-center">
                    <div className="text-4xl font-black text-black/10 mb-8 group-hover:text-[#E31837]/20 transition-colors">
                      {item.year}
                    </div>
                    <div className="h-20 flex items-center justify-center mb-8">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" 
                      />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-[#023468]">{item.title}</h4>
                  </div>
                  {/* Point on line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-[#E31837] rounded-full hidden lg:block scale-0 group-hover:scale-100 transition-transform shadow-[0_0_20px_#E31837]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition Header */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-4 block">Recognition</span>
              <h2 className="text-5xl md:text-7xl font-bold text-[#023468] tracking-tight mb-12">Awards & <br /><span className="text-black/20">Accolades</span></h2>
              <p className="text-black/40 text-xl font-light leading-relaxed mb-12">
                Our relentless pursuit of excellence has been recognized globally by our partners. 
                From National Best Seller awards to Customer Satisfaction excellence, 
                our shelf reflects our commitment to being the best.
              </p>
              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 bg-[#E31837] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#E31837]/20">
                    <Award className="text-white h-8 w-8" />
                 </div>
                 <div className="text-sm font-bold text-[#023468] uppercase tracking-widest">Global recognition across 4 countries</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-[#E31837]/5 rounded-[60px] blur-[80px] -rotate-6" />
              <img 
                src="https://amgroupind.com/wp-content/uploads/2024/10/awards.png" 
                alt="Awards Showcase" 
                className="relative z-10 w-full rounded-[40px] shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Awards Lists */}
      <section className="py-32 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-[#E31837]/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-3xl pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            
            {/* Hyundai Awards */}
            <div>
              <div className="flex items-center gap-6 mb-16">
                 <img 
                   src="https://amgroupind.com/wp-content/uploads/2024/10/hyundai-3.png" 
                   alt="Hyundai" 
                   className="h-12 w-auto brightness-0 invert" 
                 />
                 <h3 className="text-3xl font-bold tracking-tight">Hyundai Awards</h3>
              </div>
              <div className="space-y-4">
                {hyundaiAwards.map((award, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="group bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{award.title}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">{award.destination}</p>
                    </div>
                    <div className="text-lg font-black text-[#E31837]/50 group-hover:text-[#E31837] transition-colors">{award.year}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chevrolet Awards */}
            <div>
              <div className="flex items-center gap-6 mb-16">
                 <img 
                   src="https://amgroupind.com/wp-content/uploads/2024/10/Chevrolet-2.png" 
                   alt="Chevrolet" 
                   className="h-12 w-auto brightness-0 invert" 
                 />
                 <h3 className="text-3xl font-bold tracking-tight">Chevrolet Awards</h3>
              </div>
              <div className="space-y-4">
                {chevroletAwards.map((award, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="group bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{award.title}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">{award.destination}</p>
                    </div>
                    <div className="text-lg font-black text-white/10 group-hover:text-white transition-colors">{award.year}</div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Shared Design Footer / CTA section can go here or use global footer */}
    </div>
  )
}
