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
        "font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[#3B5FE6] pb-4 mb-6 border-b border-dotted border-[rgba(59,95,230,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export { SectionHeader }
