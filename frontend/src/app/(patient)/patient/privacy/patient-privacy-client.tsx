'use client'

import React, { useState, useTransition } from 'react'
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  History,
  CheckCircle2,
  Link as LinkIcon,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { updateConsentAction, linkAnonymousSelfCheckAction } from '@/modules/patient-portal/actions'
import type { PatientConsentItem } from '@/modules/patient-portal/types'
import type { ConsentType } from '@/types/database'

interface PatientPrivacyClientProps {
  consents: PatientConsentItem[]
  patientId: string
}

export function PatientPrivacyClient({
  consents: initialConsents,
  patientId,
}: PatientPrivacyClientProps) {
  const { dict } = useLanguage()
  const pt = dict.patientPortal

  const [consents, setConsents] = useState<PatientConsentItem[]>(initialConsents)
  const [sessionCode, setSessionCode] = useState('')
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [consentError, setConsentError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleToggleConsent = (consentType: ConsentType, currentGranted: boolean) => {
    setConsentError(null)
    const newGranted = !currentGranted

    // Optimistic update
    setConsents((prev) =>
      prev.map((c) =>
        c.consentType === consentType
          ? { ...c, isGranted: newGranted, grantedAt: newGranted ? new Date().toISOString() : c.grantedAt }
          : c
      )
    )

    startTransition(async () => {
      const res = await updateConsentAction(patientId, {
        consentType,
        isGranted: newGranted,
      })
      if (!res.success) {
        setConsentError(res.error || 'Failed to update consent status')
        // Revert
        setConsents(initialConsents)
      }
    })
  }

  const handleLinkSession = (e: React.FormEvent) => {
    e.preventDefault()
    setLinkSuccess(null)
    setLinkError(null)

    if (!sessionCode.trim()) {
      setLinkError('Please enter your 6-character session code.')
      return
    }

    startTransition(async () => {
      const res = await linkAnonymousSelfCheckAction(patientId, {
        sessionCode: sessionCode.trim(),
        consentConfirmed: true,
      })

      if (res.success) {
        setLinkSuccess(res.data?.message || pt.privacy.linkSuccess)
        setSessionCode('')
      } else {
        setLinkError(res.error || 'Failed to link anonymous self-check session.')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {pt.privacy.title}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          {pt.privacy.subtitle}
        </p>
      </div>

      {consentError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{consentError}</AlertDescription>
        </Alert>
      )}

      {/* Mandatory Service Consent Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              {pt.privacy.mandatoryTerms}
            </CardTitle>
          </div>
          <CardDescription>
            These core permissions enable patient identity resolution, health records aggregation, and clinical decision workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Core Clinical Service Agreement & Terms of Use
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allows storing demographic and medical risk data in accordance with Bangladesh healthcare data governance.
                </p>
              </div>
              <Badge variant="success" className="shrink-0">
                Mandatory & Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
              Note: Mandatory service consent cannot be disabled individually while your account is active. To fully terminate platform data processing, request account deactivation under Account Settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optional Permissions & Granular Consents */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-lg font-semibold">
              {pt.privacy.optionalTerms}
            </CardTitle>
          </div>
          <CardDescription>
            You have granular control over these optional permissions. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Sharing Consent */}
          {(() => {
            const consent = consents.find((c) => c.consentType === 'care_team_sharing')
            const isGranted = consent ? consent.isGranted : true
            return (
              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      Authorized Healthcare Provider Network Sharing
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Permits sharing your clinical summaries, risk evaluations, and spirometry records with attending specialists at referral hospitals (e.g. NIDCH).
                    </p>
                  </div>
                  <Switch
                    checked={isGranted}
                    disabled={isPending}
                    onChange={() => handleToggleConsent('care_team_sharing', isGranted)}
                  />
                </div>
                {!isGranted && (
                  <Alert variant="warning" className="bg-amber-500/10 border-amber-500/30 text-amber-900 text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                      {pt.privacy.withdrawWarning}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )
          })()}

          {/* Health Data Collection Consent */}
          {(() => {
            const consent = consents.find((c) => c.consentType === 'health_data_collection')
            const isGranted = consent ? consent.isGranted : true
            return (
              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      Continuous Health Data Collection & Logging
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Permits saving ongoing vital readings, spirometry logs, and symptom check history into your longitudinal health record.
                    </p>
                  </div>
                  <Switch
                    checked={isGranted}
                    disabled={isPending}
                    onChange={() => handleToggleConsent('health_data_collection', isGranted)}
                  />
                </div>
              </div>
            )
          })()}

          {/* Notifications & Follow-up SMS Consent */}
          {(() => {
            const consent = consents.find((c) => c.consentType === 'sms_notifications')
            const isGranted = consent ? consent.isGranted : true
            return (
              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      Direct SMS & Email Clinical Follow-up Alerts
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Receive reminders for screening appointments, specialist consultations, and clinician assessment verifications.
                    </p>
                  </div>
                  <Switch
                    checked={isGranted}
                    disabled={isPending}
                    onChange={() => handleToggleConsent('sms_notifications', isGranted)}
                  />
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Link Prior Anonymous Self-Check */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              {pt.privacy.linkSelfCheck}
            </CardTitle>
          </div>
          <CardDescription>
            {pt.privacy.linkSelfCheckDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLinkSession} className="space-y-4 max-w-xl">
            {linkSuccess && (
              <Alert className="bg-teal-50 border-teal-200 text-teal-800">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{linkSuccess}</AlertDescription>
              </Alert>
            )}

            {linkError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{linkError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="session-code" className="text-sm font-medium text-foreground">
                Anonymous Session Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="session-code"
                  placeholder={pt.privacy.sessionCodePlaceholder}
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  disabled={isPending}
                  className="font-mono uppercase tracking-wider"
                />
                <Button type="submit" disabled={isPending} className="shrink-0">
                  {pt.privacy.linkBtn}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By linking your session, its answers will be securely attached to your patient record while maintaining historical provenance.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Consent Audit Trail */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Consent Audit History
            </CardTitle>
          </div>
          <CardDescription>
            Tamper-evident log of consent grants and modifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consents.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-xs py-2 border-b border-border last:border-0"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground uppercase tracking-wide">
                    {c.consentType.replace(/_/g, ' ')}
                  </span>
                  <div className="text-muted-foreground">
                    Version: {c.version}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={c.isGranted ? 'success' : 'secondary'} className="text-[10px]">
                    {c.isGranted ? 'Granted' : 'Revoked'}
                  </Badge>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    {new Date(c.grantedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
