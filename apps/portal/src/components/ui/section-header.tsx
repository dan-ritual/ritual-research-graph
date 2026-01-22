import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

function SectionHeader({
  className,
  as: Component = "h2",
  children,
  ...props
}: SectionHeaderProps) {
  return (
    <Component
      className={cn(
        "font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--mode-accent)] pb-3 mb-6 border-b border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export { SectionHeader }
