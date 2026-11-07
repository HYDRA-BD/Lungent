'use client'

import * as React from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = React.useCallback(
    ({ title, description, type = 'info', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, type, duration }])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-card text-card-foreground animate-in slide-in-from-bottom-5 duration-200",
              toast.type === 'success' && "border-emerald-300 dark:border-emerald-800",
              toast.type === 'error' && "border-rose-300 dark:border-rose-800",
              toast.type === 'warning' && "border-amber-300 dark:border-amber-800",
              toast.type === 'info' && "border-sky-300 dark:border-sky-800"
            )}
          >
            <div className="shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="size-4 text-rose-600 dark:text-rose-400" />}
              {toast.type === 'warning' && <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />}
              {toast.type === 'info' && <Info className="size-4 text-sky-600 dark:text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-muted-foreground leading-normal">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded"
              aria-label="Dismiss toast"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
