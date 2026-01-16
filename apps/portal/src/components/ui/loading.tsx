import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  size?: "sm" | "default" | "lg"
}

function Loading({
  className,
  text = "LOADING...",
  size = "default",
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "text-[10px]",
    default: "text-xs",
    lg: "text-sm",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center font-mono uppercase tracking-[0.12em] text-[rgba(0,0,0,0.45)]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {text}
    </div>
  )
}

export { Loading }
