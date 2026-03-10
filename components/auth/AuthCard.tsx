import type { ReactNode } from "react"
import Link from "next/link"

interface AuthCardProps {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  footerText?: string
  footerLinkLabel?: string
  footerLinkHref?: string
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-6">{children}</div>

      {footerText && footerLinkLabel && footerLinkHref ? (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-primary transition-opacity hover:opacity-80"
          >
            {footerLinkLabel}
          </Link>
        </div>
      ) : null}
    </div>
  )
}