"use client"

import { Settle } from "@/components/system/marks"
import { ContactForm } from "./contact-form"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-ground">
      {/* Hero */}
      <section className="bg-deep" data-ground="deep">
        <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-28 md:px-10 md:pb-20 md:pt-32">
          <Settle>
            <div className="mb-8 inline-flex items-center gap-4">
              <span aria-hidden className="h-px w-12 bg-accent" />
              <span className="text-meta uppercase text-on-deep-2">
                Get In Touch
              </span>
            </div>

            <h1 className="font-display text-display uppercase text-on-deep">
              Contact <br />
              <span className="text-accent-text-dark">Us</span>
            </h1>
          </Settle>
        </div>
      </section>

      {/* Offices Section */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr] md:mb-28">

            {/* Jammu Corporate Office */}
            <Settle>
              <div className="h-full border border-line bg-surface p-6 md:p-8">
                <h2 className="mb-8 font-display text-h2 uppercase text-ink">
                  Corporate <span className="text-ink-3">Office</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <span className="block text-meta uppercase text-ink-2">Location</span>
                    <p className="mt-2 text-body text-ink">
                      AM Business Park, N-H 1 Bye Pass Road,<br />
                      Jammu, Jammu and Kashmir 180012
                    </p>
                  </div>
                  <div>
                    <span className="block text-meta uppercase text-ink-2">Phone</span>
                    <p className="mt-2 text-h3 text-ink" data-num>+91 9484200000</p>
                  </div>
                  <div>
                    <span className="block text-meta uppercase text-ink-2">Email</span>
                    <p className="mt-2 text-body text-ink">info@amgroupind.com</p>
                  </div>
                </div>
              </div>
            </Settle>

            {/* New Delhi Office */}
            <Settle delay={0.06}>
              <div className="h-full border border-line bg-surface p-6 md:p-8">
                <h2 className="mb-8 font-display text-h2 uppercase text-ink">
                  New Delhi <span className="text-ink-3">Office</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <span className="block text-meta uppercase text-ink-2">Location</span>
                    <p className="mt-2 text-body text-ink">
                      B-2/8 Amaltas Marg, DLF Phase 1, Sector 26A,<br />
                      Gurugram, Haryana 122002, India
                    </p>
                  </div>
                  <div>
                    <span className="block text-meta uppercase text-ink-2">Email</span>
                    <p className="mt-2 text-body text-ink">info@amgroupind.com</p>
                  </div>
                </div>
              </div>
            </Settle>

          </div>

          {/* Feedback Form Section */}
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">

              <div className="lg:col-span-4">
                <Settle>
                  <p className="mb-4 text-meta uppercase text-accent-text-light">Feedback</p>
                  <h2 className="mb-6 font-display text-h1 uppercase text-ink">
                    We Welcome <br /><span className="text-ink-3">Your Voice.</span>
                  </h2>
                  <p className="mb-8 max-w-[46ch] text-body-lg text-ink-2">
                    Do you have questions or comments for us? We’d love to hear them!
                    Fill out the form and our representative will get back to you as soon as possible.
                  </p>
                  <p className="border-t border-line pt-4 text-meta uppercase text-ink-2">
                    Human support in 24 hours
                  </p>
                </Settle>
              </div>

              <div className="lg:col-span-8">
                <ContactForm />
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
