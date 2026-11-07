'use client'

import React, { useState, useTransition } from 'react'
import {
  Network,
  Building2,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type {
  RegionalHealthcareNetworkMeta,
  FacilityOnboardingRecord,
  SubsystemHealthIndicator,
  RolloutMilestone,
} from '../types'
import {
  checkSubsystemHealthAction,
  activateFacilityAction,
} from '../actions'

interface RegionalExpansionDashboardProps {
  initialNetworks: RegionalHealthcareNetworkMeta[]
  initialFacilities: FacilityOnboardingRecord[]
  initialSubsystems: SubsystemHealthIndicator[]
  initialMilestones: RolloutMilestone[]
  className?: string
}

export function RegionalExpansionDashboard({
  initialNetworks,
  initialFacilities,
  initialSubsystems,
  initialMilestones,
  className = '',
}: RegionalExpansionDashboardProps) {
  const [networks] = useState<RegionalHealthcareNetworkMeta[]>(initialNetworks)
  const [facilities, setFacilities] = useState<FacilityOnboardingRecord[]>(initialFacilities)
  const [subsystems, setSubsystems] = useState<SubsystemHealthIndicator[]>(initialSubsystems)
  const [milestones] = useState<RolloutMilestone[]>(initialMilestones)
  const [activeTab, setActiveTab] = useState<'networks' | 'onboarding' | 'monitoring' | 'rollout'>('networks')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRefreshHealth = () => {
    startTransition(async () => {
      const res = await checkSubsystemHealthAction()
      if (res.success && res.data) {
        setSubsystems(res.data.subsystems)
        setStatusMessage(`Centralized health probe completed. Nationwide status: ${res.data.nationwideStatus.toUpperCase()}.`)
      }
    })
  }

  const handleActivateFacility = (facility: FacilityOnboardingRecord) => {
    startTransition(async () => {
      const res = await activateFacilityAction(facility, 'verifier-dghs-admin-1')
      if (res.success && res.data) {
        setFacilities(prev => prev.map(f => (f.id === facility.id ? res.data : f)))
        setStatusMessage(`Facility ${facility.facilityName} successfully verified and activated for live regional intake.`)
      } else {
        setStatusMessage(`Activation failed: ${res.error || 'Readiness score below required threshold'}`)
      }
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Governance & Nationwide Expansion Notice */}
      <Alert variant="default" className="border-teal-200 bg-teal-50 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100">
        <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        <AlertTitle className="font-semibold text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300">
          Regional &amp; Nationwide Expansion Operational Governance Notice (Phase 2.11)
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 leading-relaxed space-y-1">
          <p>
            <strong>English:</strong> Regional facility onboarding and healthcare network integration operate under phased DGHS deployment oversight. Cross-facility patient record sharing strictly enforces verified patient consent. Automated screening recommendations do <em>NOT</em> constitute formal clinical diagnoses.
          </p>
          <p className="text-[11px] text-teal-800 dark:text-teal-300">
            <strong>বাংলা (Bengali):</strong> আঞ্চলিক সম্প্রসারণ নির্দেশনা: স্বাস্থ্যকেন্দ্রসমূহের নেটওয়ার্ক অন্তর্ভুক্তি ও সেবা সম্প্রসারণ স্বাস্থ্য অধিদপ্তরের ধাপে ধাপে অনুমোদিত পরিকল্পনার অংশ। আন্তঃহাসপাতাল তথ্য আদানপ্রদানে রোগীর স্পষ্ট সম্মতি বাধ্যতামূলক।
          </p>
        </AlertDescription>
      </Alert>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('networks')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'networks'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Network className="h-4 w-4" />
          Healthcare Networks ({networks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'onboarding'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Facility Onboarding ({facilities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'monitoring'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4" />
          Centralized Monitoring ({subsystems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rollout')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'rollout'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          Rollout Milestones
        </button>
      </div>

      {statusMessage && (
        <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs">{statusMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tab 1: Regional Networks */}
      {activeTab === 'networks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {networks.map(net => (
            <Card key={net.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={net.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                    {net.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {net.tier.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2">{net.networkName}</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">{net.networkNameBn}</p>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lead Hub:</span>
                    <span className="font-semibold text-right">{net.leadHubFacilityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Division:</span>
                    <span>{net.division}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Affiliated Facilities:</span>
                    <span className="font-mono font-bold text-primary">{net.memberCount}</span>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <span className="text-muted-foreground block text-[11px] mb-1">Coverage Districts:</span>
                  <div className="flex flex-wrap gap-1">
                    {net.coverageDistricts.map(d => (
                      <Badge key={d} variant="secondary" className="text-[10px]">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Facility Onboarding */}
      {activeTab === 'onboarding' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Regional Healthcare Facility Onboarding Queue
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Lifecycle status, readiness scoring, and DGHS registry verification before activating live clinical intake.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 px-3">DGHS Code</th>
                    <th className="py-2 px-3">Facility Name</th>
                    <th className="py-2 px-3">Tier</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3 text-right">Readiness Score</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map(f => (
                    <tr key={f.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-mono font-medium">{f.dghsFacilityCode}</td>
                      <td className="py-2 px-3 font-semibold">{f.facilityName}</td>
                      <td className="py-2 px-3">{f.facilityTier.replace(/_/g, ' ')}</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {f.upazila}, {f.district}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span className={f.readinessScore >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                          {f.readinessScore}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge
                          variant={
                            f.onboardingStatus === 'active'
                              ? 'default'
                              : f.onboardingStatus === 'pending_verification'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {f.onboardingStatus}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {f.onboardingStatus !== 'active' ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="text-[11px] h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isPending || f.readinessScore < 75}
                            onClick={() => handleActivateFacility(f)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verify &amp; Activate
                          </Button>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[11px]">Live in Production</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Centralized Monitoring */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg">
            <div>
              <span className="font-semibold block text-sm">Centralized Infrastructure &amp; Health Probe</span>
              <span className="text-xs text-muted-foreground">
                Real-time latency metrics and zero-PHI operational logs across all 7 platform subsystems.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={isPending}
              onClick={handleRefreshHealth}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
              Probe Subsystems
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subsystems.map(sub => (
              <Card key={sub.subsystem} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Server className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">{sub.nameEn}</span>
                  </div>
                  <Badge
                    variant={sub.status === 'healthy' ? 'default' : 'destructive'}
                    className="text-[10px]"
                  >
                    {sub.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span>Latency:</span>
                  <span className="font-mono font-semibold text-foreground">{sub.latencyMs} ms</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Rollout Milestones */}
      {activeTab === 'rollout' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              DGHS 8-Step Phased Regional Expansion Framework
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Controlled progression gates ensuring clinical safety, operational verification, and governance sign-off prior to broader expansion.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map(m => (
                <div
                  key={m.code}
                  className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                    m.isCompleted ? 'bg-muted/30 border-emerald-300/40' : 'bg-background border-border'
                  }`}
                >
                  <div className="mt-0.5">
                    {m.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        Step {m.stepNumber}: {m.titleEn}
                      </span>
                      <Badge variant={m.isCompleted ? 'default' : 'outline'} className="text-[10px]">
                        {m.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{m.titleBn}</p>
                    <div className="flex flex-wrap gap-x-4 text-[11px] text-muted-foreground pt-1">
                      <span>
                        Authority: <strong>{m.responsibleAuthority}</strong>
                      </span>
                      {m.completedAt && (
                        <span>
                          Signed off: <strong>{new Date(m.completedAt).toLocaleDateString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
