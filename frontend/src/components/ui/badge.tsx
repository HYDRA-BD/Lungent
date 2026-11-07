import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border border-border",
        outline:
          "border border-border text-foreground bg-background",
        success:
          "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        warning:
          "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        destructive:
          "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        info:
          "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
        solidPrimary:
          "bg-primary text-primary-foreground border-transparent",
        solidDestructive:
          "bg-destructive text-destructive-foreground border-transparent",
      },
      size: {
        default: "px-3 py-1 text-xs sm:text-sm font-semibold",
        sm: "px-2.5 py-0.5 text-xs font-medium",
        lg: "px-4 py-1.5 text-sm sm:text-base font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const dotColorClass = {
    default: "bg-primary",
    secondary: "bg-muted-foreground",
    outline: "bg-foreground",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-rose-500",
    info: "bg-sky-500",
    solidPrimary: "bg-primary-foreground",
    solidDestructive: "bg-destructive-foreground",
  }[variant || "default"]

  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0 animate-pulse", dotColorClass)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
