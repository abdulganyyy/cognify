import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface TopicTagProps {
  label: string
  icon?: React.ReactNode
  active?: boolean
  className?: string
}

export function TopicTag({
  label,
  icon,
  active = false,
  className,
}: TopicTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
          : "border-border bg-background text-muted-foreground",
        className
      )}
    >
      {icon ? <span className="flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      <span>{label}</span>
    </span>
  )
}