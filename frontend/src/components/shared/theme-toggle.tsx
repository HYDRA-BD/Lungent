'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex size-9 sm:size-10 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground opacity-50',
          className
        )}
        aria-hidden="true"
      >
        <span className="size-4.5 rounded-full bg-muted-foreground/30" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'group relative inline-flex size-9 sm:size-10 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer',
        className
      )}
    >
      {/* Sun icon for Dark Mode (click to switch to light) */}
      <Sun
        className={cn(
          'size-4.5 transition-all duration-300 text-amber-500',
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute'
        )}
      />

      {/* Moon icon for Light Mode (click to switch to dark) */}
      <Moon
        className={cn(
          'size-4.5 transition-all duration-300 text-slate-700 dark:text-sky-300',
          isDark
            ? 'rotate-90 scale-0 opacity-0 absolute'
            : 'rotate-0 scale-100 opacity-100'
        )}
      />
    </button>
  )
}
