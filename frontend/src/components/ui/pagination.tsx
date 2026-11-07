import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  totalItems?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  className,
  ...props
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-muted-foreground", className)}
      {...props}
    >
      {totalItems !== undefined && (
        <div>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {Math.min((currentPage - 1) * (pageSize || 10) + 1, totalItems)}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(currentPage * (pageSize || 10), totalItems)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{totalItems}</span> entries
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          leftIcon={<ChevronLeft className="size-3.5" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }
            const isCurrent = p === currentPage
            return (
              <Button
                key={p}
                variant={isCurrent ? "default" : "outline"}
                size="xs"
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn("min-w-[28px]", isCurrent && "font-bold")}
              >
                {p}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          rightIcon={<ChevronRight className="size-3.5" />}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
