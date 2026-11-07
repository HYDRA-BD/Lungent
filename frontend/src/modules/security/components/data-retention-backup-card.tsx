'use client'

import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Database, CheckCircle2, FileLock2, Clock } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { DataRetentionPolicy, BackupVerification } from '../types'

interface DataRetentionBackupCardProps {
  policies: DataRetentionPolicy[]
  backups: BackupVerification[]
}

export function DataRetentionBackupCard({
  policies,
  backups,
}: DataRetentionBackupCardProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'clinical_records':
        return isBn ? 'ক্লিনিক্যাল রেকর্ড ও অ্যাসেসমেন্ট' : 'Clinical Records & Assessments'
      case 'diagnostic_imaging_reports':
        return isBn ? 'ডায়াগনস্টিক রিপোর্ট' : 'Diagnostic Imaging Reports'
      case 'security_audit_logs':
        return isBn ? 'নিরাপত্তা অডিট লগ' : 'Security Audit Logs'
      case 'temporary_assessment_drafts':
        return isBn ? 'অসমাপ্ত অ্যাসেসমেন্ট ড্রাফট' : 'Temporary Assessment Drafts'
      case 'platform_telemetry':
        return isBn ? 'সিস্টেম টেলিমেট্রি (নন-পিএইচআই)' : 'System Telemetry (Non-PHI)'
      case 'notifications_history':
        return isBn ? 'নোটিফিকেশন ইতিহাস' : 'Notifications History'
      default:
        return cat
    }
  }

  return (
    <div className="space-y-6">
      {/* Retention Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-indigo-600" />
            {t.retentionPoliciesCount} ({policies.length})
          </CardTitle>
          <CardDescription>
            {isBn
              ? 'আইনি বিধিমালার সাথে সংগতি রেখে ডেটার প্রকারভেদে নির্ধারিত ধারণকাল ও অপসারণ নীতিমালা।'
              : 'Defined retention periods and lawful deletion schedules compliant with BMDC, hospital guidelines, and cyber security regulations.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'ডেটার শ্রেণী' : 'Data Category'}</TableHead>
                  <TableHead>{isBn ? 'ধারণকাল' : 'Retention Period'}</TableHead>
                  <TableHead>{isBn ? 'আইনি ভিত্তি' : 'Legal Basis'}</TableHead>
                  <TableHead>{isBn ? 'স্থগিতাদেশ ও প্রকৃতি' : 'Immutability / Hold'}</TableHead>
                  <TableHead>{isBn ? 'অপসারণ পদ্ধতি' : 'Disposal Method'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {getCategoryLabel(p.dataCategory)}
                    </TableCell>

                    <TableCell className="text-xs font-mono">
                      {p.retentionPeriodDays >= 365
                        ? `${Math.round(p.retentionPeriodDays / 365)} ${isBn ? 'বছর' : 'Years'} (${p.retentionPeriodDays}d)`
                        : `${p.retentionPeriodDays} ${isBn ? 'দিন' : 'Days'}`}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-[240px]">
                      {p.legalBasis}
                    </TableCell>

                    <TableCell>
                      {p.isImmutable ? (
                        <Badge variant="warning" className="gap-1 text-[11px]">
                          <FileLock2 className="size-3" />
                          {isBn ? 'অপরিবর্তনীয়' : 'Immutable Hold'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">
                          {isBn ? 'স্বয়ংক্রিয়' : 'Automated Purge'}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                      {p.deletionMethod}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Disaster Recovery Verification Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5 text-emerald-600" />
                {t.backupStatus}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'স্বয়ংক্রিয় ব্যাকআপ স্ন্যাপশট, পিআইটিআর প্রতিলিপিকরণ এবং টেস্ট পুনরুদ্ধার ড্রিল যাচাইকরণ রেকর্ড।'
                  : 'Documented verification of automated daily snapshots, continuous point-in-time recovery, and restore drill results.'}
              </CardDescription>
            </div>
            <Badge variant="success" size="lg" className="gap-1.5">
              <CheckCircle2 className="size-4" />
              {t.verifiedBackup}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'ব্যাকআপের ধরণ' : 'Backup Type'}</TableHead>
                  <TableHead>{isBn ? 'টার্গেট সিস্টেম' : 'Target System'}</TableHead>
                  <TableHead>{isBn ? 'স্ন্যাপশট সময়' : 'Snapshot Time'}</TableHead>
                  <TableHead>{isBn ? 'যাচাই স্থিতি' : 'Verification Status'}</TableHead>
                  <TableHead>{isBn ? 'যাচাইকারী ও ড্রিল নোট' : 'Verified By & Recovery Drill'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((bkp) => (
                  <TableRow key={bkp.id}>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {bkp.backupType}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {bkp.targetSystem}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(bkp.snapshotTimestamp).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge variant="success" size="sm" className="gap-1">
                        <CheckCircle2 className="size-3" />
                        {isBn ? 'সফল' : 'Verified OK'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs max-w-[280px]">
                      <div className="font-semibold text-foreground">{bkp.verifiedBy}</div>
                      <p className="text-muted-foreground text-[11px]">{bkp.verificationNotes}</p>
                      {bkp.recoveryDrillDate && (
                        <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 block pt-0.5">
                          {isBn ? 'সর্বশেষ টেস্ট ড্রিল: ' : 'Drill Date: '} {bkp.recoveryDrillDate}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

