'use client'

import React, { useState } from 'react'
import {
  Globe,
  Bell,
  Shield,
  Laptop,
  AlertTriangle,
  UserX,
  CheckCircle2,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Patient } from '@/modules/patients/types'

interface PatientSettingsClientProps {
  patient: Patient | null
  userEmail: string
}

export function PatientSettingsClient({
  patient,
  userEmail,
}: PatientSettingsClientProps) {
  const { locale, setLocale, dict } = useLanguage()
  const pt = dict.patientPortal

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivated, setDeactivated] = useState(false)

  const handleToggleLanguage = (newLang: 'en' | 'bn') => {
    setLocale(newLang)
    setSavedNotice(newLang === 'bn' ? 'ভাষা সফলভাবে পরিবর্তন করা হয়েছে।' : 'Language preference updated.')
    setTimeout(() => setSavedNotice(null), 3000)
  }

  const handleSaveNotifications = () => {
    setSavedNotice('Notification preferences updated.')
    setTimeout(() => setSavedNotice(null), 3000)
  }

  const handleConfirmDeactivation = () => {
    setShowDeactivateModal(false)
    setDeactivated(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {pt.settings.title}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          {pt.settings.subtitle}
        </p>
      </div>

      {savedNotice && (
        <Alert className="bg-teal-50 border-teal-200 text-teal-800">
          <CheckCircle2 className="h-4 w-4 text-teal-600" />
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{savedNotice}</AlertDescription>
        </Alert>
      )}

      {deactivated && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Deactivation Request Submitted</AlertTitle>
          <AlertDescription>
            Your account deactivation request is being processed. In accordance with medical governance, your clinical health records will be safely archived.
          </AlertDescription>
        </Alert>
      )}

      {/* Language Preference */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              {pt.settings.language}
            </CardTitle>
          </div>
          <CardDescription>
            Choose your preferred language for assessment questionnaires, risk guidance, and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              onClick={() => handleToggleLanguage('en')}
              className="flex items-center gap-2"
            >
              English
            </Button>
            <Button
              variant={locale === 'bn' ? 'default' : 'outline'}
              onClick={() => handleToggleLanguage('bn')}
              className="flex items-center gap-2"
            >
              বাংলা (Bangla)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              {pt.settings.notifications}
            </CardTitle>
          </div>
          <CardDescription>
            Control how and when you receive automated reminders and clinician updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-3.5 rounded-lg border border-border">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {pt.settings.emailUpdates}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sent to: <span className="font-mono text-foreground">{userEmail}</span>
              </p>
            </div>
            <Switch
              checked={emailAlerts}
              onChange={(e) => {
                setEmailAlerts(e.target.checked)
                handleSaveNotifications()
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-border">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {pt.settings.smsAlerts}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sent to: <span className="font-mono text-foreground">{patient?.phoneNumber || '+880 1711-000000'}</span>
              </p>
            </div>
            <Switch
              checked={smsAlerts}
              onChange={(e) => {
                setSmsAlerts(e.target.checked)
                handleSaveNotifications()
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Session & Device Information */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Security & Active Sessions
            </CardTitle>
          </div>
          <CardDescription>
            Current authenticated sessions accessing your Lungent patient portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/15">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Laptop className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    Current Web Session
                  </h4>
                  <Badge variant="success" className="text-[10px]">Active Now</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Macintosh / Chrome • IP: 103.145.xxx.xxx (Dhaka, Bangladesh)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deactivation Section */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <UserX className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">
              {pt.settings.deactivateBtn}
            </CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            {pt.settings.deactivateNotice}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowDeactivateModal(true)}
            disabled={deactivated}
          >
            {pt.settings.deactivateBtn}
          </Button>
        </CardContent>
      </Card>

      {/* Deactivation Confirmation Dialog */}
      <ConfirmDialog
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivation}
        title="Confirm Account Deactivation"
        description="Are you sure you want to deactivate your Lungent web portal account? Your online login credentials will be revoked. In accordance with Bangladesh healthcare record-retention laws, your underlying medical assessments and health records cannot be destroyed and will remain archived securely for clinical governance."
        confirmText="Confirm Deactivation"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
