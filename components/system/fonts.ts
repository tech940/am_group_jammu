import { Archivo, Barlow_Condensed } from "next/font/google"

/**
 * The application's two typefaces. Attached to <html> in app/layout.tsx, so
 * every route — public, admin, error, loading — resolves them at :root.
 *
 * Fragment Mono was removed with the drawing-office conceit. Its one real job
 * was aligned numerals in prices, odometer readings and table columns, which
 * `font-variant-numeric: tabular-nums` on Archivo does at no extra download.
 * Lato was removed at the same time; it was the incumbent template's face.
 */

/** Display: sheet headlines, page titles, masthead. Always set tight. */
export const displayFont = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
})

/**
 * Text and UI. Chosen to hold up at 15px on a midrange Android panel, which is
 * what most of this audience is reading on (see PRODUCT.md).
 */
export const bodyFont = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const siteFontVariables = `${displayFont.variable} ${bodyFont.variable}`
