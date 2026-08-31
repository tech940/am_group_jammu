import { Band, Head, PageHero } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  ColorBlocks,
  DotMatrix,
  Grain,
  Stripes,
} from "@/components/system/backdrops"
import { NEWS } from "@/components/home/content"

/**
 * News.
 *
 * Four posts, and they are the four the company actually published — all in
 * 2020–21, all about AM Hyundai. The previous version hot-linked a photograph
 * for each from `amgroupind.com/wp-content/...` (the site being decommissioned),
 * invented a category taxonomy — "Awards", "News", "Innovation", "Launches" —
 * for a four-item list, and gave every card a "Read more" control pointing at
 * `#`, which is a link that does nothing.
 *
 * This is a typographic register instead. There are no article pages to link
 * to yet, so nothing here pretends there are, and the page says plainly that
 * the archive stops in 2021 rather than presenting five-year-old posts as
 * current.
 *
 * BACKDROP SIGNATURE: newsprint. The one route that keeps the hard-edged set on
 * a light ground — a coarse dot screen and faint hatching, which is what a
 * halftone actually is. It suits an archive of press cuttings and suits nothing
 * else on this site.
 */
export function NewsPage() {
  const latest = NEWS[0]
  const oldest = NEWS[NEWS.length - 1]

  return (
    <>
      <PageHero
        eyebrow="News &amp; updates"
        title={
          <>
            The published
            <br />
            archive
          </>
        }
        lede="Everything AM Group has posted publicly, in date order. It is a short list and an old one — the company has not published since 2021, and this page shows that rather than hiding it."
        image={SUPABASE_MEDIA.branches["jammu-hyundai"].banner}
        backdrop={
          <>
            <DotMatrix tone="deep" cell={14} strength={0.12} fade="none" />
            <Grain onDeep animate />
          </>
        }
        stats={[
          { term: "Posts", detail: String(NEWS.length), note: "all AM Hyundai" },
          { term: "Most recent", detail: latest.date.split(" ").slice(-1)[0], note: latest.date },
          { term: "Earliest", detail: oldest.date.split(" ").slice(-1)[0], note: oldest.date },
          { term: "Article pages", detail: "—", note: "not built yet" },
        ]}
      />

      <Band
        ground="ground"
        labelledBy="news-title"
        id="news"
        backdrop={
          <>
            <ColorBlocks angle="180deg" blocks={[0.16, 0.09, 0.04, 0]} />
            <Stripes angle="90deg" period={7} strength={0.035} fade="both" />
            <DotMatrix cell={14} strength={0.05} fade="both" />
            <Grain />
          </>
        }
      >
        <Head
          id="news-title"
          label="Archive"
          title={`${NEWS.length} posts, ${oldest.date} to ${latest.date}`}
          lede="Each entry is reproduced with the date the company published it. Where a post has no page of its own yet, no link is shown — a control that goes nowhere is worse than none."
        />

        <ol className="mt-14 border-t border-line-strong">
          {NEWS.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-2 border-b border-line py-8 md:flex-row md:items-baseline md:gap-10"
            >
              <time className="shrink-0 text-meta uppercase text-ink-2 md:w-36" data-num>
                {item.date}
              </time>
              <div className="min-w-0">
                <h3 className="font-display text-h2 uppercase text-ink">{item.title}</h3>
                <p className="mt-2 max-w-[70ch] text-body-lg text-ink-2">{item.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-[68ch] text-small text-ink-2">
          These four posts were carried over from the company&apos;s WordPress site during
          migration. Individual article pages have not been rebuilt, so the legacy URLs
          redirect here. New posts will get their own pages.
        </p>
      </Band>

      <ClosingCall
        sourceLabel="news-closing"
        heading="Ask us directly"
        lede="For anything current — stock, offers, service camps — the phone is faster than this page."
        image={SUPABASE_MEDIA.branches["jammu-hyundai"].exterior}
      />
    </>
  )
}
