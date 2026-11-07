'use client'

import * as React from "react"
import { AlertTriangle, Info, Trash2 } from "lucide-react"
import { Dialog } from "./dialog"
import { Button } from "./button"

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'primary' | 'warning'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const icon = {
    destructive: <Trash2 className="size-5 text-destructive" />,
    warning: <AlertTriangle className="size-5 text-warning" />,
    primary: <Info className="size-5 text-primary" />,
  }[variant]

  const buttonVariant = {
    destructive: "destructive",
    warning: "warning",
    primary: "default",
  }[variant] as 'destructive' | 'warning' | 'default'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 pt-0.5">{icon}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Dialog>
  )
}
