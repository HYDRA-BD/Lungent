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
import { History, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { GovernanceAuditEvent } from '../types'

interface GovernanceAuditTableProps {
  auditEvents: GovernanceAuditEvent[]
}

export function GovernanceAuditTable({ auditEvents }: GovernanceAuditTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return <Badge variant="success">{isBn ? 'অনুমোদিত' : 'Approved'}</Badge>
      case 'activated':
        return <Badge variant="info">{isBn ? 'সক্রিয়করণ' : 'Activated'}</Badge>
      case 'suspended':
        return <Badge variant="destructive">{isBn ? 'স্থগিত' : 'Suspended'}</Badge>
      case 'deprecated':
        return <Badge variant="outline">{isBn ? 'অপ্রচলিত' : 'Deprecated'}</Badge>
      case 'credential_verified':
        return <Badge variant="success">{isBn ? 'সনদ যাচাই' : 'Verified'}</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5 text-indigo-600" />
          {t.auditTrail} ({auditEvents.length})
        </CardTitle>
        <CardDescription>
          {isBn
            ? 'ক্লিনিক্যাল পদ্ধতির অনুমোদন, সংস্করণ সক্রিয়করণ এবং সনদ যাচাইকরণের অপরিবর্তনীয় লগ।'
            : 'Immutable, append-only history of all clinical governance decisions, approvals, and rule activations.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auditEvents.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {isBn ? 'কোনো অডিট রেকর্ড পাওয়া যায়নি।' : 'No governance audit records logged.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'সময়' : 'Timestamp'}</TableHead>
                  <TableHead>{isBn ? 'বিষয়' : 'Entity'}</TableHead>
                  <TableHead>{isBn ? 'পদক্ষেপ' : 'Action'}</TableHead>
                  <TableHead>{isBn ? 'কর্তৃপক্ষ ও ভূমিকা' : 'Actor & Role'}</TableHead>
                  <TableHead>{isBn ? 'যৌক্তিকতা ও রেফারেন্স' : 'Justification & Meeting Ref'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEvents.map((evt) => (
                  <TableRow key={evt.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" size="sm" className="font-mono text-[11px]">
                        {evt.entityType.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>{getActionBadge(evt.action)}</TableCell>

                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <ShieldCheck className="size-3 text-indigo-500" />
                        {evt.actorName}
                      </div>
                      <span className="text-muted-foreground text-[11px] font-mono">
                        {evt.actorRole}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-[320px] text-xs">
                      <p className="text-foreground">{evt.justification}</p>
                      {evt.meetingReference && (
                        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                          Ref: {evt.meetingReference}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

