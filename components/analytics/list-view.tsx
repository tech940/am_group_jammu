"use client"

import { useEffect } from "react"
import { trackViewItemList } from "@/lib/analytics/events"
import type { ItemVehicle } from "@/lib/analytics/events"

/**
 * Reports that a list of cars was shown (GA4 view_item_list). Renders nothing.
 *
 * Drop it next to any grid or rail of cars, server or client component:
 *
 *   <ListView listId="inventory" listName="All used cars" items={listItems(pageItems)} />
 *
 * `listItems` (lib/analytics/events.ts) cuts each car down to the few fields
 * the event uses, so the list is not serialised into the page a second time
 * with every photo address in it.
 *
 * It sends once per distinct set of cars, so a list that re-renders does not
 * count twice, while /inventory changing its results after a filter does count
 * again. Give the wrapper of the same list `data-track-list="inventory"` and
 * the click on a card is reported against the same list (see
 * lib/analytics/events.ts).
 */
export function ListView({
  listId,
  listName,
  items,
}: {
  listId: string
  listName?: string
  items: ItemVehicle[]
}) {
  // The ids, in order, are what makes a list "the same list".
  const signature = items.map((v) => v.id).join(",")

  useEffect(() => {
    trackViewItemList({ listId, listName }, items)
    // `items` is a new array on every render; `signature` is its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, listName, signature])

  return null
}
