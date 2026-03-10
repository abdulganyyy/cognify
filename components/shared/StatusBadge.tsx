import * as React from "react"
import { cn } from "@/lib/utils/cn"

type StatusVariant = "default" | "success" | "warning" | "danger" | "info"

export interface StatusBadgeProps {
  label: string
  status?: StatusVariant
  dot?: boolean
  className?: string
}

const statusStyles: Record<StatusVariant, string> = {
  default:
    "border-border bg-muted/50 text-muted-foreground",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-950/30 dark:text-amber-300",
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300",
  info:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-300",
}

const dotStyles: Record<StatusVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
}

export function StatusBadge({
  label,
  status = "default",
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status])}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  )
}