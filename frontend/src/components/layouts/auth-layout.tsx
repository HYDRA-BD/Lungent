import * as React from "react"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"

export interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Logo size="sm" variant="compact" href="/" />
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center py-8">
        <div
          className={cn(
            "w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-6",
            className
          )}
        >
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
            )}
          </div>

          <div>{children}</div>

          {footer && (
            <div className="pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground/80 py-2">
        <p>© 2026 Lungent. Secure Healthcare Identity & Verification.</p>
      </div>
    </div>
  )
}
