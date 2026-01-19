import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import Link from "next/link"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

function EmptyState({
  className,
  title = "No data found",
  message = "There's nothing here yet.",
  actionLabel,
  actionHref,
  onAction,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      {...props}
    >
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-[rgba(0,0,0,0.45)] mb-2">
        Empty
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] max-w-md mb-6 italic">
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

export { EmptyState }
