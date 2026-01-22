import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden font-mono uppercase tracking-[0.08em] rounded-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--mode-accent)] text-white [a&]:hover:bg-[var(--mode-accent)]/90",
        secondary:
          "border-transparent bg-muted text-foreground [a&]:hover:bg-muted/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground border-[rgba(0,0,0,0.15)] [a&]:hover:bg-muted [a&]:hover:text-foreground",
        success:
          "border-transparent bg-[var(--success)]/10 text-[#16a34a] [a&]:hover:bg-[var(--success)]/20",
        warning:
          "border-transparent bg-[var(--warning)]/10 text-[#ca8a04] [a&]:hover:bg-[var(--warning)]/20",
        error:
          "border-transparent bg-destructive/10 text-[#dc2626] [a&]:hover:bg-destructive/20",
        dotted:
          "border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)] bg-transparent text-[var(--mode-accent)] [a&]:hover:bg-[var(--mode-accent)]/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants, type BadgeProps }
