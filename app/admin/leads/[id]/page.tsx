import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { adminGetLead } from "@/lib/leads/actions"
import { LeadDetailClient } from "./lead-detail-client"

export const metadata: Metadata = {
  title: "Lead",
  robots: "noindex, nofollow",
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { lead, activities, overdue } = await adminGetLead(id)

  if (!lead) notFound()

  return <LeadDetailClient lead={lead} activities={activities} overdue={overdue} />
}
