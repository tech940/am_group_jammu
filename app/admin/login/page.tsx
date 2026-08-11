import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/admin/auth"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: "noindex, nofollow",
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  if (await isAuthenticated()) redirect("/admin")
  const { next } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-6 py-10">
      <LoginForm next={next ?? "/admin"} />
    </div>
  )
}
