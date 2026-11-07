'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, ShieldAlert } from 'lucide-react'

export interface AnalyticsMetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
    label: string
  }
  isSuppressed?: boolean
  suppressionNotice?: string
  onInfoClick?: () => void
}

export function AnalyticsMetricCard({
  title,
  value,
  description,
  icon,
  badge,
  trend,
  isSuppressed,
  suppressionNotice,
  onInfoClick,
}: AnalyticsMetricCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:border-border/80 hover:shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {onInfoClick && (
            <button
              type="button"
              onClick={onInfoClick}
              aria-label={`View metric definition for ${title}`}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
            >
              <Info className="size-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          {isSuppressed ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-lg">
              <ShieldAlert className="size-4" />
              <span>&lt; 5</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({suppressionNotice || 'Suppressed for privacy'})
              </span>
            </div>
          ) : (
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </div>
          )}
          {badge}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-1.5 text-xs mt-2">
            <Badge
              variant={
                trend.direction === 'up'
                  ? 'success'
                  : trend.direction === 'down'
                    ? 'destructive'
                    : 'secondary'
              }
              size="sm"
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
            </Badge>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
