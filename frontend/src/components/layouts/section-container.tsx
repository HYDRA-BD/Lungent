import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function SectionContainer({
  as: Component = 'section',
  size = 'lg',
  className,
  children,
  ...props
}: SectionContainerProps) {
  const sizeClasses = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[1440px]",
    full: "w-full",
  }[size]

  return (
    <Component
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses, className)}
      {...props}
    >
      {children}
    </Component>
  )
}
