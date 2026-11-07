'use client'

/**
 * Phase 1.22: Administrative Reporting Oversight Client
 *
 * Provides system administrators with operational telemetry, generation metrics,
 * language distribution, and audit summaries with strict data minimization
 * (no unrestricted clinical findings or sensitive patient diagnostic data exposed).
 */

import React from 'react'
import {
  FileText,
  Languages,
  HardDrive,
  Lock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import { preserveCanonicalIdentifier, formatDate } from '@/i18n/formatters'

interface OperationalReportSummary {
  id: string
  reportReference: string
  reportType: string
  language: string
  templateVersion: string
  fileSizeBytes: number
  generatedByRole: string
  status: string
  isPatientAccessible: boolean
  createdAt: string
}

interface AdminReportsClientProps {
  operationalReports: OperationalReportSummary[]
}

export function AdminReportsClient({ operationalReports }: AdminReportsClientProps) {
  const { locale } = useLanguage()

  const totalReports = operationalReports.length
  const enCount = operationalReports.filter(r => r.language === 'en').length
  const bnCount = operationalReports.filter(r => r.language === 'bn').length
  const totalStorageBytes = operationalReports.reduce((acc, r) => acc + (r.fileSizeBytes || 0), 0)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {locale === 'bn' ? 'রিপোর্ট জেনারেশন ও অডিট তদারকি' : 'Report Generation Oversight & Audit'}
          </h1>
          <Badge variant="outline" className="border-indigo-500/40 text-indigo-700 bg-indigo-50/50">
            {locale === 'bn' ? 'প্রশাসনিক টেলিমেট্রি' : 'Admin Telemetry'}
          </Badge>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
          {locale === 'bn'
            ? 'সিস্টেমব্যাপী প্রতিবেদন তৈরির পরিসংখ্যান, ভাষাভিত্তিক বিন্যাস এবং স্টোরেজ ব্যবহার নিরীক্ষা।'
            : 'Operational monitoring of report volume, template versions, language parity, and storage consumption.'}
        </p>
      </div>

      {/* Data Minimization Notice */}
      <Alert className="bg-muted/40 border-border">
        <Lock className="h-4 w-4 text-primary" />
        <AlertTitle className="text-xs sm:text-sm font-semibold">
          {locale === 'bn' ? 'ডেটা মিনিমাইজেশন ও গোপনীয়তা নীতি' : 'Data Minimization & Confidentiality Safeguard'}
        </AlertTitle>
        <AlertDescription className="text-xs mt-1 text-muted-foreground leading-relaxed">
          {locale === 'bn'
            ? 'প্রশাসনিক প্যানেল কেবল সিস্টেমের মেটাডেটা ও অডিট লগ প্রদর্শন করে। রোগীর সংবেদনশীল ক্লিনিক্যাল ফলাফল বা ডায়াগনস্টিক তথ্য চিকিৎসকদের জন্য সংরক্ষিত।'
            : 'Administrative views are restricted to operational telemetry and audit events. Sensitive clinical diagnoses and patient health data remain protected.'}
        </AlertDescription>
      </Alert>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'মোট প্রতিবেদন' : 'Total Reports'}</div>
              <div className="text-2xl font-bold text-foreground mt-0.5">{totalReports}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-700">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'ইংরেজি প্রতিবেদন' : 'English Reports'}</div>
              <div className="text-2xl font-bold text-indigo-700 mt-0.5">{enCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-700">
              <Languages className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'বাংলা প্রতিবেদন' : 'Bangla Reports'}</div>
              <div className="text-2xl font-bold text-emerald-700 mt-0.5">{bnCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700">
              <Languages className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">{locale === 'bn' ? 'স্টোরেজ ব্যবহার' : 'Document Storage'}</div>
              <div className="text-2xl font-bold text-amber-700 mt-0.5">{formatFileSize(totalStorageBytes)}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-700">
              <HardDrive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Reports Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'কোড' : 'Report Reference'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'ধরন' : 'Report Type'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'ভাষা' : 'Language'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'সংস্করণ' : 'Template Ver'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'উৎপাদনকারী' : 'Generated By'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">{locale === 'bn' ? 'তারিখ' : 'Generated At'}</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right">{locale === 'bn' ? 'সাইজ' : 'Size'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {operationalReports.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-teal-700">
                      {preserveCanonicalIdentifier(r.reportReference)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {r.reportType.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold">{r.language.toUpperCase()}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      v{r.templateVersion}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-muted-foreground">
                      {r.generatedByRole.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(r.createdAt, locale)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {formatFileSize(r.fileSizeBytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
