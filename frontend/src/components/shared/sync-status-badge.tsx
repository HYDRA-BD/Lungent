'use client'

import React from 'react'
import {
  HardDrive,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  ShieldAlert,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import type { OfflineSyncStatus } from '@/modules/offline/types'
import { cn } from '@/lib/utils'

interface SyncStatusBadgeProps {
  status: OfflineSyncStatus
  lastSavedAt?: string | null
  className?: string
  showTimestamp?: boolean
}

export function SyncStatusBadge({
  status,
  lastSavedAt,
  className,
  showTimestamp = true,
}: SyncStatusBadgeProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const getStatusConfig = () => {
    switch (status) {
      case 'saved_locally':
        return {
          icon: <HardDrive className="size-3 text-slate-500" />,
          labelEn: 'Saved locally',
          labelBn: 'ডিভাইসে সংরক্ষিত',
          variant: 'outline' as const,
          colorClass: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40',
        }
      case 'waiting_to_sync':
        return {
          icon: <Clock className="size-3 text-amber-500" />,
          labelEn: 'Waiting to sync',
          labelBn: 'সিঙ্ক অপেক্ষমান',
          variant: 'outline' as const,
          colorClass: 'border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40',
        }
      case 'synchronizing':
        return {
          icon: <RefreshCw className="size-3 text-blue-500 animate-spin" />,
          labelEn: 'Synchronizing...',
          labelBn: 'সিঙ্ক হচ্ছে...',
          variant: 'outline' as const,
          colorClass: 'border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40',
        }
      case 'synced':
        return {
          icon: <CheckCircle2 className="size-3 text-emerald-600" />,
          labelEn: 'Synced',
          labelBn: 'সার্ভারে সিঙ্ক সম্পন্ন',
          variant: 'outline' as const,
          colorClass: 'border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40',
        }
      case 'sync_failed':
        return {
          icon: <AlertCircle className="size-3 text-rose-500" />,
          labelEn: 'Sync failed',
          labelBn: 'সিঙ্ক ব্যর্থ',
          variant: 'destructive' as const,
          colorClass: 'border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40',
        }
      case 'conflict_detected':
        return {
          icon: <AlertTriangle className="size-3 text-amber-600 animate-pulse" />,
          labelEn: 'Conflict detected',
          labelBn: 'দ্বন্দ্ব সনাক্ত হয়েছে',
          variant: 'outline' as const,
          colorClass: 'border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 font-semibold',
        }
      case 'auth_required':
        return {
          icon: <Lock className="size-3 text-purple-500" />,
          labelEn: 'Auth required',
          labelBn: 'পুনরায় লগইন প্রয়োজন',
          variant: 'outline' as const,
          colorClass: 'border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40',
        }
      case 'storage_unavailable':
        return {
          icon: <ShieldAlert className="size-3 text-destructive" />,
          labelEn: 'Storage unavailable',
          labelBn: 'স্টোরেজ অনুপলব্ধ',
          variant: 'destructive' as const,
          colorClass: 'border-destructive text-destructive bg-destructive/10',
        }
    }
  }

  const cfg = getStatusConfig()

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Badge
        variant={cfg.variant}
        className={cn(
          'text-xs px-2.5 py-0.5 flex items-center gap-1.5 transition-colors',
          cfg.colorClass
        )}
      >
        {cfg.icon}
        <span>{isBn ? cfg.labelBn : cfg.labelEn}</span>
      </Badge>

      {showTimestamp && lastSavedAt && (
        <span className="text-[11px] text-muted-foreground">
          {new Date(lastSavedAt).toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      )}
    </div>
  )
}

