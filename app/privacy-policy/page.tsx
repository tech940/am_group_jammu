import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { LegalDocument, type LegalSection } from "@/components/sections/legal-document"
import { ANALYTICS_MODE, CLARITY_ID, GA_ID, META_PIXEL_ID } from "@/lib/analytics/config"
import { pageSocial } from "@/lib/seo/site"
import { AnalyticsChoice } from "./analytics-choice"

/**
 * The privacy policy, at the same path as on the previous site
 * (/privacy-policy/ normalises to /privacy-policy, so no redirect is needed).
 *
 * This page is not optional: Google Ads and Meta lead-form policies both
 * require a reachable privacy policy on the advertised domain, so its absence
 * would block paid lead generation as well as being a compliance gap.
 *
 * Sections 1, 3 and 4 and part of 7 were rewritten in November 2026. The text
 * carried over from WordPress said only that the site "may use cookies"; it
 * named no tool, no session recording and no recipient. What is written here
 * now describes what THIS code does, and nothing it does not:
 *
 *   enquiry fields ......... components/modals/unlock-price-popup.tsx,
 *                            app/contact/contact-form.tsx, lib/leads/*
 *   GA4 and Clarity ........ lib/analytics/config.ts, components/analytics/*
 *   how you found us ....... lib/analytics/attribution.ts
 *   the enquiry email ...... lib/leads/notify.ts
 *   the Google map ......... app/locations/site-map.tsx
 *
 * If one of those changes, this page changes with it.
 *
 * THE ANALYTICS WORDING FOLLOWS THE CONFIGURATION. Which tools exist is decided
 * by the ids in lib/analytics/config.ts, and until the owner sets them there
 * are none. A policy that said "this website uses Google Analytics and
 * Microsoft Clarity" on a site loading neither would be a false statement, so
 * sections 1(c), 3, 4 and 7 are built from the same ids: they name only the
 * tools that are configured, and say plainly when there is none. The wording
 * is "set up to use", not "is running": this page is built once for every
 * host, and on a preview copy of the site the tools are configured but do not
 * load. The control at the foot of the page states what is really happening in
 * the reader's own browser.
 *
 * Sections 2, 5, 6, 8 and 9 are AM Group's own wording, unchanged. Facts only
 * the company can supply are deliberately absent rather than guessed: the
 * legal name of the company responsible for the data, a named person for
 * privacy requests, and how long enquiries are kept.
 *
 * TODO(client): confirm the effective date. The date shown is the one the
 * company published; the intro says which parts were revised and when.
 *
 * TODO(client): if Google Tag Manager is ever used, the site cannot see which
 * tags the container holds. The Tag Manager wording below is general for that
 * reason and must be checked against what the container really contains.
 */

/* -------------------------------------------------------------------------- */
/* What is configured (fixed when the site is built)                           */
/* -------------------------------------------------------------------------- */

const USES_GTM = ANALYTICS_MODE === "gtm"
const USES_GA = ANALYTICS_MODE === "direct" && Boolean(GA_ID)
const USES_CLARITY = ANALYTICS_MODE === "direct" && Boolean(CLARITY_ID)
const USES_PIXEL = ANALYTICS_MODE === "direct" && Boolean(META_PIXEL_ID)
const ANY_TOOL = ANALYTICS_MODE !== "off"
const TOOL_COUNT = [USES_GA, USES_CLARITY, USES_PIXEL].filter(Boolean).length
/** Exactly one named tool, so the sentences say "it" and not "they". */
const ONE_TOOL = !USES_GTM && TOOL_COUNT === 1
/** Recording of clicks and scrolling is, or may be, part of what is used. */
const RECORDING = USES_CLARITY || USES_GTM

const TITLE = "Privacy Policy"
const DESCRIPTION = ANY_TOOL
  ? `What AM Group collects on this website and in enquiries, the analytics${
      RECORDING ? " and session-recording" : ""
    } tools it uses, who sees it, and how to refuse or ask for deletion.`
  : "What AM Group collects when you use this website or send an enquiry, who receives the information, and how to ask for it to be corrected or deleted."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy-policy" },
  // Without this the page inherits the root layout's Open Graph block, whose
  // og:url is the homepage.
  ...pageSocial({ title: TITLE, description: DESCRIPTION, path: "/privacy-policy" }),
}

const SECTION_3_HEADING = "3. Cookies, Analytics and Session Recording"

/** Section 1(c): what the analytics tools collect, or that there are none. */
const AUTOMATIC: LegalSection = ANY_TOOL
  ? {
      subheading: "c) Information collected automatically",
      paragraphs: [
        `Unless you have turned ${ONE_TOOL ? "it" : "them"} off (see section 3), the analytics ${
          ONE_TOOL ? "tool on this website collects" : "tools on this website collect"
        }:`,
      ],
      bullets: [
        "Your IP address, browser type and version, and device information",
        "The pages and cars you view, the searches and filters you use, and the time you spend",
        ...(RECORDING ? ["Clicks, taps, scrolling and mouse movement on the page"] : []),
        `Cookies and similar identifiers that ${ONE_TOOL ? "the tool sets" : "those tools set"} in your browser`,
      ],
    }
  : {
      subheading: "c) Information collected automatically",
      paragraphs: [
        "No analytics or session-recording tool is in use on this website at present (see section 3), so nothing is collected by such a tool.",
      ],
    }

/** Section 3, the part about analytics tools. */
function analyticsSections(): LegalSection[] {
  if (!ANY_TOOL) {
    return [
      {
        heading: SECTION_3_HEADING,
        paragraphs: [
          "No analytics or session-recording tool is in use on this website at present. If one is added, this section will name it and say what it does.",
          "You can already record that you do not want to be measured, using the control at the bottom of this page. That choice is remembered in your browser and will apply if a tool is added.",
        ],
      },
    ]
  }

  const them = ONE_TOOL ? "it" : "them"

  const lead: LegalSection = USES_GTM
    ? {
        heading: SECTION_3_HEADING,
        paragraphs: [
          "This website is set up to load its analytics tools through Google Tag Manager, provided by Google. They are used to see how the website is used: which pages and cars are viewed, which buttons are used and how visitors reached the website. They can include recordings of clicks, taps and scrolling.",
        ],
      }
    : {
        heading: SECTION_3_HEADING,
        paragraphs: [
          `This website is set up to use ${ONE_TOOL ? "one tool" : `${TOOL_COUNT === 2 ? "two" : "three"} tools`} of this kind:`,
        ],
        bullets: [
          ...(USES_GA
            ? [
                "Google Analytics 4, provided by Google. It counts visits and shows us which pages and cars are viewed, which buttons are used and how visitors reached the website.",
              ]
            : []),
          ...(USES_CLARITY
            ? [
                "Microsoft Clarity, provided by Microsoft. It records how pages are used (clicks, taps, scrolling and mouse movement) and shows this to us as heatmaps and as replays of individual visits.",
              ]
            : []),
          ...(USES_PIXEL
            ? [
                "The Meta Pixel, provided by Meta Platforms. It tells Meta which pages and cars are viewed, when a search is made, when an enquiry is sent and when the call or WhatsApp buttons are used, so that we can measure our adverts on Facebook and Instagram and show our cars again to people who have visited this website.",
              ]
            : []),
        ],
      }

  const neverSent = `Your name, mobile number, email address and message are never sent to ${
    ONE_TOOL ? "this tool" : "these tools"
  } by this website.`

  // The advertising signals belong to Google's Consent Mode, which the site
  // sets for gtag.js and for a Tag Manager container. With Clarity alone
  // there is no Google tag to tell, so the sentence is left out.
  // Only true while no advertising tool is loaded. With the Meta Pixel on, the
  // site does advertise, so the sentence names what is and is not used for it.
  const noAdvertising = USES_PIXEL
    ? USES_GA || USES_GTM
      ? " Google Analytics is not used for advertising: the website tells Google that advertising storage and advertising personalisation are not permitted. The Meta Pixel is used for our Facebook and Instagram adverts, as described above."
      : " The Meta Pixel is used for our Facebook and Instagram adverts, as described above."
    : USES_GA || USES_GTM
      ? ` We do not use ${them} for advertising: the website tells Google that advertising storage and advertising personalisation are not permitted.`
      : ""

  return [
    lead,
    {
      paragraphs: [
        USES_CLARITY
          ? `What you type into a form field is not recorded: Clarity masks the content of input boxes. ${neverSent}`
          : neverSent,
        `${ONE_TOOL ? "The tool sets" : "The tools set"} cookies or similar identifiers in your browser and ${
          ONE_TOOL ? "receives" : "receive"
        } your IP address and device details.${noAdvertising}`,
        `You can refuse ${them}. Choose “No thanks” on the analytics notice, or use the control at the bottom of this page. Your choice is remembered in your browser, and from then on ${
          ONE_TOOL ? "the tool is" : "the tools are"
        } not loaded. You can also block or delete cookies in your browser settings. Refusing does not affect anything else on the website.`,
      ],
    },
  ]
}

/**
 * Where each provider publishes its own privacy terms. Google is always
 * listed, because the map comes from Google whatever else is configured.
 */
const PROVIDER_POLICIES =
  (USES_CLARITY
    ? "Google’s privacy policy is at policies.google.com/privacy and Microsoft’s privacy statement is at privacy.microsoft.com/privacystatement."
    : "Google’s privacy policy is at policies.google.com/privacy.") +
  (USES_PIXEL ? " Meta’s privacy policy is at facebook.com/privacy/policy." : "")

/** Section 4: who receives analytics information, if anyone does. */
const ANALYTICS_RECIPIENTS: string[] = ANY_TOOL
  ? [
      `With ${
        USES_GTM
          ? "Google and the providers of the analytics tools, which receive"
          : `${[USES_GA && "Google", USES_CLARITY && "Microsoft", USES_PIXEL && "Meta"]
              .filter(Boolean)
              .join(" and ")}, which ${TOOL_COUNT === 1 ? "receives" : "receive"}`
      } the information described in section 3 unless you have refused it`,
    ]
  : []

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Information We Collect",
    paragraphs: ["We collect the following information:"],
  },
  {
    subheading: "a) What you give us in an enquiry",
    paragraphs: ["The enquiry forms on this website ask for:"],
    bullets: [
      "Your name and mobile number (both required)",
      "Your email address and a message, if you choose to add them",
    ],
  },
  {
    paragraphs: [
      "With each enquiry we also store which car it was about and that car’s listed price (if you enquired about a particular car), what the enquiry was for (for example a car enquiry, a test drive, finance, or selling your car), the page and the button it was sent from, and what you agreed to about being contacted.",
      "If you call us, message us on WhatsApp or visit a showroom, you may give us further details, such as a postal address or the details of a vehicle you want to sell.",
    ],
  },
  {
    subheading: "b) How you found us",
    paragraphs: [
      "When you arrive on this website, your browser keeps a short note of how you got here: any campaign tags and advertising click identifiers in the link you followed (for example utm_source, gclid or fbclid), the address of the website that referred you, and the first page you opened. The note is kept in your own browser. It is sent to us only if you submit an enquiry, and is then stored with that enquiry so that we know which advertisement, search or link brought you to us.",
    ],
  },
  AUTOMATIC,
  {
    paragraphs: [
      "Separately, when an enquiry form is submitted, the IP address it came from is used for a short time to limit repeated submissions. It is not stored with the enquiry.",
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
  ...analyticsSections(),
  {
    paragraphs: [
      // The map is not an analytics tool and the analytics choice does not
      // govern it, so it is described here whatever is configured. The last
      // sentence holds because the iframe is given referrerPolicy
      // "no-referrer" (app/locations/site-map.tsx); change them together.
      "Our contact page and our showroom page show a map supplied by Google Maps. The map is fetched from Google when you scroll near it. Google then receives your IP address and device details and may set its own cookies. This happens whether or not you have refused analytics. The website does not tell Google which of our pages you were on.",
      "The website itself stores a small amount in your browser: your analytics choice, if you have made one, and the note of how you found us described in section 1(b).",
      PROVIDER_POLICIES,
    ],
  },
  {
    heading: "4. Sharing of Information",
    paragraphs: [
      "We do not sell or rent your personal information. Each enquiry is saved in our enquiry records and a copy is emailed to the AM Group sales team so that someone can call you back. We share your information only in the following circumstances:",
    ],
    bullets: [
      "With authorized AM Group dealerships, subsidiaries, or partners to fulfill your request",
      "With service providers who host this website, store our enquiry records and deliver our email, and who otherwise assist us in operating our website or business (under confidentiality obligations)",
      ...ANALYTICS_RECIPIENTS,
      "With Google, which supplies the map on our contact and showroom pages and receives the information described in section 3 when that map loads",
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
      ANY_TOOL
        ? `Turn off analytics${RECORDING ? " and session recording" : ""} for your browser, as described in section 3`
        : "Record that you do not want analytics in your browser, as described in section 3",
    ],
  },
  {
    paragraphs: [
      "To ask for your enquiry to be corrected or deleted, contact us using the details below and tell us the mobile number you enquired with, so that we can find it.",
    ],
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
          "The parts of this policy about enquiries, analytics and session recording (sections 1, 3, 4 and 7) were revised in November 2026.",
        ]}
        sections={SECTIONS}
      />
      <AnalyticsChoice />
    </>
  )
}
