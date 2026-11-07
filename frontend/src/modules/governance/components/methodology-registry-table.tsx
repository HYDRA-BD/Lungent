'use client'

import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  BookOpen,
  Sliders,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { ClinicalMethodology, ClinicalMethodologyVersion } from '../types'
import { MethodologyApprovalDialog } from './methodology-approval-dialog'

interface MethodologyRegistryTableProps {
  methodologies: ClinicalMethodology[]
  onRefresh?: () => void
}

export function MethodologyRegistryTable({
  methodologies,
  onRefresh,
}: MethodologyRegistryTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<ClinicalMethodologyVersion | null>(null)
  const [activeMethodologyName, setActiveMethodologyName] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const openApprovalModal = (meth: ClinicalMethodology) => {
    const activeVer = meth.versions?.find((v) => v.id === meth.activeVersionId) || meth.versions?.[0]
    if (activeVer) {
      setSelectedVersion(activeVer)
      setActiveMethodologyName(meth.name)
      setDialogOpen(true)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{isBn ? 'সক্রিয়' : 'Active'}</Badge>
      case 'approved':
        return <Badge variant="info">{isBn ? 'অনুমোদিত' : 'Approved'}</Badge>
      case 'under_review':
      case 'under_clinical_review':
        return <Badge variant="warning">{isBn ? 'পর্যালোচনাধীন' : 'Under Review'}</Badge>
      case 'suspended':
        return <Badge variant="destructive">{isBn ? 'স্থগিত' : 'Suspended'}</Badge>
      case 'deprecated':
        return <Badge variant="outline">{isBn ? 'অপ্রচলিত' : 'Deprecated'}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'risk_prediction':
        return isBn ? 'ঝুঁকি অনুমান মডেল' : 'Risk Prediction Model'
      case 'screening_eligibility':
        return isBn ? 'স্ক্রীনিং নির্দেশিকা' : 'Screening Guideline'
      case 'symptom_triage':
        return isBn ? 'উপসর্গ ট্রায়াজ প্রোটোকল' : 'Symptom Triage Protocol'
      default:
        return type
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-emerald-600" />
                {t.methodologyRegistry}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'জাতীয় ক্লিনিক্যাল অ্যাডভাইজরি বোর্ড কর্তৃক অনুমোদিত মডেল ও নির্ণয় বিধিমালার কেন্দ্রীয় তালিকা।'
                  : 'Centralized registry of clinical models, guidelines, and decision rules evaluated and sanctioned by the Clinical Advisory Board.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'পদ্ধতি ও কোড' : 'Methodology & Code'}</TableHead>
                  <TableHead>{isBn ? 'ধরণ' : 'Type'}</TableHead>
                  <TableHead>{isBn ? 'প্রদানকারী সংস্থা' : 'Issuing Body'}</TableHead>
                  <TableHead>{isBn ? 'সক্রিয় ভার্সন' : 'Active Version'}</TableHead>
                  <TableHead>{isBn ? 'প্রমাণের মাত্রা' : 'Evidence'}</TableHead>
                  <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methodologies.map((meth) => {
                  const isExpanded = expandedId === meth.id
                  const activeVer = meth.versions?.find((v) => v.id === meth.activeVersionId) || meth.versions?.[0]

                  return (
                    <React.Fragment key={meth.id}>
                      <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => toggleExpand(meth.id)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                            <div>
                              <div className="font-semibold text-foreground">{meth.name}</div>
                              <span className="text-xs font-mono text-muted-foreground">{meth.code}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-300">
                            {getTypeLabel(meth.type)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {meth.issuingOrganization}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {meth.activeVersionString || 'v1.0.0'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">
                            {meth.evidenceGrade}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(meth.governanceStatus)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Sliders className="size-3.5" />}
                            onClick={() => openApprovalModal(meth)}
                          >
                            {isBn ? 'লাইফসাইকেল' : 'Lifecycle'}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Details Row */}
                      {isExpanded && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={7} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1.5 p-3 rounded-lg border bg-background">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <BookOpen className="size-3.5 text-blue-600" />
                                  {isBn ? 'উদ্দিষ্ট জনগোষ্ঠী ও কার্যপ্রণালী' : 'Target Population & Reference'}
                                </div>
                                <p className="text-muted-foreground">{meth.targetPopulation}</p>
                                <p className="font-mono text-[11px] text-slate-500 pt-1 border-t">
                                  Ref: {meth.primaryReference}
                                </p>
                              </div>

                              <div className="space-y-1.5 p-3 rounded-lg border bg-background">
                                <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                  <ShieldAlert className="size-3.5" />
                                  {isBn ? 'ক্লিনিক্যাল সীমাবদ্ধতা ও সতর্কতা' : 'Clinical Limitations'}
                                </div>
                                <p className="text-muted-foreground">{meth.clinicalLimitations}</p>
                              </div>
                            </div>

                            {activeVer && (
                              <div className="p-3 rounded-lg border bg-background space-y-2">
                                <div className="flex items-center justify-between text-xs border-b pb-2">
                                  <span className="font-semibold">
                                    {isBn ? 'সক্রিয় সংস্করণ প্যারামিটার ও শর্তাবলি' : 'Active Version Parameter Thresholds'} ({activeVer.versionString} / SemVer: {activeVer.semver})
                                  </span>
                                  <span className="text-muted-foreground">
                                    {isBn ? 'অনুমোদনকারী: ' : 'Approved By: '} {activeVer.approvedByMemberName || 'CAB Chair'}
                                  </span>
                                </div>
                                <div className="font-mono text-[11px] bg-slate-900 text-slate-100 p-2.5 rounded overflow-x-auto">
                                  {JSON.stringify(activeVer.ruleDefinitions, null, 2)}
                                </div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MethodologyApprovalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        version={selectedVersion}
        methodologyName={activeMethodologyName}
        onSuccess={onRefresh}
      />
    </>
  )
}

