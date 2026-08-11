"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

import { CloseGlyph } from "@/components/system/marks"
import { cn } from "@/lib/utils"

/**
 * Toast.
 *
 * One of the two things in the system allowed to carry a shadow — it genuinely
 * floats over content — so it keeps `shadow-raised` and drops `shadow-lg`.
 * Everything else here moved onto tokens: surface + hairline instead of the
 * shadcn `bg-background`/`border-destructive` aliases, the type ramp instead of
 * `text-sm`/`text-xs`, and the 44px touch floor on the action and close
 * controls. Focus rings are removed rather than restyled: the one focus system
 * lives in the base layer of globals.css.
 */

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-3 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-md border p-4 shadow-raised " +
    "transition-colors duration-(--duration-2) " +
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 " +
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
    "data-[swipe=end]:animate-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
  {
    variants: {
      variant: {
        default: "border-line bg-surface text-ink",
        destructive: "destructive border-danger-line bg-danger-bg text-danger-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-11 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface px-4 text-button text-ink transition-colors duration-(--duration-1) hover:bg-ground-2 disabled:pointer-events-none disabled:opacity-55",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    // Always visible, not revealed on hover: a hover-gated dismiss control does
    // not exist for a touch or keyboard user.
    className={cn(
      "-my-1.5 -mr-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink-2 transition-colors duration-(--duration-1) hover:text-ink",
      className
    )}
    toast-close=""
    aria-label="Dismiss notification"
    {...props}
  >
    <CloseGlyph />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-label", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-small text-ink-2", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
