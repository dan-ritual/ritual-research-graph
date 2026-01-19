import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
}

function ErrorState({
  className,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  retryText = "Try Again",
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      {...props}
    >
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-[#ef4444] mb-2">
        Error
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] max-w-md mb-6 italic">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  )
}

export { ErrorState }
