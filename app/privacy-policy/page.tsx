import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { LegalDocument, type LegalSection } from "@/components/sections/legal-document"

/**
 * Carried over verbatim from https://amgroupind.com/privacy-policy/ so the
 * legacy URL keeps its content at the same path after the migration —
 * /privacy-policy/ normalises to /privacy-policy, so no redirect rule is needed.
 *
 * This page is not optional: Google Ads and Meta lead-form policies both
 * require a reachable privacy policy on the advertised domain, so its absence
 * would block paid lead generation as well as being a compliance gap.
 */

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AM Group collects, uses, shares and safeguards your personal information when you use our website or submit an enquiry — including cookies, data security and your rights.",
  alternates: { canonical: "/privacy-policy" },
}

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Information We Collect",
    paragraphs: ["We may collect the following types of information:"],
  },
  {
    subheading: "a) Personal Information",
    paragraphs: ["Information that can identify you directly, including but not limited to:"],
    bullets: [
      "Name",
      "Phone number",
      "Email address",
      "Postal address",
      "Vehicle details (for sales/service inquiries)",
      "Any information submitted through contact forms, booking forms, or inquiries",
    ],
  },
  {
    subheading: "b) Non-Personal Information",
    paragraphs: ["Information collected automatically, such as:"],
    bullets: [
      "IP address",
      "Browser type and version",
      "Device information",
      "Pages visited and time spent on the website",
      "Cookies and usage data",
    ],
  },
  {
    heading: "2. How We Use Your Information",
    paragraphs: ["We use the information collected for purposes including:"],
    bullets: [
      "Responding to inquiries and requests",
      "Processing bookings, test drives, service appointments, and valuations",
      "Providing product, service, and promotional information",
      "Improving our website, services, and customer experience",
      "Internal analysis, reporting, and business operations",
      "Compliance with legal and regulatory requirements",
    ],
  },
  {
    heading: "3. Cookies and Tracking Technologies",
    paragraphs: ["Our website may use cookies and similar technologies to:"],
    bullets: [
      "Enhance user experience",
      "Understand website traffic and usage patterns",
      "Improve website performance",
    ],
  },
  {
    paragraphs: [
      "You can choose to disable cookies through your browser settings; however, this may affect certain website functionalities.",
    ],
  },
  {
    heading: "4. Sharing of Information",
    paragraphs: [
      "We do not sell or rent your personal information. We may share your information only in the following circumstances:",
    ],
    bullets: [
      "With authorized AM Group dealerships, subsidiaries, or partners to fulfill your request",
      "With service providers who assist us in operating our website or business (under confidentiality obligations)",
      "When required by law, regulation, court order, or government authority",
      "To protect the rights, safety, and property of AM Group and its users",
    ],
  },
  {
    heading: "5. Data Security",
    paragraphs: [
      "We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction. While we strive to protect your data, no method of transmission over the internet is completely secure.",
    ],
  },
  {
    heading: "6. Third-Party Links",
    paragraphs: [
      "Our website may contain links to third-party websites. AM Group is not responsible for the privacy practices or content of such external sites. We encourage you to review their privacy policies before sharing any personal information.",
    ],
  },
  {
    heading: "7. Your Rights and Choices",
    paragraphs: ["You may:"],
    bullets: [
      "Request access to or correction of your personal information",
      "Withdraw consent for marketing communications",
      "Request deletion of your data, subject to legal and operational requirements",
    ],
  },
  {
    paragraphs: ["Requests can be made by contacting us using the details below."],
  },
  {
    heading: "8. Children’s Privacy",
    paragraphs: [
      "Our website is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors.",
    ],
  },
  {
    heading: "9. Changes to This Privacy Policy",
    paragraphs: [
      "AM Group reserves the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting on the website. We encourage you to review this page periodically.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <LegalDocument
        title="Privacy Policy"
        effectiveDate="27 January 2025"
        intro={[
          "AM Group (“we,” “our,” or “us”) is committed to protecting the privacy and security of the personal information of our customers, visitors, partners, and users (“you”). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or interact with us through digital platforms.",
          "By accessing or using our website, you agree to the terms of this Privacy Policy.",
        ]}
        sections={SECTIONS}
      />
    </>
  )
}
