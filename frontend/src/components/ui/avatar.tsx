import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = 'md',
  status,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false)

  const sizeClass = {
    sm: 'size-7 text-xs',
    md: 'size-9 text-sm',
    lg: 'size-12 text-base font-semibold',
    xl: 'size-16 text-xl font-bold',
  }[size]

  const statusClass = {
    online: 'bg-emerald-500',
    offline: 'bg-muted-foreground',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  }

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden border border-border bg-muted font-medium text-muted-foreground",
          sizeClass
        )}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="size-full object-cover"
          />
        ) : (
          <span aria-label={alt || fallback}>{fallback.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-background",
            statusClass[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}
