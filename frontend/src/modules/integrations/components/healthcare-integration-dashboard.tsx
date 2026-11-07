'use client'

import React, { useState, useTransition } from 'react'
import {
  Server,
  Activity,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRightLeft,
  FileSearch,
  Lock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type {
  HealthcareSystemMeta,
  HealthcareExchangeTransaction,
  StagedDiagnosticRecordItem,
} from '../types'
import {
  testHealthcareSystemConnectionAction,
  reconcileDiagnosticRecordAction,
} from '../actions'

interface HealthcareIntegrationDashboardProps {
  initialSystems: HealthcareSystemMeta[]
  initialTransactions?: HealthcareExchangeTransaction[]
  initialStagedRecords?: StagedDiagnosticRecordItem[]
  className?: string
}

export function HealthcareIntegrationDashboard({
  initialSystems,
  initialTransactions = [],
  initialStagedRecords = [],
  className = '',
}: HealthcareIntegrationDashboardProps) {
  const [systems] = useState<HealthcareSystemMeta[]>(initialSystems)
  const [transactions] = useState<HealthcareExchangeTransaction[]>(initialTransactions)
  const [stagedRecords, setStagedRecords] = useState<StagedDiagnosticRecordItem[]>(initialStagedRecords)
  const [selectedRecord, setSelectedRecord] = useState<StagedDiagnosticRecordItem | null>(null)
  const [reconciliationNotes, setReconciliationNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'systems' | 'staged_records' | 'transactions' | 'identity_matcher'>('systems')
  const [pingResults, setPingResults] = useState<Record<string, { latencyMs: number; statusText: string; isConnected: boolean }>>({})
  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handlePing = (systemCode: string) => {
    startTransition(async () => {
      const res = await testHealthcareSystemConnectionAction(systemCode)
      if (res.success && res.data) {
        setPingResults(prev => ({
          ...prev,
          [systemCode]: res.data,
        }))
        setStatusMessage(`Diagnostic ping completed for ${systemCode}: ${res.data.statusText}`)
      } else {
        setStatusMessage(`Failed to ping ${systemCode}: ${res.error || 'Unknown error'}`)
      }
    })
  }

  const handleReconcile = (decision: 'accept_imported' | 'retain_authoritative' | 'reject_imported') => {
    if (!selectedRecord) return
    if (!reconciliationNotes.trim()) {
      setStatusMessage('Clinical justification notes are mandatory before applying a reconciliation decision.')
      return
    }

    startTransition(async () => {
      const res = await reconcileDiagnosticRecordAction(selectedRecord, {
        recordId: selectedRecord.id,
        decision,
        clinicianNotes: reconciliationNotes,
        reviewerId: 'practitioner-attending-oncology-1',
      })

      if (res.success && res.data) {
        setStagedRecords(prev =>
          prev.map(r => (r.id === selectedRecord.id ? res.data.updatedRecord : r))
        )
        setSelectedRecord(null)
        setReconciliationNotes('')
        setStatusMessage(`Reconciliation completed: Record ${decision} with clinical justification audit.`)
      } else {
        setStatusMessage(`Reconciliation failed: ${res.error || 'Unknown error'}`)
      }
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clinical Governance & Non-Diagnostic Invariant Banner */}
      <Alert variant="default" className="border-cyan-200 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-950 dark:text-cyan-100">
        <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        <AlertTitle className="font-semibold text-xs uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
          Clinical Governance &amp; Non-Diagnostic Invariant Notice (Phase 2.9)
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 leading-relaxed space-y-1">
          <p>
            <strong>English:</strong> External healthcare integration data is staged for clinical reference only. Imported laboratory results or CT imaging metadata do <em>NOT</em> autonomously modify Lungent cancer risk scores, screening eligibility, or clinical rules without licensed clinician review.
          </p>
          <p className="text-[11px] text-cyan-800 dark:text-cyan-300">
            <strong>বাংলা (Bengali):</strong> ক্লিনিক্যাল নির্দেশনা: বহিঃস্থ স্বাস্থ্যসেবা সমন্বয় তথ্য কেবল ক্লিনিক্যাল রেফারেন্স হিসেবে সংরক্ষিত। আমদানিকৃত ল্যাব বা ইমেজিং ফলাফল স্বয়ংক্রিয়ভাবে রোগীর ফুসফুস ক্যান্সারের ঝুঁকি বা স্ক্রিনিং সিদ্ধান্ত পরিবর্তন করতে পারে না। সকল তথ্য পর্যালোচনার জন্য দায়িত্বপ্রাপ্ত চিকিৎসকের অনুমোদন বাধ্যতামূলক।
          </p>
        </AlertDescription>
      </Alert>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('systems')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'systems'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Server className="h-4 w-4" />
          Connected Systems ({systems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('staged_records')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'staged_records'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSearch className="h-4 w-4" />
          Staged Diagnostics Review ({stagedRecords.filter(r => r.clinicianReviewStatus === 'pending_review').length} pending)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Exchange Audit Log ({transactions.length})
        </button>
      </div>

      {statusMessage && (
        <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs">{statusMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tab 1: Connected Systems */}
      {activeTab === 'systems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map(sys => {
            const ping = pingResults[sys.systemCode]
            return (
              <Card key={sys.systemCode} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={sys.status === 'active' ? 'default' : 'destructive'} className="text-[10px]">
                      {sys.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {sys.interoperabilityStandard.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold mt-2">{sys.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{sys.attributionText}</p>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium uppercase">{sys.systemType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auth:</span>
                      <span className="font-mono text-[11px]">{sys.authMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jurisdiction:</span>
                      <span>{sys.jurisdiction}</span>
                    </div>
                    {ping && (
                      <div className="flex justify-between items-center bg-muted/50 p-1.5 rounded text-[11px]">
                        <span className="text-muted-foreground">Latency:</span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {ping.latencyMs} ms (Healthy)
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={isPending}
                    onClick={() => handlePing(sys.systemCode)}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tab 2: Staged Diagnostic Records Review Queue */}
      {activeTab === 'staged_records' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Inbound Staged Diagnostic Records (HL7 v2 &amp; DICOM CT Bridge)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Inbound diagnostic data awaiting sovereign clinician verification. Records remain staged until accepted, retained, or rejected.
              </p>
            </CardHeader>
            <CardContent>
              {stagedRecords.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No staged records currently queued for review.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Patient ID</th>
                        <th className="py-2 px-3">Exam / Observation</th>
                        <th className="py-2 px-3">Value / Result</th>
                        <th className="py-2 px-3">Source System</th>
                        <th className="py-2 px-3">Reported At</th>
                        <th className="py-2 px-3 text-right">Clinician Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stagedRecords.map(rec => (
                        <tr key={rec.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3">
                            <Badge
                              variant={
                                rec.clinicianReviewStatus === 'verified'
                                  ? 'default'
                                  : rec.clinicianReviewStatus === 'rejected'
                                    ? 'destructive'
                                    : 'outline'
                              }
                              className="text-[10px]"
                            >
                              {rec.clinicianReviewStatus}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 font-mono">{rec.patientId}</td>
                          <td className="py-2 px-3 font-medium">
                            {rec.testOrExamName}
                            {rec.modality && <span className="ml-1 text-[10px] text-muted-foreground">({rec.modality})</span>}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {rec.resultValue || 'Report conclusion'} {rec.resultUnit || ''}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{rec.systemName}</td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {new Date(rec.reportedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[11px] h-7"
                              onClick={() => {
                                setSelectedRecord(rec)
                                setReconciliationNotes('')
                              }}
                            >
                              Review &amp; Reconcile
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinician Review Drawer/Modal Section */}
          {selectedRecord && (
            <Card className="border-primary/50 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Clinician Diagnostic Reconciliation &amp; Sovereign Validation
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-md">
                  <div>
                    <span className="text-muted-foreground block">Patient Identifier:</span>
                    <span className="font-mono font-medium">{selectedRecord.patientId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">External System:</span>
                    <span className="font-medium">{selectedRecord.systemName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Test / Procedure:</span>
                    <span className="font-medium">{selectedRecord.testOrExamName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Result / Impression:</span>
                    <span className="font-mono">{selectedRecord.resultValue || selectedRecord.clinicalImpression || 'Pending'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reconciliationNotes" className="font-semibold block">
                    Documented Clinical Justification (Mandatory):
                  </label>
                  <textarea
                    id="reconciliationNotes"
                    value={reconciliationNotes}
                    onChange={e => setReconciliationNotes(e.target.value)}
                    placeholder="Enter formal clinical evaluation reason, verification steps performed, or grounds for retaining authoritative record..."
                    className="w-full min-h-[70px] p-2 text-xs border rounded-md bg-background focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-600 hover:text-rose-700"
                    disabled={isPending}
                    onClick={() => handleReconcile('reject_imported')}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reject Imported Record
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={isPending}
                    onClick={() => handleReconcile('retain_authoritative')}
                  >
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    Retain Lungent Authoritative
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isPending}
                    onClick={() => handleReconcile('accept_imported')}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Accept &amp; Validate Record
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Transactions Audit Log */}
      {activeTab === 'transactions' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Healthcare Data Exchange Transaction Log
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Immutable cryptographic ledger of inbound and outbound HL7 FHIR R4, HL7 v2, and DICOM exchanges.
            </p>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No data exchange transactions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">System</th>
                      <th className="py-2 px-3">Direction &amp; Type</th>
                      <th className="py-2 px-3">Resource</th>
                      <th className="py-2 px-3">Payload SHA-256</th>
                      <th className="py-2 px-3">Consent</th>
                      <th className="py-2 px-3">Latency</th>
                      <th className="py-2 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3">
                          <Badge
                            variant={
                              tx.status === 'success'
                                ? 'default'
                                : tx.status === 'blocked_no_consent'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className="text-[10px]"
                          >
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 font-medium">{tx.systemName}</td>
                        <td className="py-2 px-3 uppercase text-[11px]">{tx.transactionType}</td>
                        <td className="py-2 px-3 font-mono">{tx.resourceType}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {tx.payloadHash}
                        </td>
                        <td className="py-2 px-3">
                          {tx.consentVerified ? (
                            <span className="text-emerald-600 font-medium">Verified</span>
                          ) : (
                            <span className="text-rose-600 font-medium">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">{tx.latencyMs} ms</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
