'use client'

import React, { useState } from 'react'
import {
  Share2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Info,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createReferralAction } from '../actions'
import type { ReferralPriority, HealthcareReferralItem } from '../types'

export interface CreateReferralDialogProps {
  patientId: string
  patientName: string
  patientCanonicalId: string
  patientPhone?: string
  defaultPriority?: ReferralPriority
  linkedAssessmentId?: string
  linkedAssessmentType?: string
  clinicalReasonHint?: string
  triggerButton?: React.ReactNode
  onSuccess?: (referral: HealthcareReferralItem) => void
}

const PRESET_DESTINATIONS = [
  {
    id: '22222222-1111-4111-a111-222222222222',
    name: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
    department: 'Department of Thoracic Surgery & Interventional Pulmonology',
    location: 'Mohakhali, Dhaka',
    phone: '+880 2-8822244',
    isVerified: true,
  },
  {
    id: 'fac-nicrh-001',
    name: 'National Institute of Cancer Research & Hospital (NICRH)',
    department: 'Department of Medical Oncology & Thoracic Oncology',
    location: 'Mohakhali, Dhaka',
    phone: '+880 2-9880078',
    isVerified: true,
  },
  {
    id: 'fac-bsmmu-001',
    name: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    department: 'Department of Respiratory Medicine',
    location: 'Shahbag, Dhaka',
    phone: '+880 2-9661051',
    isVerified: true,
  },
  {
    id: 'fac-dmch-001',
    name: 'Dhaka Medical College Hospital (DMCH)',
    department: 'Department of Respiratory Medicine & Chest Diseases',
    location: 'Bakshibazar, Dhaka',
    phone: '+880 2-55165088',
    isVerified: true,
  },
  {
    id: 'fac-cmch-001',
    name: 'Chittagong Medical College Hospital (CMCH)',
    department: 'Chest Disease Clinic & Pulmonology',
    location: 'Chittagong',
    phone: '+880 31-619400',
    isVerified: true,
  },
]

export function CreateReferralDialog({
  patientId,
  patientName,
  patientCanonicalId,
  patientPhone,
  defaultPriority = 'priority',
  linkedAssessmentId,
  linkedAssessmentType,
  clinicalReasonHint,
  triggerButton,
  onSuccess,
}: CreateReferralDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [priority, setPriority] = useState<ReferralPriority>(defaultPriority)
  const [destinationIndex, setDestinationIndex] = useState(0)
  const [customDestinationName, setCustomDestinationName] = useState('')
  const [isCustomDestination, setIsCustomDestination] = useState(false)
  const [department, setDepartment] = useState(PRESET_DESTINATIONS[0].department)
  const [reason, setReason] = useState(clinicalReasonHint || '')
  const [clinicalSummary, setClinicalSummary] = useState('')
  const [instructions, setInstructions] = useState('')
  const [contactPhone, setContactPhone] = useState(PRESET_DESTINATIONS[0].phone)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successReferral, setSuccessReferral] = useState<HealthcareReferralItem | null>(null)

  const handleSelectPreset = (index: number) => {
    setDestinationIndex(index)
    setIsCustomDestination(false)
    const preset = PRESET_DESTINATIONS[index]
    setDepartment(preset.department)
    setContactPhone(preset.phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!reason.trim()) {
      setErrorMessage('Please state the clinical indication or reason for referral.')
      return
    }

    const selectedPreset = PRESET_DESTINATIONS[destinationIndex]
    const destName = isCustomDestination ? customDestinationName.trim() : selectedPreset.name
    const destId = isCustomDestination ? undefined : selectedPreset.id

    if (isCustomDestination && !destName) {
      setErrorMessage('Please specify the destination healthcare facility name.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createReferralAction({
        patientId,
        patientCanonicalId,
        patientName,
        patientPhone: patientPhone || null,
        referringFacilityName: 'Dhaka Central Pulmonary Institute',
        destinationFacilityId: destId,
        destinationFacilityName: destName,
        destinationDepartment: department.trim() || undefined,
        reason: reason.trim(),
        clinicalSummary: clinicalSummary.trim() || undefined,
        priority,
        instructions: instructions.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        linkedAssessmentId,
        linkedAssessmentType,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to submit referral')
      }

      setSuccessReferral(result.data)
      if (onSuccess) {
        onSuccess(result.data)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while creating referral')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setIsOpen(false)
    setSuccessReferral(null)
    setErrorMessage(null)
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
        {triggerButton || (
          <Button variant="default" className="gap-2">
            <Share2 className="h-4 w-4" />
            Create Specialist Referral
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={handleResetAndClose}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {successReferral ? (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Specialist Referral Generated Successfully
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Canonical Referral ID: <span className="font-mono font-bold text-foreground">{successReferral.referralId}</span>
                  </p>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="font-medium text-foreground">{successReferral.patientName} ({successReferral.patientCanonicalId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-medium text-foreground">{successReferral.destinationFacilityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority Tier:</span>
                    <Badge
                      variant={
                        successReferral.priority === 'urgent_2ww'
                          ? 'destructive'
                          : successReferral.priority === 'priority'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {successReferral.priority === 'urgent_2ww'
                        ? 'Urgent 2-Week-Wait'
                        : successReferral.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary">SUBMITTED</Badge>
                  </div>
                </div>

                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Clinical Safety Note: This referral coordinates care and specialist evaluation. It does NOT constitute a confirmed diagnosis of lung cancer.
                  </AlertDescription>
                </Alert>

                <div className="pt-2">
                  <Button onClick={handleResetAndClose} className="w-full">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Share2 className="h-5 w-5 text-primary" />
                    Initiate Clinical Referral
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Coordinate specialist respiratory consultation, interventional pulmonology, or imaging.
                  </p>
                </div>

                {/* Clinical Governance Banner */}
                <Alert className="border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100">
                  <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <AlertTitle className="text-sm font-semibold">
                      Clinical Safety & Governance Policy
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      A low asymptomatic risk score or screening ineligibility must <strong>never</strong> suppress or delay a referral prompted by concerning red-flag symptoms. Clinical judgment takes precedence.
                    </AlertDescription>
                  </div>
                </Alert>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Patient Context Details */}
                <div className="bg-muted/30 p-3 rounded-lg border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Patient: </span>
                    <span className="font-semibold text-foreground">{patientName}</span>
                    <span className="text-muted-foreground ml-2 font-mono">({patientCanonicalId})</span>
                  </div>
                  {patientPhone && (
                    <div className="text-muted-foreground">
                      Contact: <span className="text-foreground">{patientPhone}</span>
                    </div>
                  )}
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Referral Priority Tier *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriority('urgent_2ww')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        priority === 'urgent_2ww'
                          ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-2 ring-red-500'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-red-600 dark:text-red-400">Urgent 2WW</span>
                        {priority === 'urgent_2ww' && <CheckCircle2 className="h-3.5 w-3.5 text-red-600" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Red-flag symptoms or acute suspicion (≤14 days).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority('priority')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        priority === 'priority'
                          ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-600 dark:text-amber-400">Priority</span>
                        {priority === 'priority' && <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Screening positive or persistent symptoms (≤28 days).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority('routine')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        priority === 'routine'
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400">Routine</span>
                        {priority === 'routine' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Non-urgent consultation or baseline imaging.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority('elective')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        priority === 'elective'
                          ? 'border-slate-600 bg-slate-50/70 dark:bg-slate-900/40 text-foreground ring-2 ring-slate-400'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-muted-foreground">Elective</span>
                        {priority === 'elective' && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Scheduled follow-up, counseling, or second opinion.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Destination Facility Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Destination Facility Directory *</Label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDestination(!isCustomDestination)}
                      className="text-xs text-primary hover:underline"
                    >
                      {isCustomDestination ? 'Choose from verified registry' : '+ Enter custom facility'}
                    </button>
                  </div>

                  {!isCustomDestination ? (
                    <div className="space-y-1.5">
                      <select
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                        value={destinationIndex}
                        onChange={(e) => handleSelectPreset(Number(e.target.value))}
                      >
                        {PRESET_DESTINATIONS.map((dest, idx) => (
                          <option key={dest.id} value={idx}>
                            {dest.name} ({dest.location}) — Verified
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px]">
                          Operational & Verified
                        </Badge>
                        <span>{PRESET_DESTINATIONS[destinationIndex].location}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Input
                        placeholder="Enter full facility name..."
                        value={customDestinationName}
                        onChange={(e) => setCustomDestinationName(e.target.value)}
                      />
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Note: Unverified facilities must be verified before electronic appointment coordination can be guaranteed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Target Department / Specialty</Label>
                  <Input
                    placeholder="e.g. Thoracic Surgery, Interventional Pulmonology"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                {/* Clinical Reason */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Clinical Indication / Reason for Referral *</Label>
                  <Textarea
                    rows={2}
                    placeholder="e.g. Persistent unexplained hemoptysis in heavy smoker with high acute symptom alert."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                {/* Clinical Summary */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Clinical Summary & Diagnostic Findings</Label>
                  <Textarea
                    rows={2}
                    placeholder="Include smoking pack-years, chest X-ray findings, baseline spirometry, or pertinent comorbidities..."
                    value={clinicalSummary}
                    onChange={(e) => setClinicalSummary(e.target.value)}
                  />
                </div>

                {/* Patient Instructions & Contact Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Instructions for Patient</Label>
                    <Input
                      placeholder="e.g. Fast for 6 hours if contrast imaging is planned."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Destination Facility Phone</Label>
                    <Input
                      placeholder="+880..."
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={handleResetAndClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Referral...
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Submit Referral
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
