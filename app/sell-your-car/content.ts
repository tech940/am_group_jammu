import type { FaqItem } from "@/components/seo/faq-section"
import { LOCATIONS, PRIMARY_LOCATION, formatHours } from "@/lib/locations"

/**
 * What the sell page says, as plain data.
 *
 * It lives outside page.tsx because /llms-full.txt prints the same steps and
 * answers, and a page file may only export the page and its metadata. One
 * copy, so the page and the text file cannot drift apart.
 *
 * WHAT THIS DOES NOT SAY. No price, no "best price", no payment time and no
 * doorstep pickup. None of those is established anywhere in the project.
 */

const SITE_NAMES = LOCATIONS.map((l) => l.shortName)
const HOURS = formatHours(PRIMARY_LOCATION)

export const SELL_SITE_NAMES = SITE_NAMES

export const SELL_STEPS: { title: string; body: string }[] = [
  {
    title: "Bring the car",
    body: `Come to any of our ${SITE_NAMES.length} sites in Jammu during opening hours (${HOURS}). Bring the registration certificate and the insurance. Calling first means someone is ready for you.`,
  },
  {
    title: "Inspection and offer",
    body: "We look the car over while you wait and tell you what we would pay for it. The valuation is free, and whether you sell is up to you.",
  },
  {
    title: "Payment and RC transfer",
    body: "If you accept, payment and the RC transfer are handled in-house. You can also put the value towards a car from our stock instead.",
  },
]

export const SELL_FAQS: FaqItem[] = [
  {
    question: "What does a valuation cost?",
    answer: `Nothing. We value your car free of charge at any of our ${SITE_NAMES.length} sites in Jammu: ${SITE_NAMES.join(", ")}.`,
  },
  {
    question: "Do I need an appointment?",
    answer: `No. You can walk in during opening hours (${HOURS}). We still suggest calling ${PRIMARY_LOCATION.phone} first, so we can tell you which site to come to and give you directions.`,
  },
  {
    question: "What should I bring?",
    answer:
      "The car, its registration certificate and its insurance. Service records help if you have them.",
  },
  {
    question: "Can I exchange my car for one of yours?",
    answer:
      "Yes. We value your car and you can put that amount towards any used car in our stock. Finance for the balance can be arranged at the dealership.",
  },
  {
    question: "Can you give me a price over the phone?",
    answer:
      "Not a firm one. An honest figure depends on seeing the car, so the offer is made after the inspection. You are welcome to call or WhatsApp first with the make, model, year and kilometres.",
  },
]
