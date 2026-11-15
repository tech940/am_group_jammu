import { linkPhones } from "@/components/system/phone-text"
import { FaqList } from "@/components/seo/faq-section"
import { buildDealerFacts, buildHomeFaqs } from "@/lib/seo/content"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { SectionHead, StoreBand } from "./section-head"

/**
 * The dealer's basic facts in plain sentences, then the questions the site can
 * answer today.
 *
 * Someone asking a search engine or an AI assistant "where can I buy a used
 * car in Jammu" is answered from a sentence that can be lifted whole. Until
 * this band existed the homepage never said, in one place, what the business
 * is, where it is, how many cars it has, what they cost, when it is open and
 * how to call it.
 *
 * EVERY ANSWER IS BUILT FROM DATA THE SITE HOLDS: the live stock list and
 * lib/locations.ts (lib/seo/content.ts, buildDealerFacts and buildHomeFaqs).
 * There is deliberately no question about warranty, what "Certified Used"
 * covers, which banks lend, delivery or returns: the company has not supplied
 * those facts, and an answer written without them would be a guess.
 *
 * `total` is 0 when the stock list is not loading, and the stock sentences are
 * then left out rather than printed with a number nobody can stand behind.
 */
export function Answers({
  facets,
  vehicles,
  total,
}: {
  facets: InventoryFacets
  vehicles: InventoryVehicle[]
  total: number
}) {
  return (
    <StoreBand ground="ground-2" labelledBy="answers-title" id="answers">
      <SectionHead id="answers-title" title="Questions buyers ask" />
      <p className="mt-5 max-w-[72ch] text-body-lg text-ink">{linkPhones(buildDealerFacts(facets, total), "home-answers")}</p>
      <div className="mt-7 max-w-4xl md:mt-10">
        <FaqList items={buildHomeFaqs(facets, vehicles, total)} />
      </div>
    </StoreBand>
  )
}
