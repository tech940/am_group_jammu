import type { FaqItem } from "@/components/seo/faq-section"
import { LOCATIONS, PRIMARY_LOCATION, formatHours } from "@/lib/locations"

/**
 * What the sell page says, as plain data.
 *
 * It lives outside page.tsx because /llms-full.txt prints the same steps and
 * answers, and a page file may only export the page and its metadata. One
 * copy, so the page and the text file cannot drift apart.
 *
 * The steps and the first four answers follow the company's own valuation
 * page (app.amautomotivegroup.com/sell-used-car), which the owner gave as the
 * reference on 2026-11-15: an evaluator calls to fix a day, time and place.
 *
 * WHAT THIS DOES NOT SAY. No price, no "best price" and no payment time. None
 * of those is established anywhere.
 */

const SITE_NAMES = LOCATIONS.map((l) => l.shortName)
const HOURS = formatHours(PRIMARY_LOCATION)

export const SELL_SITE_NAMES = SITE_NAMES

export const SELL_STEPS: { title: string; body: string }[] = [
  {
    title: "Tell us about your car",
    body: "Brand, model, year and kilometres. It takes about a minute, on this page.",
  },
  {
    title: "We call you",
    body: "An AM Group evaluator calls to fix a day, time and place that suit you.",
  },
  {
    title: "Get your price",
    body: "After a short look at the car, you get the price. The evaluation is free, and whether to sell is up to you.",
  },
]

export const SELL_FAQS: FaqItem[] = [
  {
    question: "Is the evaluation really free?",
    answer: "Yes. Nothing is charged for the evaluation, and you decide afterwards whether to sell.",
  },
  {
    question: "Do I have to buy a car from AM Group?",
    answer:
      "No. Sell your car outright, or put its value towards a used car from our stock. It is your choice.",
  },
  {
    question: "Which cars do you evaluate?",
    answer:
      "Any brand and model: petrol, diesel, CNG or electric. If yours is not in the list on the form, choose Other and type it in.",
  },
  {
    question: "What should I keep ready?",
    answer: "The RC, the insurance papers, the service record if you have it, and both keys.",
  },
  {
    question: "Can I bring the car to you instead?",
    answer: `Yes. You can come to any of our ${SITE_NAMES.length} sites in Jammu (${SITE_NAMES.join(", ")}) during opening hours, ${HOURS}. Calling ${PRIMARY_LOCATION.phone} first means someone is ready for you.`,
  },
  {
    question: "Can you give me a price over the phone?",
    answer:
      "Not a firm one. An honest figure depends on seeing the car, so the price is given after the evaluator has looked at it.",
  },
]
