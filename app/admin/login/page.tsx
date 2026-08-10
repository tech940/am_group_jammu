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
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-6">
      <LoginForm next={next ?? "/admin"} />
    </div>
  )
}
