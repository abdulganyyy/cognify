import * as React from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export interface BookmarkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bookmarked?: boolean
  size?: "sm" | "md" | "icon"
}

const sizeMap = {
  sm: "h-8 px-3",
  md: "h-9 px-3.5",
  icon: "h-9 w-9",
}

export function BookmarkButton({
  bookmarked = false,
  size = "icon",
  className,
  ...props
}: BookmarkButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground",
        bookmarked &&
          "border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-300",
        sizeMap[size],
        className
      )}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Hapus bookmark" : "Simpan bookmark"}
      {...props}
    >
      <Bookmark
        className={cn(
          "h-4 w-4",
          bookmarked && "fill-current"
        )}
      />
      {size !== "icon" ? (
        <span className="ml-2 text-sm">
          {bookmarked ? "Tersimpan" : "Simpan"}
        </span>
      ) : null}
    </Button>
  )
}