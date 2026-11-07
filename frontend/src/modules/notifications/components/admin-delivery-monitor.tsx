'use client'

import React, { useState, useTransition } from 'react'
import {
  Bell,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  RotateCcw,
  Activity,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLanguage } from '@/i18n'
import { retryNotificationDeliveryAction } from '../actions'
import type { DeliveryMetricsSummary, NotificationDeliveryItem } from '../types'

export interface AdminDeliveryMonitorProps {
  initialMetrics: DeliveryMetricsSummary
  initialRecentDeliveries: NotificationDeliveryItem[]
}

export function AdminDeliveryMonitor({
  initialMetrics,
  initialRecentDeliveries,
}: AdminDeliveryMonitorProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [metrics] = useState<DeliveryMetricsSummary>(initialMetrics)
  const [deliveries, setDeliveries] = useState<NotificationDeliveryItem[]>(initialRecentDeliveries)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  const handleRetry = (deliveryId: string) => {
    setRetryingId(deliveryId)
    setNotificationMsg(null)
    startTransition(async () => {
      const res = await retryNotificationDeliveryAction(deliveryId)
      setRetryingId(null)
      if (res.success && res.data) {
        setDeliveries((prev) =>
          prev.map((d) => (d.id === deliveryId ? res.data! : d))
        )
        setNotificationMsg(
          isBn
            ? `ডেলিভারি পুনঃচেষ্টা সফল: স্ট্যাটাস এখন ${res.data.deliveryStatus}`
            : `Retry completed: status is now ${res.data.deliveryStatus}`
        )
      } else {
        setNotificationMsg(
          res.error || (isBn ? 'পুনঃচেষ্টা ব্যর্থ হয়েছে।' : 'Delivery retry failed.')
        )
      }
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {isBn ? 'বিতরিত' : 'Delivered'}
          </Badge>
        )
      case 'sent':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300">
            <Send className="h-3 w-3 mr-1" />
            {isBn ? 'প্রেরিত' : 'Sent'}
          </Badge>
        )
      case 'failed':
      case 'rejected':
      case 'bounced':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {isBn ? 'ব্যর্থ' : 'Failed'}
          </Badge>
        )
      case 'queued':
      case 'pending':
        return (
          <Badge variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            {isBn ? 'অপেক্ষমাণ' : 'Pending'}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <Smartphone className="h-4 w-4 text-emerald-600" />
      case 'email':
        return <Mail className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Notifications */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isBn ? 'মোট নোটিফিকেশন' : 'Total Notifications'}
              </span>
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {metrics.totalNotifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {metrics.totalDeliveries} {isBn ? 'ডেলিভারি টাস্ক তৈরি হয়েছে' : 'multi-channel deliveries'}
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isBn ? 'ডেলিভারি সাফল্যের হার' : 'Success Rate'}
              </span>
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {metrics.deliverySuccessRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {metrics.deliveredCount} {isBn ? 'বিতরিত' : 'delivered successfully'}
          </CardContent>
        </Card>

        {/* Failed Count */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isBn ? 'ব্যর্থ ডেলিভারি' : 'Failed Deliveries'}
              </span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              {metrics.failedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {metrics.pendingCount} {isBn ? 'কিউতে অপেক্ষমাণ' : 'currently in queue'}
          </CardContent>
        </Card>

        {/* Channel Breakdown */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                {isBn ? 'মাধ্যম অনুপাত' : 'Channel Breakdown'}
              </span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1">
                <Bell className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold">{metrics.inAppCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-semibold">{metrics.smsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-semibold">{metrics.emailCount}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isBn ? 'ইন-অ্যাপ, এসএমএস এবং ইমেইল' : 'In-App, SMS, and Email'}
          </CardContent>
        </Card>
      </div>

      {/* Provider Status Indicators */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isBn ? 'যোগাযোগ গেটওয়ে ও প্রোভাইডার স্থিতি' : 'Communication Gateways & Provider Status'}
          </CardTitle>
          <CardDescription>
            {isBn
              ? 'এসএমএস গেটওয়ে ও ইমেইল প্রোভাইডারের সক্রিয় অবস্থা এবং রিয়েলটাইম সংযোগ'
              : 'Real-time telemetry and health status for external notification dispatch providers.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-sm font-semibold">Bangladesh SMS Gateway</div>
                  <div className="text-xs text-muted-foreground">
                    {isBn ? 'বাংলাদেশ ই.১৬৪ গেটওয়ে' : 'Bangladesh E.164 SMS Gateway'}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {metrics.providerStatuses.sms.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-sm font-semibold">Transactional Clinical Email</div>
                  <div className="text-xs text-muted-foreground">
                    {isBn ? 'ট্রানজ্যাকশনাল ইমেইল গেটওয়ে' : 'Transactional Clinical Email Dispatch'}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {metrics.providerStatuses.email.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification / Toast Message */}
      {notificationMsg && (
        <div className="p-3 bg-muted border border-border rounded-lg text-xs font-medium text-foreground flex items-center justify-between">
          <span>{notificationMsg}</span>
          <Button variant="ghost" size="sm" onClick={() => setNotificationMsg(null)} className="h-6 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {/* Recent Deliveries Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {isBn ? 'সাম্প্রতিক ডেলিভারি লগ' : 'Recent Dispatch & Delivery Logs'}
          </CardTitle>
          <CardDescription>
            {isBn
              ? 'নিরাপত্তা নিশ্চিতকরণে সংবেদনশীল স্বাস্থ্যতথ্য বা পূর্ণ ফলাফল বহিরাগত লগে প্রদর্শিত হয় না।'
              : 'Audit log of multi-channel notification dispatches. Sensitive health records and diagnoses are redacted from external logs.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Channel</TableHead>
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Last Attempt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div className="flex items-center justify-center p-1 rounded bg-muted/60">
                        {getChannelIcon(delivery.channel)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {delivery.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {delivery.recipientTarget || 'User In-App'}
                    </TableCell>
                    <TableCell>{getStatusBadge(delivery.deliveryStatus)}</TableCell>
                    <TableCell className="text-xs font-medium">
                      {delivery.attemptsCount} / 3
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {delivery.lastAttemptAt
                        ? new Date(delivery.lastAttemptAt).toLocaleString()
                        : 'Pending'}
                    </TableCell>
                    <TableCell className="text-right">
                      {delivery.deliveryStatus === 'failed' || delivery.deliveryStatus === 'rejected' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={retryingId === delivery.id || isPending}
                          onClick={() => handleRetry(delivery.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <RotateCcw className={`h-3 w-3 ${retryingId === delivery.id ? 'animate-spin' : ''}`} />
                          Retry
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">OK</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
