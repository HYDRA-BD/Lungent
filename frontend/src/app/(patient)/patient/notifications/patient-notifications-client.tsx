'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Bell,
  ExternalLink,
  CheckCheck,
  FileText,
  Share2,
  UserCheck,
  SlidersHorizontal,
  ShieldAlert,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { markNotificationReadAction } from '@/modules/patient-portal/actions'
import type { PatientNotificationItem } from '@/modules/patient-portal/types'
import { NotificationPreferencesCard } from '@/modules/notifications/components/notification-preferences-card'
import type { UserNotificationPreferences } from '@/modules/notifications/types'

interface PatientNotificationsClientProps {
  initialNotifications: PatientNotificationItem[]
  patientId: string
  initialPreferences?: UserNotificationPreferences
}

export function PatientNotificationsClient({
  initialNotifications,
  patientId,
  initialPreferences,
}: PatientNotificationsClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const pt = dict.patientPortal
  const [notifications, setNotifications] = useState<PatientNotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [activeTab, setActiveTab] = useState<'feed' | 'preferences'>('feed')
  const [isPending, startTransition] = useTransition()

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
    )

    startTransition(async () => {
      await markNotificationReadAction(patientId, notificationId)
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))

    startTransition(async () => {
      for (const n of notifications.filter((item) => !item.isRead)) {
        await markNotificationReadAction(patientId, n.id)
      }
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'referral':
        return <Share2 className="h-4 w-4 text-blue-600" />
      case 'clinical_review':
        return <UserCheck className="h-4 w-4 text-teal-600" />
      case 'assessment':
        return <FileText className="h-4 w-4 text-primary" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const defaultPreferences: UserNotificationPreferences = initialPreferences || {
    userId: patientId,
    inAppEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    assessmentUpdates: true,
    referralUpdates: true,
    followupReminders: true,
    urgentAlerts: true,
    phoneNumber: '+8801711000000',
    emailAddress: 'patient@example.com',
    preferredLanguage: isBn ? 'bn' : 'en',
    updatedAt: new Date().toISOString(),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {pt.notifications.title}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
            {pt.notifications.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <ThemeToggle />

          {activeTab === 'feed' && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="flex items-center gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              {pt.notifications.markAllRead} ({unreadCount})
            </Button>
          )}

          <Button
            variant={activeTab === 'preferences' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(activeTab === 'feed' ? 'preferences' : 'feed')}
            className="flex items-center gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeTab === 'feed'
              ? (isBn ? 'যোগাযোগ সেটিংস' : 'Delivery Preferences')
              : (isBn ? 'নোটিফিকেশন ফিড' : 'Back to Feed')}
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'preferences' ? (
        <NotificationPreferencesCard
          initialPreferences={defaultPreferences}
          userId={patientId}
          userPhone={defaultPreferences.phoneNumber}
          userEmail={defaultPreferences.emailAddress}
        />
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              {pt.notifications.all} ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="relative"
            >
              {pt.notifications.unread}
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-primary/20 font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center space-y-3">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold text-foreground">
                  {pt.notifications.noNotifications}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  You are all caught up! Updates regarding assessment evaluations, follow-ups, and notifications will be logged here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <Card
                  key={n.id}
                  className={`border-border transition-colors ${
                    !n.isRead ? 'bg-primary/5 border-primary/30' : 'bg-card'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-full bg-muted mt-0.5">
                        {getCategoryIcon(n.category)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-foreground text-base">
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="text-xs text-muted-foreground pt-1">
                          {new Date(n.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {n.linkUrl && (
                        <Link href={n.linkUrl}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n.id)
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
                      )}
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-xs"
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Non-diagnostic reassurance notice */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3.5 rounded-lg border border-border flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
            <span>
              {isBn
                ? 'লুঞ্জেন্ট সতর্কতা ও রেফারেল সেবা সময়োপযোগী স্বাস্থ্যসেবা সমন্বয়ের জন্য প্রদান করা হয়। এটি নিশ্চিত ক্যান্সার নির্ণয় নয়।'
                : 'Lungent notifications, reminders, and referrals coordinate care and specialist evaluation. They do not constitute a confirmed medical diagnosis of lung cancer.'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
