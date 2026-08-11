/**
 * Thin re-export so the homepage sections import location truth from one
 * place. NAP data itself lives in lib/locations.ts — the single source the
 * whole site (and the schema markup) uses.
 */

export { LOCATIONS, formatAddress, formatHours, whatsappUrl } from "@/lib/locations"
export { SCALE } from "./content"

import { SCALE } from "./content"

export const SCALE_NOTE = `The group operates ${SCALE.outlets} outlets across the Union Territory, serving ${SCALE.cities.join(", ")}.`
