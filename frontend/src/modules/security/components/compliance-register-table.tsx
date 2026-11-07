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
import { Select } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileCheck, Shield, Info } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { ComplianceControl, ImplementationStatus } from '../types'

interface ComplianceRegisterTableProps {
  controls: ComplianceControl[]
}

export function ComplianceRegisterTable({
  controls,
}: ComplianceRegisterTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance

  const [frameworkFilter, setFrameworkFilter] = useState<string>('all')

  const filteredControls = controls.filter((ctrl) => {
    if (frameworkFilter !== 'all' && ctrl.framework !== frameworkFilter) {
      return false
    }
    return true
  })

  const getStatusBadge = (status: ImplementationStatus) => {
    switch (status) {
      case 'implemented':
        return <Badge variant="success">{isBn ? 'বাস্তবায়িত' : 'Implemented'}</Badge>
      case 'in_progress':
        return <Badge variant="warning">{isBn ? 'চলমান' : 'In Progress'}</Badge>
      case 'requires_legal_review':
        return <Badge variant="destructive">{isBn ? 'আইনি পর্যালোচনা প্রয়োজন' : 'Legal Review Needed'}</Badge>
      default:
        return <Badge variant="secondary">{isBn ? 'পরিকল্পিত' : 'Planned'}</Badge>
    }
  }

  const getFrameworkLabel = (fw: string) => {
    switch (fw) {
      case 'BD_CYBER_SECURITY_ACT_2023':
        return 'Bangladesh Cyber Security Act 2023'
      case 'BD_DRAFT_DATA_PROTECTION_ACT':
        return 'Bangladesh Draft Data Protection Act'
      case 'BMDC_CODE_OF_ETHICS':
        return 'BMDC Code of Medical Ethics'
      case 'DGHS_DIGITAL_HEALTH_GUIDELINES':
        return 'DGHS Digital Health Guidelines'
      case 'ISO_27001_READINESS':
        return 'ISO/IEC 27001 Readiness'
      case 'HIPAA_SECURITY_READINESS':
        return 'HIPAA Security/Privacy Principles'
      case 'GDPR_READINESS':
        return 'GDPR Data Rights Readiness'
      default:
        return fw
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="size-5 text-indigo-600" />
              {t.tabs.compliance} ({filteredControls.length})
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'বাংলাদেশ এবং আন্তর্জাতিক তথ্য সুরক্ষা, চিকিৎসা নৈতিকতা ও সাইবার নিরাপত্তা কাঠামোর প্রস্তুতি রেজিস্টার।'
                : 'Mapping of Bangladesh and international data protection, medical ethics, and cybersecurity requirements to technical controls.'}
            </CardDescription>
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              options={[
                { value: 'all', label: isBn ? 'সকল রেগুলেটরি কাঠামো' : 'All Regulatory Frameworks' },
                { value: 'BD_CYBER_SECURITY_ACT_2023', label: 'BD Cyber Security Act 2023' },
                { value: 'BD_DRAFT_DATA_PROTECTION_ACT', label: 'BD Draft Data Protection Act' },
                { value: 'BMDC_CODE_OF_ETHICS', label: 'BMDC Code of Ethics' },
                { value: 'DGHS_DIGITAL_HEALTH_GUIDELINES', label: 'DGHS Guidelines' },
                { value: 'ISO_27001_READINESS', label: 'ISO/IEC 27001 Readiness' },
                { value: 'HIPAA_SECURITY_READINESS', label: 'HIPAA Principles' },
                { value: 'GDPR_READINESS', label: 'GDPR Readiness' },
              ]}
              className="text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Important Compliance Legal Disclaimer Notice */}
        <Alert variant="info" className="text-xs">
          <Info className="size-4" />
          <AlertTitle className="font-semibold text-xs">
            {isBn ? 'কমপ্লায়েন্স ও আইনি নিরীক্ষা সম্পর্কিত বিজ্ঞপ্তি' : 'Compliance Readiness & Regulatory Disclaimer'}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-[11px] leading-relaxed mt-1">
            {t.disclaimer}
          </AlertDescription>
        </Alert>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableRow className="border-none hover:bg-transparent p-0">
                  <TableHead>{isBn ? 'নিয়ন্ত্রণ আইডি' : 'Control ID'}</TableHead>
                  <TableHead>{t.framework}</TableHead>
                  <TableHead>{isBn ? 'নিয়ন্ত্রণের নাম ও উদ্দেশ্য' : 'Control Name & Objective'}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.evidence}</TableHead>
                  <TableHead>{isBn ? 'দায়িত্বপ্রাপ্ত' : 'Owner'}</TableHead>
                </TableRow>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredControls.map((ctrl) => (
                <TableRow key={ctrl.id}>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    {ctrl.controlId}
                    <span className="block font-normal text-[10px] text-muted-foreground">
                      {ctrl.jurisdiction}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs max-w-[160px]">
                    <span className="font-medium text-foreground block text-[11px]">
                      {getFrameworkLabel(ctrl.framework)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{ctrl.category}</span>
                  </TableCell>

                  <TableCell className="text-xs max-w-[260px]">
                    <div className="font-semibold text-foreground">{ctrl.controlName}</div>
                    <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">
                      {ctrl.description}
                    </p>
                  </TableCell>

                  <TableCell>{getStatusBadge(ctrl.implementationStatus)}</TableCell>

                  <TableCell className="text-xs max-w-[240px]">
                    <div className="rounded bg-muted/40 p-1.5 font-mono text-[10px] text-muted-foreground leading-tight">
                      {ctrl.evidenceSummary}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs whitespace-nowrap">
                    <div className="font-medium text-foreground flex items-center gap-1">
                      <Shield className="size-3 text-indigo-500" />
                      {ctrl.responsibleOwner}
                    </div>
                    <span className="text-muted-foreground text-[10px] font-mono">
                      {new Date(ctrl.lastAuditedAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

