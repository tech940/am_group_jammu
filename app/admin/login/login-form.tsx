"use client"

import { useActionState } from "react"
import { Lock, Loader2, ShieldAlert } from "lucide-react"
import { login } from "@/lib/admin/actions"

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, {})

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl border border-black/8 shadow-xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-[#023468] flex items-center justify-center mb-4 shadow-lg shadow-[#023468]/20">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#023468]">AM Group Admin</h1>
          <p className="text-xs text-black/45 font-semibold mt-1">
            Sign in to manage leads and inventory
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="w-full h-12 px-4 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
            />
          </div>

          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl bg-[#E31837]/8 border border-[#E31837]/20 px-3 py-2.5">
              <ShieldAlert className="h-4 w-4 text-[#E31837] shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-[#E31837] leading-relaxed">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-[#023468] hover:bg-[#01254a] disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-[10px] text-black/30 font-semibold mt-6 leading-relaxed">
        Authorised staff only. This area contains customer contact details.
      </p>
    </div>
  )
}
