import type { MetadataRoute } from "next"
import { DEALER_NAME, SITE_NAME } from "@/lib/seo/site"

/**
 * Web app manifest, served at /manifest.webmanifest.
 *
 * It lets a phone show the right name, icon and colour when someone adds the
 * site to their home screen. The two colours are the tokens from
 * app/globals.css (--color-deep and --color-surface) written out, because a
 * manifest is JSON and cannot read a CSS variable.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEALER_NAME,
    short_name: SITE_NAME,
    description: "Used cars for sale in Jammu. Buy a second hand car, or sell or exchange yours.",
    start_url: "/",
    display: "browser",
    lang: "en-IN",
    theme_color: "#1b4130",
    background_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
