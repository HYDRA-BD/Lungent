'use client'

import * as React from "react"
import { UploadCloud, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FileUploadProps {
  label?: string
  accept?: string
  maxSizeMB?: number
  helpText?: string
  onFileSelect?: (file: File | null) => void
  disabled?: boolean
  className?: string
}

export function FileUpload({
  label = "Upload Document or Scan",
  accept = ".pdf,.png,.jpg,.jpeg,.dcm",
  maxSizeMB = 15,
  helpText = "Supported formats: PDF, DICOM, JPEG, PNG (up to 15MB)",
  onFileSelect,
  disabled = false,
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (file && file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds maximum allowed limit of ${maxSizeMB}MB`)
      return
    }
    setSelectedFile(file)
    if (onFileSelect) onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFile(file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <span className="text-sm font-medium text-foreground block">{label}</span>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-card/50",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-label={label}
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 p-2 bg-muted/60 rounded-lg w-full max-w-sm">
            <FileText className="size-8 text-primary shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-destructive rounded-full"
                aria-label="Remove uploaded file"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <UploadCloud className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">{helpText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
