import type { Metadata } from "next"
import { adminGetStats, adminGetStorageInfo, adminListLeads } from "@/lib/leads/actions"
import type { LeadFilters, LeadIntent, LeadSort, LeadStatus } from "@/lib/leads/types"
import { LeadsClient } from "./leads-client"

export const metadata: Metadata = {
  title: "Leads",
  robots: "noindex, nofollow",
}

const PAGE_SIZE = 25

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const one = (k: string): string => {
    const v = sp[k]
    return (Array.isArray(v) ? v[0] : v) ?? ""
  }

  const filters: LeadFilters = {
    status: (one("status") || "all") as LeadStatus | "all",
    intent: (one("intent") || "all") as LeadIntent | "all",
    search: one("q") || undefined,
    assignedTo: one("assigned") || undefined,
    dueOnly: one("due") === "1",
  }
  const sort = (one("sort") || "newest") as LeadSort
  const page = Math.max(1, Number.parseInt(one("page") || "1", 10) || 1)

  // Filtering and pagination happen on the server; the old admin pulled the
  // whole table into the browser and filtered it there.
  const [result, stats, storage] = await Promise.all([
    adminListLeads(filters, sort, page, PAGE_SIZE),
    adminGetStats(),
    adminGetStorageInfo(),
  ])

  return (
    <LeadsClient
      result={result}
      stats={stats}
      filters={filters}
      sort={sort}
      storageWarning={storage.warning}
    />
  )
}
