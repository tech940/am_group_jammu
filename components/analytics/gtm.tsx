import Script from "next/script"
import { GTM_ID, gtmEnabled } from "@/lib/analytics/gtm"

/**
 * Google Tag Manager container.
 *
 * `afterInteractive` is the strategy the Next docs name specifically for tag
 * managers and analytics — it loads as soon as possible but never before
 * first-party code. `beforeInteractive` is reserved for bot detection and
 * consent managers, and `lazyOnload` would delay every downstream tag until
 * after full page load, skewing measurement.
 *
 * `id` is required by Next for inline scripts so it can track and dedupe them.
 *
 * Deliberately not using `@next/third-parties`: the bundled docs still mark it
 * experimental, it is not installed here, and it does not emit the <noscript>
 * fallback — so half the snippet would still be hand-written.
 */
export function GoogleTagManager() {
  if (!gtmEnabled) return null

  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}

/**
 * The <noscript> fallback. Must be plain JSX as the first element in <body> —
 * the Metadata API cannot emit <noscript>.
 */
export function GoogleTagManagerNoScript() {
  if (!gtmEnabled) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
