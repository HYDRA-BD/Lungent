'use client'

import React, { useState, useTransition } from 'react'
import {
  Globe,
  ShieldAlert,
  FileCheck2,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Layers,
  Lock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type {
  InternationalCountryProfile,
  CountryClinicalGuideline,
  CountryRegulatoryPrivacyProfile,
  CountryGeographicNode,
  CountryReadinessScorecard,
} from '../types'
import {
  evaluateClinicalExecutionAction,
  evaluateCrossBorderTransferAction,
} from '../actions'

interface InternationalExpansionDashboardProps {
  initialCountries: InternationalCountryProfile[]
  initialGuidelines: CountryClinicalGuideline[]
  initialPrivacyProfiles: CountryRegulatoryPrivacyProfile[]
  initialGeographicNodes: CountryGeographicNode[]
  initialScorecards: Record<string, CountryReadinessScorecard>
  className?: string
}

export function InternationalExpansionDashboard({
  initialCountries,
  initialGuidelines,
  initialPrivacyProfiles,
  initialGeographicNodes,
  initialScorecards,
  className = '',
}: InternationalExpansionDashboardProps) {
  const [countries] = useState<InternationalCountryProfile[]>(initialCountries)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    initialCountries[0]?.countryCode || 'BD'
  )
  const [activeTab, setActiveTab] = useState<'profiles' | 'guidelines' | 'regulatory' | 'geography' | 'readiness'>('profiles')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [crossBorderResult, setCrossBorderResult] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentCountry = countries.find(c => c.countryCode === selectedCountryCode) || countries[0]
  const currentGuidelines = initialGuidelines.filter(g => g.countryCode === selectedCountryCode)
  const currentPrivacy = initialPrivacyProfiles.find(p => p.countryCode === selectedCountryCode)
  const currentNodes = initialGeographicNodes.filter(n => n.countryCode === selectedCountryCode)
  const currentScorecard = initialScorecards[selectedCountryCode]

  const handleTestClinicalExecution = () => {
    startTransition(async () => {
      const res = await evaluateClinicalExecutionAction(selectedCountryCode)
      if (res.success && res.data) {
        if (res.data.isExecutionAllowed) {
          setStatusMessage(`Clinical Execution VERIFIED: Guideline '${res.data.activeGuideline?.title}' is authorized by CAB.`)
        } else {
          setStatusMessage(res.data.warningMessage || 'Clinical execution is disabled for this country.')
        }
      }
    })
  }

  const handleSimulateCrossBorderTransfer = () => {
    startTransition(async () => {
      // Simulate transfer from selectedCountry to UK
      const res = await evaluateCrossBorderTransferAction({
        requestingCountry: 'GB',
        patientOriginCountry: selectedCountryCode,
        patientId: 'pat-sim-intl-99',
        accessorUserId: 'usr-uk-specialist-01',
        accessorRole: 'thoracic_oncologist',
        jurisdictionLegalBasis: 'International Second Opinion Referral Protocol',
        explicitPatientConsentGiven: true,
      })

      if (res.success && res.data) {
        if (res.data.isPermitted) {
          setCrossBorderResult(`TRANSFER AUTHORIZED: Legal basis: ${res.data.legalBasis}. Audit Log ID: ${res.data.auditLogId}`)
        } else {
          setCrossBorderResult(`TRANSFER BLOCKED: ${res.data.restrictionReason || 'Regulatory restriction enforced.'}`)
        }
      }
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">Lungent International Expansion Gateway</h2>
            <Badge variant="outline" className="text-xs bg-indigo-500/20 text-indigo-200 border-indigo-400/40">
              Phase 2.12 — Global Architecture
            </Badge>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Multi-country configuration management, country-specific clinical guidelines, sovereign privacy governance, and generalized geographic structures.
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="country-select" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Selected Jurisdiction:
          </label>
          <select
            id="country-select"
            value={selectedCountryCode}
            onChange={e => {
              setSelectedCountryCode(e.target.value)
              setStatusMessage(null)
              setCrossBorderResult(null)
            }}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            {countries.map(c => (
              <option key={c.countryCode} value={c.countryCode}>
                {c.countryCode} — {c.nameEn} {c.status === 'synthetic_example' ? '(Synthetic)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clinical Governance & Non-Diagnostic Alert */}
      <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold text-sm">
          Clinical Governance & Non-Diagnostic Invariant (ক্লিনিক্যাল নন-ডায়াগনস্টিক নীতি)
        </AlertTitle>
        <AlertDescription className="text-xs mt-1">
          Lungent provides country-specific clinical decision support, screening eligibility guidance, and triage assistance. It does not provide autonomous clinical diagnoses. All international deployments require formal sign-off by the relevant sovereign health authority or Clinical Advisory Board before clinical pathways can be activated.
        </AlertDescription>
      </Alert>

      {/* Status Notifications */}
      {statusMessage && (
        <Alert className="border-indigo-500/30 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200">
          <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          <AlertTitle className="text-xs font-semibold">Evaluation Status</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">{statusMessage}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === 'profiles' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('profiles')}
          className="text-xs h-8"
        >
          <Globe className="h-3.5 w-3.5 mr-1.5" />
          Country Profiles
        </Button>
        <Button
          variant={activeTab === 'guidelines' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('guidelines')}
          className="text-xs h-8"
        >
          <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
          Clinical Guidelines
        </Button>
        <Button
          variant={activeTab === 'regulatory' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('regulatory')}
          className="text-xs h-8"
        >
          <Lock className="h-3.5 w-3.5 mr-1.5" />
          Privacy & Regulatory
        </Button>
        <Button
          variant={activeTab === 'geography' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('geography')}
          className="text-xs h-8"
        >
          <MapPin className="h-3.5 w-3.5 mr-1.5" />
          Geographic Hierarchy
        </Button>
        <Button
          variant={activeTab === 'readiness' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('readiness')}
          className="text-xs h-8"
        >
          <Layers className="h-3.5 w-3.5 mr-1.5" />
          12-Step Readiness Scorecard
        </Button>
      </div>

      {/* Tab 1: Country Profiles */}
      {activeTab === 'profiles' && currentCountry && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {currentCountry.nameEn} ({currentCountry.nameNative})
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ISO 3166-1: {currentCountry.countryCode} / {currentCountry.isoAlpha3} / #{currentCountry.numericCode}
                  </p>
                </div>
                <Badge
                  variant={currentCountry.status === 'active' ? 'default' : currentCountry.status === 'synthetic_example' ? 'secondary' : 'outline'}
                  className="capitalize text-xs"
                >
                  {currentCountry.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
              <div className="p-3 rounded-lg border bg-card text-xs space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Language & Locales</span>
                <p><span className="text-muted-foreground">Default Locale:</span> <strong className="uppercase">{currentCountry.defaultLocale}</strong></p>
                <p><span className="text-muted-foreground">Supported:</span> {currentCountry.supportedLocales.join(', ').toUpperCase()}</p>
                <p><span className="text-muted-foreground">Official:</span> {currentCountry.officialLanguages.join(', ')}</p>
              </div>

              <div className="p-3 rounded-lg border bg-card text-xs space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Time, Units & Currency</span>
                <p><span className="text-muted-foreground">Time Zones:</span> {currentCountry.timeZones.join(', ')}</p>
                <p><span className="text-muted-foreground">Measurement:</span> <strong className="capitalize">{currentCountry.measurementSystem}</strong></p>
                <p><span className="text-muted-foreground">Currency:</span> {currentCountry.currencySymbol} ({currentCountry.currencyCode})</p>
              </div>

              <div className="p-3 rounded-lg border bg-card text-xs space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Technical & Environmental</span>
                <p><span className="text-muted-foreground">Environmental Feed:</span> <strong className="capitalize">{currentCountry.environmentalProvider}</strong></p>
                <p><span className="text-muted-foreground">Data Residency:</span> {currentCountry.dataResidencyRequired ? `Required (${currentCountry.dataResidencyRegion})` : 'Flexible'}</p>
                <p><span className="text-muted-foreground">Clinical Engine:</span> {currentCountry.clinicalExecutionEnabled ? <span className="text-emerald-600 font-bold">Enabled</span> : <span className="text-rose-600 font-bold">Disabled (CAB Pending)</span>}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Clinical Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Clinical Guidelines Registered for {currentCountry?.nameEn}
            </h3>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleTestClinicalExecution}
              className="text-xs h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isPending ? 'animate-spin' : ''}`} />
              Test Execution Gate
            </Button>
          </div>

          {currentGuidelines.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No clinical guidelines registered for this country.</p>
          ) : (
            currentGuidelines.map(g => (
              <Card key={g.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm font-semibold">{g.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.titleNative} — Published {g.publicationYear}</p>
                      <p className="text-xs text-muted-foreground">Source: {g.sourceOrganization}</p>
                    </div>
                    <Badge
                      variant={g.approvalStatus === 'approved' ? 'default' : 'outline'}
                      className="text-xs capitalize whitespace-nowrap"
                    >
                      {g.approvalStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 text-xs space-y-2">
                  <div className="p-2.5 rounded bg-muted/40 border">
                    <span className="font-semibold block text-muted-foreground mb-1">Target Screening Criteria:</span>
                    <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap font-mono">
                      {JSON.stringify(g.screeningEligibilityCriteria, null, 2)}
                    </pre>
                  </div>
                  {g.approvedByBoardReference && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                      CAB Verification Reference: {g.approvedByBoardReference} (Approved: {g.approvedByBoardAt ? new Date(g.approvedByBoardAt).toLocaleDateString() : 'N/A'})
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Privacy & Regulatory */}
      {activeTab === 'regulatory' && currentPrivacy && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{currentPrivacy.dataProtectionActName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Jurisdiction Privacy Authority: {currentPrivacy.privacyOfficerContact || 'Official DPO'}</p>
                </div>
                <Badge
                  variant={currentPrivacy.legalVerificationStatus === 'verified' ? 'default' : 'outline'}
                  className="capitalize text-xs"
                >
                  {currentPrivacy.legalVerificationStatus.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-card space-y-1">
                  <span className="font-semibold text-muted-foreground">Consent & Data Retention</span>
                  <p><span className="text-muted-foreground">Consent Model:</span> <strong className="capitalize">{currentPrivacy.consentModel.replace(/_/g, ' ')}</strong></p>
                  <p><span className="text-muted-foreground">Patient Health Retention:</span> <strong>{currentPrivacy.patientDataRetentionYears} years</strong></p>
                  <p><span className="text-muted-foreground">Breach Notification Window:</span> <strong>{currentPrivacy.breachNotificationWindowHours} hours</strong></p>
                </div>

                <div className="p-3 border rounded-lg bg-card space-y-1">
                  <span className="font-semibold text-muted-foreground">Sovereign Rights & Export</span>
                  <p><span className="text-muted-foreground">Cross-Border Transfer:</span> {currentPrivacy.crossBorderTransferAllowed ? <span className="text-emerald-600 font-bold">Permitted</span> : <span className="text-rose-600 font-bold">Prohibited (Sovereignty Locked)</span>}</p>
                  <p><span className="text-muted-foreground">Patient Export Rights:</span> {currentPrivacy.patientExportRightsSupported ? 'Supported' : 'Restricted'}</p>
                  <p><span className="text-muted-foreground">Patient Deletion Rights:</span> {currentPrivacy.patientDeletionRightsSupported ? 'Supported (subject to medical retention)' : 'Restricted'}</p>
                </div>
              </div>

              {/* Cross-Border Transfer Simulator */}
              <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Cross-Border Health Data Disclosure Verification
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={handleSimulateCrossBorderTransfer}
                    className="text-xs h-7"
                  >
                    Simulate UK Second Opinion Transfer
                  </Button>
                </div>
                {crossBorderResult && (
                  <p className={`text-xs p-2 rounded font-mono ${crossBorderResult.includes('BLOCKED') ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
                    {crossBorderResult}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Geographic Hierarchy */}
      {activeTab === 'geography' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Generalized Geographic Administrative Hierarchy: {currentCountry?.nameEn}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Configured levels: {currentCountry?.geographicHierarchyLevels.map(l => `L${l.level}: ${l.nameEn} (${l.nameNative})`).join(' → ')}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {currentNodes.map(node => (
                  <div key={node.id} className="p-3 border rounded-lg bg-card space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm">{node.nameEn}</strong>
                      <Badge variant="outline" className="text-[10px]">Level {node.level}</Badge>
                    </div>
                    <p className="text-muted-foreground">{node.nameNative}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">Code: {node.nodeCode}</p>
                    {node.parentNodeCode && (
                      <p className="text-[11px] text-muted-foreground">Parent: {node.parentNodeCode}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: 12-Step Readiness Scorecard */}
      {activeTab === 'readiness' && currentScorecard && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    12-Step International Readiness Scorecard: {currentScorecard.countryName}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed {currentScorecard.completedSteps} of {currentScorecard.totalSteps} Milestones ({currentScorecard.readinessScorePct}%)
                  </p>
                </div>
                <Badge
                  variant={currentScorecard.isDeploymentAuthorized ? 'default' : 'outline'}
                  className="text-xs font-semibold"
                >
                  {currentScorecard.isDeploymentAuthorized ? 'Full International Deployment Authorized' : 'Deployment Gate: BLOCKED (Prerequisites Incomplete)'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Category Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                {Object.entries(currentScorecard.categoryScores).map(([cat, score]) => (
                  <div key={cat} className="p-2 border rounded-lg bg-card text-center space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] block">{cat}</span>
                    <strong className="text-sm">{score.completed} / {score.total}</strong>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${score.scorePct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{score.scorePct}%</span>
                  </div>
                ))}
              </div>

              {/* Unfulfilled Prerequisites */}
              {currentScorecard.unfulfilledPrerequisites.length > 0 && (
                <div className="p-3 border border-amber-500/30 rounded-lg bg-amber-500/10 space-y-1 text-xs">
                  <span className="font-semibold text-amber-900 dark:text-amber-200 block">
                    Outstanding Prerequisites for Operational Activation ({currentScorecard.unfulfilledPrerequisites.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[11px]">
                    {currentScorecard.unfulfilledPrerequisites.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
