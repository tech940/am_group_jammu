/**
 * Typed helpers for the events that are fired from stock pages, and the
 * data-attribute contract for everything that is a plain link.
 *
 * ---------------------------------------------------------------------------
 * LINKS NEED NO CODE. components/analytics/link-tracker.tsx listens once on
 * the document and reads these attributes from the <a> that was clicked (or,
 * where noted, from the nearest element around it):
 *
 *   data-track-location="vdp-sticky"   WHERE on the page the link sits. Sent
 *                                      as click_location on contact_call,
 *                                      contact_whatsapp, contact_email,
 *                                      get_directions and outbound_click.
 *   data-track-branch="gangyal"        WHICH showroom the link is for (a slug
 *                                      from lib/locations.ts). Sent as
 *                                      location_slug. Optional: when it is
 *                                      missing and data-track-location ends
 *                                      in a showroom slug ("contact-gangyal"),
 *                                      that slug is used.
 *   data-track-item="5925"             WHICH car the link is about. Sent as
 *                                      item_id. Optional: on a car page the
 *                                      id is read from the address.
 *   data-track-list="home-just-arrived"   on a link to a car page OR on any
 *   data-track-list-name="Just arrived"   element around it (a rail, a grid):
 *                                      names the list for select_item. Without
 *                                      it the page type is used.
 *   data-track-index="3"               on the link or on the card around it:
 *                                      the car's position in that list.
 *
 * A click on ANY link to /inventory/<car> sends select_item by itself. The
 * three list attributes only make it say which list and which position.
 * ---------------------------------------------------------------------------
 *
 * Everything below is for things that are not links: a list coming into view,
 * a filter changing, a gallery being swiped. Each helper is one call.
 */

import type { InventoryVehicle } from '../inventory/types.ts'
import { pushEvent, vehicleItem } from './gtm.ts'
import type { ItemVehicle } from './gtm.ts'

export type { ItemVehicle }

/**
 * Cut cars down to what a list event needs. Call it on the server, where the
 * list is rendered, so only these few fields are sent to the browser:
 *
 *   <ListView listId="inventory" items={listItems(pageItems)} />
 */
export function listItems(vehicles: InventoryVehicle[]): ItemVehicle[] {
  return vehicles.map((v) => ({
    id: v.id,
    title: v.title,
    make: v.make,
    model: v.model,
    bodyType: v.bodyType,
    fuel: v.fuel,
    transmission: v.transmission,
    condition: v.condition,
    price: v.price,
  }))
}

/** GA4 lists at most 200 items per event; a page of stock is far below that. */
const MAX_LIST_ITEMS = 50

export interface ListRef {
  /** Stable id, e.g. "inventory", "home-just-arrived", "landing-suv-in-jammu". */
  listId: string
  /** What a person would call it, e.g. "Just arrived". */
  listName?: string
}

/**
 * A list of cars was shown. Use the <ListView> component
 * (components/analytics/list-view.tsx) rather than calling this from an
 * effect by hand: it already fires once per distinct set of cars.
 */
export function trackViewItemList(list: ListRef, vehicles: ItemVehicle[]): void {
  if (vehicles.length === 0) return
  pushEvent('view_item_list', {
    item_list_id: list.listId,
    item_list_name: list.listName ?? list.listId,
    result_count: vehicles.length,
    items: vehicles.slice(0, MAX_LIST_ITEMS).map((v, i) => ({
      ...vehicleItem(v, i),
      item_list_id: list.listId,
    })),
  })
}

/**
 * A car was picked from a list, for a control that is NOT a link (a link to a
 * car page is tracked by itself, see the top of this file).
 */
export function trackSelectItem(list: ListRef, vehicle: ItemVehicle, index?: number): void {
  pushEvent('select_item', {
    item_list_id: list.listId,
    item_list_name: list.listName ?? list.listId,
    items: [{ ...vehicleItem(vehicle, index), item_list_id: list.listId }],
  })
}

export interface FilterContext {
  /** How many filters are on after this change. */
  activeFilterCount?: number
  /** How many cars match after this change, when it is already known. */
  resultCount?: number
}

/** One filter was set or cleared. `value` is '' when it was cleared. */
export function trackFilter(name: string, value: string | number | null, context: FilterContext = {}): void {
  pushEvent('filter_apply', {
    filter_name: name,
    filter_value: value === null || value === '' ? '(cleared)' : String(value),
    active_filter_count: context.activeFilterCount,
    result_count: context.resultCount,
  })
}

/** "Clear all" was pressed. */
export function trackFilterReset(context: FilterContext = {}): void {
  pushEvent('filter_reset', {
    active_filter_count: context.activeFilterCount,
    result_count: context.resultCount,
  })
}

/** The sort order was changed. */
export function trackSort(sort: string, context: FilterContext = {}): void {
  pushEvent('sort_change', { sort, result_count: context.resultCount })
}

/**
 * Results for a typed search were shown. Fires GA4's view_search_results, and
 * search_no_results as well when nothing matched: the searches the stock could
 * not answer are the ones worth reading.
 */
export function trackSearchResults(term: string, resultCount: number, context: FilterContext = {}): void {
  const search_term = term.trim().slice(0, 100)
  if (!search_term) return
  const params = {
    search_term,
    result_count: resultCount,
    active_filter_count: context.activeFilterCount,
  }
  pushEvent('view_search_results', params)
  if (resultCount === 0) pushEvent('search_no_results', params)
}

/**
 * The FIRST time a visitor moves a car's photo gallery. Call it on every
 * arrow, thumbnail or swipe: it only sends once per car per page.
 */
const galleriesTouched = new Set<string>()
export function trackGalleryInteract(
  itemId: string | number,
  method: 'arrow' | 'thumb' | 'swipe',
  where: 'vdp' | 'card' = 'vdp',
): void {
  const key = `${where}:${itemId}`
  if (galleriesTouched.has(key)) return
  galleriesTouched.add(key)
  pushEvent('gallery_interact', { item_id: String(itemId), method, gallery: where })
}

/**
 * How far through a car's photos the visitor got. Call it ONCE, when the
 * gallery unmounts or the tab is hidden, not on every swipe.
 */
export function trackGalleryDepth(itemId: string | number, photosSeen: number, photoCount: number): void {
  if (photosSeen <= 1) return
  pushEvent('gallery_depth', {
    item_id: String(itemId),
    photos_seen: photosSeen,
    photo_count: photoCount,
  })
}

/** A page that does not exist was shown. Use <NotFoundBeacon /> in app/not-found.tsx. */
export function trackNotFound(): void {
  if (typeof window === 'undefined') return
  pushEvent('page_not_found', {
    page_path: window.location.pathname,
    // Host and path only: a referrer's query string is not ours to keep.
    page_referrer: document.referrer.split(/[?#]/)[0] || undefined,
  })
}
