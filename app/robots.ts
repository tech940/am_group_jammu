import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/site"

/**
 * Crawler policy.
 *
 * The owner wants the business found and cited, by search engines and by AI
 * assistants alike, so everything public is open to all of them, for search,
 * for answering a user's question, and for training.
 *
 * Closed to everyone:
 *   /admin   the lead desk and the stock editor
 *   /api     the private endpoints (lead intake, media proxy, import checks)
 *
 * Open inside /api, because it is the machine-readable stock list and holds
 * nothing that is not already on the public pages:
 *   /api/vehicles
 * "Allow" is the longer match, so it wins over "Disallow: /api".
 *
 * WHY THE AI CRAWLERS ARE NAMED. A crawler obeys the group that names it and
 * ignores the "*" group when one does, so the rules are repeated in full for
 * the named group. Naming them changes nothing about what they may fetch; it
 * makes the permission explicit, which some of these crawlers and the people
 * who audit this file look for.
 *
 * No `host` line: only Yandex ever read it.
 */
const DISALLOW = ["/admin", "/api"]
const ALLOW = ["/", "/api/vehicles"]

const SEARCH_AND_AI_CRAWLERS = [
  // OpenAI: training, ChatGPT search, and fetches made for a user's question.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic.
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Perplexity.
  "PerplexityBot",
  "Perplexity-User",
  // Google's and Apple's switches for AI use of pages they already crawl.
  "Google-Extended",
  "Applebot-Extended",
  // Bing's index is also what ChatGPT search and Copilot read.
  "Bingbot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // No trailing slash: "/admin/" would leave "/admin" itself crawlable.
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      { userAgent: SEARCH_AND_AI_CRAWLERS, allow: ALLOW, disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
