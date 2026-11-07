import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  showHome?: boolean
}

export function Breadcrumbs({
  items,
  showHome = true,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn("flex items-center text-xs text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHome && (
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center hover:text-foreground transition-colors p-1 rounded"
              aria-label="Home"
            >
              <Home className="size-3.5" />
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60 shrink-0 ml-1" aria-hidden="true" />
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isCurrent = item.current || isLast

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors font-medium p-0.5 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn("font-medium", isCurrent ? "text-foreground font-semibold" : "")}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
