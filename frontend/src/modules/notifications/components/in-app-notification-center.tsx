'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Share2,
  CalendarCheck,
  FileText,
  UserCheck,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  acknowledgeNotificationAction,
} from '../actions'
import type { AppNotificationItem, NotificationCategory } from '../types'

export interface InAppNotificationCenterProps {
  initialNotifications: AppNotificationItem[]
  userId: string
  userRole?: 'patient' | 'clinician' | 'healthcare_worker' | 'admin'
  onRefresh?: () => void
}

export function InAppNotificationCenter({
  initialNotifications,
  onRefresh,
}: InAppNotificationCenterProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [notifications, setNotifications] = useState<AppNotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationCategory>('all')
  const [isUpdating, setIsUpdating] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const urgentCount = notifications.filter((n) => n.priority === 'urgent' && !n.isRead).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.category === filter
  })

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    )
    await markNotificationReadAction(id)
    if (onRefresh) onRefresh()
  }

  const handleMarkAllRead = async () => {
    setIsUpdating(true)
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    await markAllNotificationsReadAction()
    setIsUpdating(false)
    if (onRefresh) onRefresh()
  }

  const handleAcknowledge = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isRead: true, acknowledgedAt: new Date().toISOString() }
          : item
      )
    )
    await acknowledgeNotificationAction(id)
    if (onRefresh) onRefresh()
  }

  const getCategoryIcon = (category: NotificationCategory, priority: string) => {
    if (priority === 'urgent' || category === 'urgent_workflow') {
      return <ShieldAlert className="h-4 w-4 text-red-600 animate-pulse shrink-0" />
    }
    switch (category) {
      case 'referral':
        return <Share2 className="h-4 w-4 text-blue-600 shrink-0" />
      case 'follow_up':
        return <CalendarCheck className="h-4 w-4 text-emerald-600 shrink-0" />
      case 'assessment':
        return <FileText className="h-4 w-4 text-primary shrink-0" />
      case 'clinical_review':
        return <UserCheck className="h-4 w-4 text-teal-600 shrink-0" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isBn ? 'সকল' : 'All'} ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isBn ? 'অপঠিত' : 'Unread'}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 min-w-4">
                {unreadCount}
              </Badge>
            )}
          </button>

          {urgentCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('urgent_workflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                filter === 'urgent_workflow'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              {isBn ? 'জরুরি' : 'Urgent'} ({urgentCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilter('referral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'referral'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isBn ? 'রেফারেল' : 'Referrals'}
          </button>

          <button
            type="button"
            onClick={() => setFilter('follow_up')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'follow_up'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isBn ? 'ফলো-আপ' : 'Follow-ups'}
          </button>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isUpdating}
            className="text-xs gap-1.5 shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {isBn ? 'সকল পঠিত হিসেবে চিহ্নিত করুন' : 'Mark All as Read'}
          </Button>
        )}
      </div>

      {/* Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center space-y-2">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              {isBn ? 'কোনো নোটিফিকেশন নেই' : 'No notifications'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {filter === 'unread'
                ? isBn
                  ? 'আপনার কোনো অপঠিত নোটিফিকেশন নেই।'
                  : 'You have caught up with all notifications.'
                : isBn
                ? 'এই ক্যাটাগরিতে কোনো বার্তা পাওয়া যায়নি।'
                : 'No alerts found matching this filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((n) => {
            const title = isBn && n.titleBn ? n.titleBn : n.title
            const body = isBn && n.bodyBn ? n.bodyBn : n.body
            const isUrgent = n.priority === 'urgent'

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all ${
                  !n.isRead
                    ? isUrgent
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-primary/40 bg-primary/[0.03]'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">{getCategoryIcon(n.category, n.priority)}</div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm ${
                            !n.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground'
                          }`}
                        >
                          {title}
                        </h4>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        {isUrgent && (
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0">
                            {isBn ? 'জরুরি' : 'Urgent'}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground flex-wrap">
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                        <span>• Source: {n.sourceModule}</span>
                        {n.actionUrl && (
                          <Link
                            href={n.actionUrl}
                            onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                          >
                            {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {n.requiresAcknowledgement && !n.acknowledgedAt && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAcknowledge(n.id)}
                        className="text-xs gap-1 bg-red-600 hover:bg-red-700 text-white h-8"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isBn ? 'স্বীকৃতি দিন' : 'Acknowledge'}
                      </Button>
                    )}

                    {!n.isRead && !n.requiresAcknowledgement && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                      >
                        {isBn ? 'পঠিত' : 'Mark read'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
