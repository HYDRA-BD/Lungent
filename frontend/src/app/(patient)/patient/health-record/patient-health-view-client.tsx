'use client'

import React, { useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Dna,
  FileEdit,
  Flame,
  Heart,
  Pill,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  Wind,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { getPatientNav } from '@/components/layouts/patient-nav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useLanguage } from '@/i18n'
import { submitCorrectionRequestAction } from '@/modules/patient-portal/actions'
import type { Patient } from '@/modules/patients/types'
import type { ComprehensivePatientHealthRecord } from '@/modules/health-records/types'

interface PatientHealthViewClientProps {
  patient: Patient
  initialRecord: ComprehensivePatientHealthRecord
}

export function PatientHealthViewClient({ patient, initialRecord }: PatientHealthViewClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.patientPortal.healthRecord

  const [record] = useState<ComprehensivePatientHealthRecord>(initialRecord)
  const [activeCategory, setActiveCategory] = useState<string>('conditions')
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [correctionSuccess, setCorrectionSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [correctionForm, setCorrectionForm] = useState({
    category: 'medical_conditions',
    fieldName: '',
    requestedCorrection: '',
    justification: '',
  })

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await submitCorrectionRequestAction(patient.id, correctionForm)
      if (res.success) {
        setCorrectionOpen(false)
        setCorrectionSuccess(t.requestSuccess)
        setCorrectionForm({
          category: 'medical_conditions',
          fieldName: '',
          requestedCorrection: '',
          justification: '',
        })
      }
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setCorrectionSuccess(null), 4000)
    }
  }

  const patientNav = getPatientNav(dict, '/patient/health-record')

  const categories = [
    { id: 'conditions', label: isBn ? 'রোগের বিবরণ' : 'Conditions', icon: Stethoscope, count: record.medicalConditions.length },
    { id: 'medications', label: isBn ? 'ওষুধ' : 'Medications', icon: Pill, count: record.medications.length },
    { id: 'allergies', label: isBn ? 'এলার্জি' : 'Allergies', icon: AlertCircle, count: record.allergies.length },
    { id: 'smoking', label: isBn ? 'ধূমপান' : 'Smoking', icon: Flame },
    { id: 'exposures', label: isBn ? 'পরিবেশগত ঝুঁকি' : 'Exposures', icon: Wind, count: record.environmentalExposures.length },
    { id: 'family', label: isBn ? 'পারিবারিক' : 'Family History', icon: Dna, count: record.familyHistory.length },
    { id: 'lifestyle', label: isBn ? 'জীবনযাপন' : 'Lifestyle', icon: Heart },
    { id: 'measurements', label: isBn ? 'পরিমাপ' : 'Measurements', icon: Thermometer, count: record.measurements.length },
    { id: 'symptoms', label: isBn ? 'উপসর্গ' : 'Symptoms', icon: Activity, count: record.symptoms.length },
  ]

  return (
    <DashboardLayout
      workspaceName={isBn ? 'রোগী স্বাস্থ্য পোর্টাল' : 'Patient Health Portal'}
      workspaceBadge={<Badge variant="outline" className="text-primary border-primary/30 text-xs">{patient.patientId}</Badge>}
      userName={patient.fullName}
      userRole={isBn ? 'নিবন্ধিত রোগী' : 'Registered Patient'}
      navItems={patientNav}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title={t.title}
          description={t.subtitle}
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => setCorrectionOpen(true)}
              className="text-xs font-semibold"
            >
              <FileEdit className="size-3.5 mr-1.5" />
              <span>{t.correctionBtn}</span>
            </Button>
          }
        />

        {correctionSuccess && (
          <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{correctionSuccess}</span>
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
          <p>{t.correctionNotice}</p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/80 scrollbar-thin">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Category Views */}
        {activeCategory === 'conditions' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                <span>Medical Conditions & Past Illnesses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.medicalConditions.length > 0 ? (
                record.medicalConditions.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">{item.conditionName}</span>
                      <Badge variant={item.clinicalStatus === 'active' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {item.clinicalStatus}
                      </Badge>
                    </div>
                    {item.treatmentSummary && <p className="text-muted-foreground">Treatment: {item.treatmentSummary}</p>}
                    <div className="text-[11px] text-muted-foreground flex gap-3 pt-1 border-t border-border/50">
                      <span>Source: {item.dataSource.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>Status: {item.verificationStatus}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No conditions recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'medications' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Pill className="size-4 text-primary" />
                <span>Medications & Inhalers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.medications.length > 0 ? (
                record.medications.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">{item.medicationName}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{item.medicationType.replace(/_/g, ' ')}</Badge>
                    </div>
                    {item.dosageInstructions && <p className="text-muted-foreground">Dosage: {item.dosageInstructions}</p>}
                    <div className="text-[11px] text-muted-foreground flex gap-3 pt-1 border-t border-border/50">
                      <span>Prescriber: {item.prescribingSource || 'Unspecified'}</span>
                      <span>•</span>
                      <span>Status: {item.isCurrent ? 'Currently taking' : 'Past'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No medications recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'allergies' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="size-4 text-primary" />
                <span>Allergies & Sensitivities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.allergies.length > 0 ? (
                record.allergies.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">{item.allergenName}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">Severity: {item.severity}</Badge>
                    </div>
                    {item.reactionDescription && <p className="text-muted-foreground">Reaction: {item.reactionDescription}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No known allergies recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'smoking' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Flame className="size-4 text-amber-500" />
                <span>Tobacco & Smoking Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.smokingHistory ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
                    <span className="font-bold text-amber-900 dark:text-amber-100 text-sm">
                      Pack-Years: {record.smokingHistory.calculatedPackYears ?? 'N/A'}
                    </span>
                    <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                      Formula: {record.smokingHistory.packYearsCalculationMethod}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground">Status</span>
                      <p className="font-bold text-foreground capitalize mt-0.5">{record.smokingHistory.smokingStatus.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-bold text-foreground mt-0.5">{record.smokingHistory.yearsSmoked ?? '—'} years</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground">Daily Sticks</span>
                      <p className="font-bold text-foreground mt-0.5">{record.smokingHistory.cigarettesPerDay ?? 0} cigs / {record.smokingHistory.bidisPerDay ?? 0} bidis</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No tobacco history recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'exposures' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wind className="size-4 text-primary" />
                <span>Environmental & Occupational Exposures</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.environmentalExposures.length > 0 ? (
                record.environmentalExposures.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">{item.exposureType}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">Intensity: {item.intensity}</Badge>
                    </div>
                    <p className="text-muted-foreground">Duration: {item.durationYears ? `${item.durationYears} years` : '—'}</p>
                    {item.contextDetails && <p className="text-muted-foreground italic">{item.contextDetails}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No environmental exposures documented.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'family' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Dna className="size-4 text-primary" />
                <span>Family History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.familyHistory.length > 0 ? (
                record.familyHistory.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground capitalize">{item.relationship}: {item.conditionType.replace(/_/g, ' ')}</span>
                      {item.ageAtDiagnosis && <span className="text-muted-foreground">Age {item.ageAtDiagnosis}</span>}
                    </div>
                    {item.specificCancerType && <p className="text-muted-foreground">{item.specificCancerType}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No family history recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'lifestyle' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Heart className="size-4 text-primary" />
                <span>Lifestyle Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.lifestyle ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-muted-foreground">Activity Level</span>
                    <p className="font-bold text-foreground capitalize mt-0.5">{record.lifestyle.physicalActivityLevel}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-muted-foreground">Alcohol</span>
                    <p className="font-bold text-foreground capitalize mt-0.5">{record.lifestyle.alcoholConsumptionStatus}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No lifestyle profile recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'measurements' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Thermometer className="size-4 text-primary" />
                <span>Health Measurements & Vitals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.measurements.length > 0 ? (
                record.measurements.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card flex justify-between items-center">
                    <div>
                      <span className="font-bold text-foreground capitalize">{item.measurementType.replace(/_/g, ' ')}</span>
                      <p className="text-[11px] text-muted-foreground">Measured: {new Date(item.measuredAt).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-base text-foreground">
                      {item.numericValue} {item.unit}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No measurements recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeCategory === 'symptoms' && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <span>Reported Symptoms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {record.symptoms.length > 0 ? (
                record.symptoms.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground capitalize">{item.symptomName.replace(/_/g, ' ')}</span>
                      <Badge variant={item.isPresent ? 'destructive' : 'secondary'} className="text-[10px]">
                        {item.isPresent ? 'Present' : 'Denied'}
                      </Badge>
                    </div>
                    {item.notes && <p className="text-muted-foreground">{item.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-6">No symptoms reported.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Clinical Correction Request Dialog */}
        <Dialog
          open={correctionOpen}
          onClose={() => setCorrectionOpen(false)}
          title={t.correctionDialogTitle}
          size="md"
        >
          <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="crq-cat">{t.category}</Label>
              <Select
                id="crq-cat"
                value={correctionForm.category}
                onChange={(e) => setCorrectionForm((f) => ({ ...f, category: e.target.value }))}
                options={[
                  { value: 'medical_conditions', label: 'Medical Conditions' },
                  { value: 'medications', label: 'Medications' },
                  { value: 'allergies', label: 'Allergies' },
                  { value: 'smoking_history', label: 'Tobacco / Smoking' },
                  { value: 'environmental_exposures', label: 'Exposures' },
                  { value: 'vitals_measurements', label: 'Measurements' },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="crq-field">{t.field} *</Label>
              <Input
                id="crq-field"
                value={correctionForm.fieldName}
                onChange={(e) => setCorrectionForm((f) => ({ ...f, fieldName: e.target.value }))}
                placeholder="e.g. Asthma onset year, quit date"
                required
              />
            </div>
            <div>
              <Label htmlFor="crq-val">{t.requestedValue} *</Label>
              <Input
                id="crq-val"
                value={correctionForm.requestedCorrection}
                onChange={(e) => setCorrectionForm((f) => ({ ...f, requestedCorrection: e.target.value }))}
                placeholder="What should this record state?"
                required
              />
            </div>
            <div>
              <Label htmlFor="crq-just">{t.justification} * (min 5 characters)</Label>
              <Textarea
                id="crq-just"
                value={correctionForm.justification}
                onChange={(e) => setCorrectionForm((f) => ({ ...f, justification: e.target.value }))}
                placeholder="Explain why this change is necessary"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCorrectionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {t.submitRequest}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
