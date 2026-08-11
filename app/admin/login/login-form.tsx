"use client"

import { useActionState } from "react"
import { login } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/field"
import { Alert, Spinner } from "@/components/ui/feedback"

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, {})

  return (
    <div className="w-full max-w-sm">
      <div className="border border-line bg-surface p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-h2 uppercase text-ink">AM Group Admin</h1>
          <p className="mt-1 text-small text-ink-2">
            Sign in to manage leads and inventory
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <Field label="Password" required>
            {(field) => (
              <Input
                {...field}
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
              />
            )}
          </Field>

          {state?.error && <Alert tone="danger">{state.error}</Alert>}

          <Button type="submit" size="lg" full disabled={pending}>
            {pending ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-caption text-ink-2">
        Authorised staff only. This area contains customer contact details.
      </p>
    </div>
  )
}
