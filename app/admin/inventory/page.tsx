import { redirect } from "next/navigation"

// This page used to show stock figures that were typed into the code, not
// counted from anything. The real list of cars is at /admin/vehicles; this
// address is kept only so an old bookmark still lands somewhere useful.
export default function AdminInventoryPage() {
  redirect("/admin/vehicles")
}
