import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { LegalDocument, type LegalSection } from "@/components/sections/legal-document"

/**
 * Carried over verbatim from https://amgroupind.com/terms/ so the legacy URL
 * keeps its content at the same path after the migration — /terms/ normalises
 * to /terms, so no redirect rule is needed.
 *
 * The wording is AM Group's legal position and is reproduced as written; only
 * the contact block is re-derived, from lib/locations.ts.
 */

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms and Conditions governing the use of the AM Group website and services — vehicle information and pricing, bookings, test drives, finance, and limitation of liability.",
  alternates: { canonical: "/terms" },
}

const SECTIONS: LegalSection[] = [
  {
    heading: "1. About AM Group",
    paragraphs: [
      "AM Group operates multiple automotive dealerships and diversified business ventures including passenger vehicle sales, two-wheelers, service workshops, petroleum business, real estate, logistics, and related services across Jammu & Kashmir and other regions.",
    ],
  },
  {
    heading: "2. Use of Website",
    paragraphs: ["You agree to:"],
    bullets: [
      "Use the website only for lawful purposes",
      "Not misuse, hack, disrupt, or damage the website",
      "Not attempt unauthorized access to restricted areas",
      "Provide accurate information when submitting inquiries or forms",
    ],
  },
  {
    paragraphs: ["We reserve the right to restrict or terminate access if misuse is detected."],
  },
  {
    heading: "3. Vehicle Information & Pricing",
    paragraphs: [
      "All vehicle specifications, pricing, offers, images, and availability displayed on the website:",
    ],
    bullets: [
      "Are subject to change without prior notice",
      "May vary by location or dealership",
      "Are for informational purposes only",
      "Do not constitute a binding contract",
    ],
  },
  {
    paragraphs: [
      "Final pricing, availability, and offers will be confirmed at the dealership.",
      "Taxes, registration, insurance, accessories, handling charges, and other applicable fees may be additional unless otherwise stated.",
    ],
  },
  {
    heading: "4. Bookings & Payments",
    bullets: [
      "Booking amounts are subject to dealership policy.",
      "Refund policies vary depending on vehicle type and booking stage.",
      "Final delivery is subject to payment clearance and documentation compliance.",
      "AM Group reserves the right to cancel bookings in case of pricing errors, stock unavailability, or regulatory changes.",
    ],
  },
  {
    heading: "5. Test Drives & Vehicle Delivery",
    bullets: [
      "Test drives are subject to valid driving license verification.",
      "Delivery timelines are indicative and may vary due to manufacturer supply, logistics, or regulatory factors.",
      "AM Group shall not be liable for delays caused by external circumstances beyond its control.",
    ],
  },
  {
    heading: "6. Finance & Insurance",
    paragraphs: [
      "Finance and insurance services are facilitated through third-party banks and financial institutions.",
      "AM Group:",
    ],
    bullets: [
      "Does not guarantee loan approval",
      "Is not responsible for interest rate changes",
      "Is not liable for insurance claim rejections",
    ],
  },
  {
    paragraphs: ["Customers are advised to review third-party terms independently."],
  },
  {
    heading: "7. Intellectual Property",
    paragraphs: ["All website content including:"],
    bullets: ["Logos", "Branding", "Text", "Images", "Graphics", "Layout", "Marketing materials"],
  },
  {
    paragraphs: [
      "are the property of AM Group or licensed partners and may not be copied, reproduced, or distributed without written consent.",
    ],
  },
  {
    heading: "8. Third-Party Links",
    paragraphs: [
      "This website may contain links to third-party websites. AM Group is not responsible for:",
    ],
    bullets: ["External content", "Privacy practices", "Third-party policies"],
  },
  {
    paragraphs: ["Use of external websites is at your own risk."],
  },
  {
    heading: "9. Limitation of Liability",
    paragraphs: ["AM Group shall not be liable for:"],
    bullets: [
      "Indirect or consequential losses",
      "Website downtime",
      "Errors in pricing or specifications",
      "Technical issues beyond reasonable control",
    ],
  },
  {
    paragraphs: ["All services are provided on an “as available” basis."],
  },
  {
    heading: "10. User Submissions",
    paragraphs: [
      "Any feedback, suggestions, or content submitted to AM Group may be used for marketing, service improvement, or operational purposes without compensation.",
    ],
  },
  {
    heading: "11. Privacy",
    paragraphs: [
      "Use of this website is also governed by our Privacy Policy. By using this website, you consent to our data collection and usage practices as described therein.",
    ],
  },
  {
    heading: "12. Changes to Terms",
    paragraphs: [
      "AM Group reserves the right to update these Terms & Conditions at any time. Changes will be effective immediately upon posting on the website.",
      "Users are encouraged to review this page periodically.",
    ],
  },
  {
    heading: "13. Governing Law",
    paragraphs: [
      "These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts in Jammu & Kashmir.",
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Terms and Conditions" }]} />
      <LegalDocument
        title="Terms and Conditions"
        effectiveDate="27 January 2025"
        intro={[
          "Welcome to AM Group. These Terms and Conditions govern your use of our website and services. By accessing or using this website, you agree to comply with and be bound by the terms outlined below.",
          "If you do not agree with these Terms, please do not use this website.",
        ]}
        sections={SECTIONS}
      />
    </>
  )
}
