import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
  variant?: 'full' | 'compact' | 'mark-only'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTagline?: boolean
  href?: string
}

export function Logo({
  className,
  variant = 'compact',
  size = 'md',
  showTagline = false,
  href = '/',
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: 'text-base', tagline: 'text-[10px]' },
    md: { icon: 28, text: 'text-xl', tagline: 'text-xs' },
    lg: { icon: 36, text: 'text-2xl', tagline: 'text-sm' },
    xl: { icon: 48, text: 'text-3xl', tagline: 'text-base' },
  }

  const currentSize = sizeMap[size]

  const Mark = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform group-hover:scale-105"
      aria-hidden="true"
    >
      {/* Background circle badge */}
      <rect width="32" height="32" rx="8" className="fill-primary/10 dark:fill-primary/20" />
      
      {/* Central Airway Stem (Trachea) */}
      <path
        d="M16 6V15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-primary"
      />

      {/* Left Bronchial Arch & Lobar Flow */}
      <path
        d="M16 14C13 14 9 17 9 21C9 23.5 11 25.5 13.5 25.5C15 25.5 16 24 16 22.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />

      {/* Right Bronchial Arch & Lobar Flow */}
      <path
        d="M16 14C19 14 23 17 23 21C23 23.5 21 25.5 18.5 25.5C17 25.5 16 24 16 22.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />

      {/* Cross-vital pulse dot (assessment node) */}
      <circle cx="16" cy="18" r="1.5" className="fill-primary" />
    </svg>
  )

  const content = (
    <div className={cn('group inline-flex items-center gap-2.5 select-none', className)}>
      {Mark}
      {variant !== 'mark-only' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span className={cn('font-bold tracking-tight text-foreground font-sans', currentSize.text)}>
              Lung<span className="text-primary">ent</span>
            </span>
            {variant === 'full' && (
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                Clinical
              </span>
            )}
          </div>
          {(showTagline || variant === 'full') && (
            <span className={cn('text-muted-foreground font-medium hidden sm:block', currentSize.tagline)}>
              Understand risk. Reveal insights. Guide decisions.
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:ring-2 focus-visible:ring-ring rounded-xl p-1 transition-all duration-200 hover:opacity-85 hover:scale-[1.02] cursor-pointer"
        aria-label="Lungent — Home"
      >
        {content}
      </Link>
    )
  }

  return content
}
