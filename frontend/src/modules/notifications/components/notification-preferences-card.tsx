'use client'

import React, { useState, useTransition } from 'react'
import {
  Bell,
  Mail,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import { updateUserPreferencesAction } from '../actions'
import type { UserNotificationPreferences } from '../types'

export interface NotificationPreferencesCardProps {
  initialPreferences: UserNotificationPreferences
  userId: string
  userEmail?: string | null
  userPhone?: string | null
  onSaved?: (updated: UserNotificationPreferences) => void
}

export function NotificationPreferencesCard({
  initialPreferences,
  userEmail,
  userPhone,
  onSaved,
}: NotificationPreferencesCardProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [preferences, setPreferences] = useState<UserNotificationPreferences>(initialPreferences)
  const [phoneNumber, setPhoneNumber] = useState(userPhone || initialPreferences.phoneNumber || '')
  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleToggle = (key: keyof UserNotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setStatusMessage(null)
  }

  const handleSave = () => {
    setStatusMessage(null)
    startTransition(async () => {
      const res = await updateUserPreferencesAction({
        inAppEnabled: preferences.inAppEnabled,
        smsEnabled: preferences.smsEnabled,
        emailEnabled: preferences.emailEnabled,
        assessmentUpdates: preferences.assessmentUpdates,
        referralUpdates: preferences.referralUpdates,
        followupReminders: preferences.followupReminders,
        urgentAlerts: true, // enforce clinical safety: urgent alerts cannot be disabled
        phoneNumber: phoneNumber.trim() || undefined,
        emailAddress: userEmail || preferences.emailAddress || undefined,
        preferredLanguage: preferences.preferredLanguage || (isBn ? 'bn' : 'en'),
      })

      if (res.success && res.data) {
        setPreferences(res.data)
        setStatusMessage({
          type: 'success',
          text: isBn
            ? 'যোগাযোগ সেটিংস সফলভাবে সংরক্ষিত হয়েছে।'
            : 'Notification preferences updated successfully.',
        })
        if (onSaved) onSaved(res.data)
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || (isBn ? 'সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to update preferences.'),
        })
      }
    })
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">
            {isBn ? 'যোগাযোগ ও নোটিফিকেশন সেটিংস' : 'Notification & Communication Preferences'}
          </CardTitle>
        </div>
        <CardDescription>
          {isBn
            ? 'আপনি কীভাবে এবং কোন বিষয়ে সতর্কবার্তা পাবেন তা নিয়ন্ত্রণ করুন। জরুরি নিরাপত্তা ও ক্লিনিকাল সতর্কতা সব সময় চালু থাকে।'
            : 'Configure which channels and alerts you receive. Critical security alerts and urgent clinical escalations remain active for safety.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {statusMessage && (
          <Alert variant={statusMessage.type === 'success' ? 'default' : 'destructive'}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <AlertTitle>{statusMessage.type === 'success' ? (isBn ? 'সফল' : 'Success') : (isBn ? 'ত্রুটি' : 'Notice')}</AlertTitle>
            <AlertDescription>{statusMessage.text}</AlertDescription>
          </Alert>
        )}

        {/* Delivery Channels */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {isBn ? 'যোগাযোগের মাধ্যম' : 'Delivery Channels'}
          </h4>

          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
            {/* In-App */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {isBn ? 'অ্যাপের ভেতরে নোটিফিকেশন' : 'In-App Notifications'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isBn ? 'পোর্টাল এবং ওয়ার্কস্পেসে তাৎক্ষণিক নোটিফিকেশন পান' : 'Instant in-app notification center & workspace alerts'}
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.inAppEnabled}
                onChange={() => handleToggle('inAppEnabled')}
                aria-label="In-app notifications toggle"
              />
            </div>

            {/* SMS */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {isBn ? 'এসএমএস সতর্কবার্তা' : 'SMS Alerts'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isBn ? 'জরুরি ফলো-আপ ও রেফারেলের জন্য মুঠোফোনে খুদেবার্তা (+৮৮০)' : 'Mobile SMS for urgent follow-up and appointment confirmations'}
                  </div>
                  <div className="pt-1">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+88017XXXXXXXX"
                      className="h-8 max-w-xs text-xs font-mono"
                      aria-label="SMS Phone Number"
                    />
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.smsEnabled}
                onChange={() => handleToggle('smsEnabled')}
                aria-label="SMS alerts toggle"
              />
            </div>

            {/* Email */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {isBn ? 'ইমেইল বিজ্ঞপ্তি' : 'Email Notifications'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {userEmail || preferences.emailAddress || 'Registered contact email'}
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.emailEnabled}
                onChange={() => handleToggle('emailEnabled')}
                aria-label="Email notifications toggle"
              />
            </div>
          </div>
        </div>

        {/* Notification Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {isBn ? 'নোটিফিকেশনের বিষয়সমূহ' : 'Notification Categories'}
          </h4>

          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
            {/* Assessment */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {isBn ? 'অ্যাসেসমেন্ট ফলাফল ও আপডেট' : 'Assessment Results & Eligibility'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isBn ? 'ঝুঁকি মূল্যায়ন ও স্ক্রিনিং সুপারিশ প্রস্তুত হলে জানান' : 'Updates when lung cancer risk estimation and eligibility are ready'}
                </div>
              </div>
              <Switch
                checked={preferences.assessmentUpdates}
                onChange={() => handleToggle('assessmentUpdates')}
                aria-label="Assessment notifications toggle"
              />
            </div>

            {/* Referral */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {isBn ? 'হাসপাতাল ও বিশেষজ্ঞ রেফারেল' : 'Specialist Referrals'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isBn ? 'রেফারেল তৈরি, বুকিং ও হাসপাতাল পরামর্শ পত্রের আপডেট' : 'Status updates when specialist referral letters are created or updated'}
                </div>
              </div>
              <Switch
                checked={preferences.referralUpdates}
                onChange={() => handleToggle('referralUpdates')}
                aria-label="Referral notifications toggle"
              />
            </div>

            {/* Follow-up */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {isBn ? 'ফলো-আপ অ্যাপয়েন্টমেন্ট রিমাইন্ডার' : 'Follow-up Reminders'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isBn ? 'নির্ধারিত ফলো-আপ সাক্ষাতের ৪৮-৭২ ঘণ্টা পূর্বের স্মরণবার্তা' : '48-72h reminders for upcoming follow-up appointments and diagnostic visits'}
                </div>
              </div>
              <Switch
                checked={preferences.followupReminders}
                onChange={() => handleToggle('followupReminders')}
                aria-label="Follow-up notifications toggle"
              />
            </div>

            {/* Mandatory Urgent Alerts (Locked for Clinical Safety) */}
            <div className="p-4 flex items-center justify-between gap-4 bg-muted/40">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    {isBn ? 'জরুরি ক্লিনিকাল সতর্কতা ও নিরাপত্তা' : 'Urgent Clinical Escalations & Account Security'}
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded">
                      {isBn ? 'বাধ্যতামূলক' : 'Mandatory'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isBn
                      ? 'রোগী সুরক্ষার স্বার্থে লাল-পতাকা ট্রায়াজ সতর্কতা ও হিসাব নিরাপত্তা নোটিফিকেশন বন্ধ করা যায় না।'
                      : 'Urgent red-flag symptom escalations and critical account notices cannot be disabled to protect clinical safety.'}
                  </div>
                </div>
              </div>
              <Switch
                checked={true}
                disabled={true}
                aria-label="Urgent alerts permanently enabled"
              />
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer Notice */}
        <div className="text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
          <strong>{isBn ? 'ক্লিনিকাল নির্দেশনা:' : 'Clinical Safety Note:'}</strong>{' '}
          {isBn
            ? 'লুঞ্জেন্ট প্রেরিত রেফারেল ও অনুস্মারক কোনো চূড়ান্ত ক্যান্সার নির্ণয় নয়। এটি শুধুমাত্র সময়োপযোগী মূল্যায়ন ও বিশেষজ্ঞ পরামর্শের সমন্বয়ের জন্য প্রেরণ করা হয়।'
            : 'Lungent notifications, reminders, and referrals coordinate care and specialist evaluation. They do not constitute a confirmed medical diagnosis of lung cancer.'}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isPending ? (isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : (isBn ? 'পছন্দসমূহ সংরক্ষণ করুন' : 'Save Preferences')}
        </Button>
      </CardFooter>
    </Card>
  )
}
