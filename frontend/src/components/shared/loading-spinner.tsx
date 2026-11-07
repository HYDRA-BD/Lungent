import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: number
}

export function LoadingSpinner({ className, size = 20 }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label="Loading" className="inline-flex items-center justify-center">
      <Loader2
        size={size}
        className={cn('animate-spin text-muted-foreground', className)}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
