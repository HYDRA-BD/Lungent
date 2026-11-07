'use client'

import React from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Info,
  Stethoscope,
  HeartPulse,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ScreeningEvaluationDialog } from '@/modules/screening/components'
import type { Patient } from '@/modules/patients/types'
import type { PatientAssessmentItem } from '@/modules/patient-portal/types'

interface PatientScreeningClientProps {
  patient: Patient | null
  screeningEligible: boolean
  latestAssessment?: PatientAssessmentItem | null
}

export function PatientScreeningClient({
  patient,
  screeningEligible,
  latestAssessment,
}: PatientScreeningClientProps) {
  const { dict } = useLanguage()
  const pt = dict.patientPortal

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {pt.screening.title}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-3xl">
          {pt.screening.subtitle} Personalized for {patient?.fullName || 'Registered Patient'} ({patient?.patientId || 'LGT-2026-8K2M7P'}).
        </p>
      </div>

      {/* Primary Screening Status Card */}
      <Card className="border-border">
        <CardHeader className="bg-muted/10 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {pt.screening.eligibilityStatus}
              </span>
              <CardTitle className="text-2xl mt-1 font-bold flex items-center gap-2">
                {screeningEligible ? (
                  <span className="text-teal-700 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-teal-600" />
                    {pt.screening.eligible}
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-muted-foreground" />
                    {pt.screening.notEligible}
                  </span>
                )}
              </CardTitle>
            </div>
            {latestAssessment && (
              <Badge variant="outline" className="text-xs font-mono">
                Evaluated: {new Date(latestAssessment.createdAt).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Important Non-Diagnostic Disclaimer */}
          <Alert className="bg-primary/5 border-primary/20 text-foreground">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">
              Understanding Lung Cancer Screening
            </AlertTitle>
            <AlertDescription className="text-sm mt-1 leading-relaxed">
              {pt.screening.screeningDisclaimer} It uses low-dose X-rays to detect tiny abnormalities in the lungs before any symptoms develop, when treatment is most effective.
            </AlertDescription>
          </Alert>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <ScreeningEvaluationDialog
              patientId={patient?.id || '11111111-1111-4111-a111-111111111111'}
              patientName={patient?.fullName || 'Registered Patient'}
            />
            <Link href="/patient/referrals">
              <Button variant="outline" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                View Specialist Referral
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Guideline Criteria & Clinical Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              {pt.screening.guideline}
            </CardTitle>
            <CardDescription>
              {pt.screening.guidelineDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <h4 className="font-semibold text-foreground">Key Qualification Factors:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Age:</strong> Between 50 and 80 years old.</li>
                <li><strong>Smoking History:</strong> Cumulative exposure of at least 20 pack-years (e.g., 1 pack/day for 20 years, or 2 packs/day for 10 years).</li>
                <li><strong>Smoking Status:</strong> Currently smoking or quit within the past 15 years.</li>
                <li><strong>General Health:</strong> Fit enough and willing to undergo curative treatment if cancer is discovered.</li>
              </ul>
            </div>
            <p className="text-xs italic">
              Note: Bangladesh-specific clinical consensus guidelines also incorporate biomass smoke exposure and previous treated pulmonary tuberculosis history.
            </p>
          </CardContent>
        </Card>

        {/* Benefits and Considerations */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Benefits & Considerations (Shared Decision-Making)
            </CardTitle>
            <CardDescription>
              Weighing the advantages and clinical considerations of annual LDCT imaging.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-teal-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Proven Benefits
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Large clinical trials prove that annual screening with LDCT reduces lung cancer mortality by up to 20% in high-risk individuals through early-stage detection.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="font-semibold text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Important Considerations
              </h4>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                <li><strong>False Positives:</strong> Non-cancerous lung nodules or scar tissue may require follow-up scans to confirm benign status.</li>
                <li><strong>Radiation:</strong> Uses very low dose radiation (~1.5 mSv), approximately 1/5th of a standard chest CT.</li>
                <li><strong>Incidental Findings:</strong> Scans may detect unrelated heart or thyroid anomalies.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Alert for Active Symptoms */}
      <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertTitle className="text-destructive font-semibold">
          Screening is for Asymptomatic Individuals Only
        </AlertTitle>
        <AlertDescription className="text-sm mt-1 text-foreground/90 leading-relaxed">
          Screening guidelines apply to individuals without current lung cancer symptoms. If you have active red flag symptoms—such as <strong>coughing up blood</strong>, <strong>persistent hoarseness</strong>, or <strong>unexplained severe weight loss</strong>—do not wait for screening. Consult a doctor immediately for diagnostic investigation.
        </AlertDescription>
      </Alert>
    </div>
  )
}
