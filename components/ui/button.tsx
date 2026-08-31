import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * The application's button.
 *
 * Replaces the shadcn default this project shipped with, which carried a
 * `shadow` on the primary variant, `rounded-md`, a 36px default height (under
 * the 44px touch floor), and a `premium` variant that existed to paper over the
 * fact that the default did not match the brand.
 *
 * Sizes are touch-first: `md` is 44px because that is the WCAG 2.5.8 floor and
 * most of this audience is on a phone. `sm` at 36px is for dense admin toolbars
 * only, where a pointer is a safe assumption.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-button " +
    "transition-colors duration-(--duration-1) cursor-pointer " +
    "disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98] motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        // Accent fill. The one loud control on a screen; if two are competing,
        // one of them is the wrong variant.
        primary: "bg-accent text-on-accent hover:bg-accent-hover",
        // Default action on a light ground.
        secondary: "border border-line-strong bg-surface text-ink hover:bg-ground-2",
        // The loud control on a DARK ground. `primary`'s deep blue measures
        // 2.7:1 there and would read as a hole in the page; the pale end of the
        // accent is the one that carries a fill on graphite.
        bright:
          "bg-accent-bright text-on-accent-bright hover:bg-accent-bright-hover",
        // The quiet control on a dark ground: a frosted pane with a lit edge.
        // `.glass` carries its own no-blur and reduced-transparency fallbacks.
        glass:
          "glass rounded-sm text-on-deep hover:border-[var(--glass-edge-strong)]",
        // Outline on dark grounds.
        onDeep: "border border-line-on-deep text-on-deep hover:bg-ground hover:text-ink",
        ghost: "text-ink hover:bg-ground-2",
        danger: "bg-danger text-on-deep hover:bg-danger-hover",
        link: "text-accent-text-light underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-7",
        icon: "h-11 w-11 px-0",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", full: false },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, full, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp className={cn(buttonVariants({ variant, size, full, className }))} ref={ref} {...props} />
  )
})

export { Button, buttonVariants }
