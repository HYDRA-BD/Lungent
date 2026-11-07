import * as React from "react"
import { cn } from "@/lib/utils"

export interface TimelineEvent {
  id: string
  title: string
  timestamp: string
  description?: string
  status?: 'completed' | 'current' | 'upcoming' | 'alert'
  icon?: React.ReactNode
}

export interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border", className)}>
      {events.map((event) => {
        const statusColors = {
          completed: "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950",
          current: "bg-primary ring-primary/20",
          upcoming: "bg-muted-foreground/40 ring-transparent",
          alert: "bg-rose-500 ring-rose-100 dark:ring-rose-950",
        }[event.status || 'completed']

        return (
          <div key={event.id} className="relative group">
            {/* Timeline node */}
            <div
              className={cn(
                "absolute -left-6 top-1 size-5 rounded-full flex items-center justify-center ring-4 transition-transform group-hover:scale-110",
                statusColors
              )}
            >
              {event.icon ? (
                <span className="text-white size-3">{event.icon}</span>
              ) : (
                <span className="size-2 rounded-full bg-background" />
              )}
            </div>

            {/* Event Content */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <h5 className="text-sm font-semibold text-foreground tracking-tight">
                  {event.title}
                </h5>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {event.timestamp}
                </time>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
