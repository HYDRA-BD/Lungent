import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-border/80 bg-background hover:bg-muted/60 hover:text-foreground shadow-xs hover:border-primary/30",
        ghost: "hover:bg-muted/70 hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-xs",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-xs",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-xs",
        link: "text-primary underline-offset-4 hover:underline cursor-pointer p-0 h-auto",
        subtle: "bg-primary/10 text-primary hover:bg-primary/20",
      },
      size: {
        default: "h-10 px-4 py-2 text-[15px] sm:text-base rounded-xl",
        xs: "h-7.5 px-2.5 text-xs sm:text-sm rounded-lg",
        sm: "h-9 px-3.5 py-1.5 text-sm sm:text-[15px] font-medium rounded-lg",
        lg: "h-12 px-6 py-3 text-base sm:text-lg rounded-2xl",
        xl: "h-14 px-8 py-3.5 text-lg sm:text-xl font-bold rounded-2xl",
        icon: "size-10 p-0 rounded-xl",
        "icon-sm": "size-8 p-0 rounded-lg",
        "icon-lg": "size-12 p-0 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </ButtonPrimitive>
  )
}

export interface IconButtonProps extends ButtonProps {
  "aria-label": string
  icon: React.ReactNode
}

function IconButton({
  icon,
  "aria-label": ariaLabel,
  size = "icon",
  ...props
}: IconButtonProps) {
  return (
    <Button size={size} aria-label={ariaLabel} {...props}>
      {icon}
    </Button>
  )
}

export { Button, IconButton, buttonVariants }
