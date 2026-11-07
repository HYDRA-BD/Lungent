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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { History, Shield, Search } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { SecurityAuditEvent, AuditSeverity, AuditOutcome } from '../types'

interface SecurityAuditTableProps {
  logs: SecurityAuditEvent[]
}

export function SecurityAuditTable({ logs }: SecurityAuditTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance

  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all')

  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matches =
        log.eventType.toLowerCase().includes(q) ||
        (log.actorId && log.actorId.toLowerCase().includes(q)) ||
        (log.targetResource && log.targetResource.toLowerCase().includes(q)) ||
        (log.clientIp && log.clientIp.toLowerCase().includes(q))
      if (!matches) return false
    }

    if (severityFilter !== 'all' && log.severity !== severityFilter) {
      return false
    }

    if (outcomeFilter !== 'all' && log.outcome !== outcomeFilter) {
      return false
    }

    return true
  })

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">{isBn ? 'সংকটপূর্ণ' : 'Critical'}</Badge>
      case 'high':
        return <Badge variant="destructive">{isBn ? 'উচ্চ' : 'High'}</Badge>
      case 'medium':
        return <Badge variant="warning">{isBn ? 'মাঝারি' : 'Medium'}</Badge>
      case 'low':
        return <Badge variant="secondary">{isBn ? 'নিম্ন' : 'Low'}</Badge>
      default:
        return <Badge variant="outline">{isBn ? 'তথ্য' : 'Info'}</Badge>
    }
  }

  const getOutcomeBadge = (outcome: AuditOutcome) => {
    switch (outcome) {
      case 'success':
        return <Badge variant="success">{isBn ? 'সফল' : 'Success'}</Badge>
      case 'blocked':
        return <Badge variant="destructive">{isBn ? 'অবরুদ্ধ' : 'Blocked'}</Badge>
      case 'failure':
        return <Badge variant="destructive">{isBn ? 'ব্যর্থ' : 'Failure'}</Badge>
      case 'flagged':
        return <Badge variant="warning">{isBn ? 'চিহ্নিত' : 'Flagged'}</Badge>
      default:
        return <Badge variant="secondary">{outcome}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5 text-indigo-600" />
              {t.tabs.audit} ({filteredLogs.length})
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'অপরিবর্তনীয় নিরাপত্তা ইভেন্ট, প্রমাণীকরণ প্রচেষ্টা, অ্যাক্সেস নিয়ন্ত্রণ লঙ্ঘন এবং ডেটা ক্রিয়াকলাপের লগ।'
                : 'Append-only audit trail recording authentication attempts, access boundary enforcements, consent changes, and administrative actions.'}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={isBn ? 'ইভেন্ট বা ইউজার খুঁজুন...' : 'Search events or users...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: 'all', label: t.allSeverities },
                { value: 'critical', label: isBn ? 'সংকটপূর্ণ' : 'Critical' },
                { value: 'high', label: isBn ? 'উচ্চ' : 'High' },
                { value: 'medium', label: isBn ? 'মাঝারি' : 'Medium' },
                { value: 'low', label: isBn ? 'নিম্ন' : 'Low' },
                { value: 'info', label: isBn ? 'তথ্য' : 'Info' },
              ]}
              className="w-32 text-xs"
            />

            <Select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              options={[
                { value: 'all', label: t.allOutcomes },
                { value: 'success', label: isBn ? 'সফল' : 'Success' },
                { value: 'blocked', label: isBn ? 'অবরুদ্ধ' : 'Blocked' },
                { value: 'failure', label: isBn ? 'ব্যর্থ' : 'Failure' },
                { value: 'flagged', label: isBn ? 'চিহ্নিত' : 'Flagged' },
              ]}
              className="w-32 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {isBn ? 'কোনো অডিট লগ পাওয়া যায়নি।' : 'No security audit logs match the current filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'সময়' : 'Timestamp'}</TableHead>
                  <TableHead>{isBn ? 'ইভেন্টের ধরণ' : 'Event Type'}</TableHead>
                  <TableHead>{t.severity}</TableHead>
                  <TableHead>{isBn ? 'ফলাফল' : 'Outcome'}</TableHead>
                  <TableHead>{isBn ? 'ব্যবহারকারী ও ভূমিকা' : 'Actor & Role'}</TableHead>
                  <TableHead>{isBn ? 'রিসোর্স' : 'Resource'}</TableHead>
                  <TableHead>{isBn ? 'আইপি ও মেটাডেটা' : 'IP & Metadata'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {log.eventType}
                      </span>
                    </TableCell>

                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>

                    <TableCell>{getOutcomeBadge(log.outcome)}</TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <Shield className="size-3 text-indigo-500" />
                        {log.actorId || 'system'}
                      </div>
                      <span className="text-muted-foreground text-[11px] font-mono">
                        {log.actorRole || 'system_service'}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                      {log.targetResource || '—'}
                    </TableCell>

                    <TableCell className="text-xs max-w-[200px]">
                      <span className="font-mono text-[11px] text-foreground block">
                        {log.clientIp || '127.0.0.1'}
                      </span>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">
                        {JSON.stringify(log.metadata)}
                      </div>
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

