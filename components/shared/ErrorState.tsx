import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface ErrorStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Ada sesuatu yang tidak berjalan semestinya. Silakan coba lagi.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 px-6 py-8 text-center dark:border-red-950 dark:bg-red-950/20",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-background text-red-500 dark:border-red-900">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}