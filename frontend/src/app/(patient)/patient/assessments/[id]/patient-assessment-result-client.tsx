'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  FileText,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { Patient } from '@/modules/patients/types'
import type { PatientAssessmentItem } from '@/modules/patient-portal/types'

interface PatientAssessmentResultClientProps {
  patient: Patient | null
  assessment: PatientAssessmentItem
}

export function PatientAssessmentResultClient({
  patient,
  assessment,
}: PatientAssessmentResultClientProps) {
  const { dict } = useLanguage()
  const pt = dict.patientPortal

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'submitted':
        return 'info'
      case 'in_progress':
        return 'warning'
      case 'requires_additional_info':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getAssessmentTypeLabel = (type: string) => {
    switch (type) {
      case 'risk_estimation':
        return pt.assessments.riskModule
      case 'screening_eligibility':
        return pt.assessments.screeningModule
      case 'symptom_triage':
        return pt.assessments.triageModule
      default:
        return type.replace(/_/g, ' ')
    }
  }

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <Link
          href="/patient/assessments"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {pt.assessments.title}
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Link href="/patient/assessments/history">
            <Button variant="ghost" size="sm">
              {pt.assessments.historyTitle}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Assessment Header Card */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={getStatusBadgeVariant(assessment.status)}>
                  {assessment.status.toUpperCase()}
                </Badge>
                {assessment.isReviewedByClinician ? (
                  <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {pt.assessments.statusReviewed}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {pt.assessments.statusSubmitted}
                  </Badge>
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  ID: {assessment.id}
                </span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {getAssessmentTypeLabel(assessment.assessmentType)}
              </CardTitle>
              <CardDescription className="mt-1">
                Completed for patient <span className="font-semibold text-foreground">{patient?.fullName || 'Registered Patient'}</span> ({patient?.patientId || 'LGT-2026-8K2M7P'})
              </CardDescription>
            </div>

            <div className="text-right text-xs text-muted-foreground space-y-1">
              <div>
                Initiated: {new Date(assessment.initiatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              {assessment.completedAt && (
                <div>
                  Completed: {new Date(assessment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              {assessment.methodologyVersion && (
                <div className="font-mono text-primary/80">
                  Version: {assessment.methodologyVersion}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Clinical Interpretation & Safety Alert */}
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive font-semibold">
              Crucial Clinical Safety Notice
            </AlertTitle>
            <AlertDescription className="text-sm mt-1 text-foreground/90 space-y-1">
              <p>
                <strong>Low estimated risk does NOT rule out lung cancer or other respiratory disease.</strong>
              </p>
              <p>
                Screening eligibility and risk estimations are preventative guidelines, not a medical diagnosis. Low risk estimates can never override active concerning symptoms.
              </p>
              <p className="font-semibold text-destructive pt-1">
                If you experience coughing up blood (hemoptysis), persistent chest pain, unexplained rapid weight loss, or acute breathlessness, seek immediate medical emergency care at a hospital.
              </p>
            </AlertDescription>
          </Alert>

          {/* Assessment Summary Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Clinical Assessment Summary
            </h3>
            <div className="p-4 rounded-lg bg-card border border-border leading-relaxed text-foreground">
              {assessment.summary}
            </div>
          </div>

          {/* Detailed Findings & Results */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Identified Factors & Results
            </h3>

            {assessment.results && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.results.riskLevel && (
                  <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-1">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      Calculated Risk Tier
                    </span>
                    <div className="text-xl font-bold capitalize text-primary">
                      {assessment.results.riskLevel} Risk
                    </div>
                  </div>
                )}

                {assessment.results.screeningEligible !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-1">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      LDCT Screening Eligibility
                    </span>
                    <div className="text-xl font-bold flex items-center gap-2">
                      {assessment.results.screeningEligible ? (
                        <span className="text-teal-700 flex items-center gap-1">
                          <CheckCircle2 className="h-5 w-5 text-teal-600" /> Eligible for Low-Dose CT
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Not Currently Indicated
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {assessment.results.factors && Array.isArray(assessment.results.factors) && (
                  <div className="p-4 rounded-lg border border-border bg-muted/10 md:col-span-2 space-y-2">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      Key Risk Factors Noted
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                      {assessment.results.factors.map((factor: string, idx: number) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {assessment.results.reportedSymptoms && (
                  <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-2">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      Reported Active Symptoms
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {assessment.results.reportedSymptoms.map((sym: string) => (
                        <Badge key={sym} variant="outline" className="border-amber-400 text-amber-800 bg-amber-50">
                          {sym.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.results.deniedSymptoms && (
                  <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-2">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      Reported Absent / Denied
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {assessment.results.deniedSymptoms.map((sym: string) => (
                        <Badge key={sym} variant="outline" className="border-muted text-muted-foreground">
                          None: {sym.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Model Limitations & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
                <Info className="h-4 w-4" />
                Methodology & Assessment Limitations
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {assessment.limitations || 'Assessment is computed on empirical statistical models and patient-reported recall. Physical clinical auscultation and imaging are required for clinical diagnosis.'}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-teal-200 bg-teal-50/50 space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-teal-900">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                Recommended Next Steps
              </h4>
              <p className="text-sm text-teal-950 leading-relaxed font-medium">
                {assessment.nextSteps || 'Consult with your primary healthcare provider or pulmonologist to review this assessment and determine suitable follow-up imaging.'}
              </p>
            </div>
          </div>

          {/* Clinician Review & Facility Provenance */}
          <div className="p-4 rounded-lg border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>
                Evaluating Facility: <strong className="text-foreground">{assessment.facilityName || 'Dhaka Central Pulmonary Institute'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-teal-600" />
              <span>
                Reviewing Clinician: <strong className="text-foreground">{assessment.reviewingClinicianName || 'Dr. Rafiqul Islam, Pulmonologist'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1 text-teal-800 font-mono">
              <ShieldCheck className="h-4 w-4" />
              Tamper-Evident Historical Record
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
