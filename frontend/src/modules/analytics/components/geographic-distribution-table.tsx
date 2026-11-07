'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { GeographicCellDistribution } from '../types'
import { useLanguage } from '@/i18n'
import { MapPin, ShieldAlert, AlertCircle } from 'lucide-react'

export interface GeographicDistributionTableProps {
  geographics: GeographicCellDistribution[]
}

export function GeographicDistributionTable({
  geographics,
}: GeographicDistributionTableProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <CardTitle className="text-base">
              {isBn ? 'ভৌগোলিক বণ্টন ও ক্যানোনিকাল গোপনীয়তা' : 'Geographic Distribution & Privacy Protection'}
            </CardTitle>
          </div>
          <Badge variant="outline" size="sm" className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-3" />
            {isBn ? 'k-অ্যানোনিমিটি (< ৫ গোপন)' : 'k-Anonymity (< 5 Suppressed)'}
          </Badge>
        </div>
        <CardDescription>
          {isBn
            ? 'রোগী পুনর্শনাক্তকরণ রোধে ৫ জনের কম ব্যবহারকারী থাকা এলাকায় নির্দিষ্ট তথ্য গোপন রাখা হয়।'
            : 'Operational distribution across administrative divisions. Cells with < 5 individuals are suppressed to preserve patient confidentiality.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBn ? 'বিভাগ' : 'Division'}</TableHead>
                <TableHead className="text-right">{isBn ? 'রোগী সংখ্যা' : 'Patients'}</TableHead>
                <TableHead className="text-right">{isBn ? 'স্বাস্থ্যকেন্দ্র' : 'Facilities'}</TableHead>
                <TableHead className="text-right">{isBn ? 'মূল্যায়ন' : 'Assessments'}</TableHead>
                <TableHead className="text-right">{isBn ? 'স্বাস্থ্যকর্মী' : 'CHWs'}</TableHead>
                <TableHead className="text-right">{isBn ? 'রেফারেল' : 'Referrals'}</TableHead>
                <TableHead className="text-center">{isBn ? 'গোপনীয়তা স্থিতি' : 'Privacy Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {geographics.map((row) => (
                <TableRow key={row.division}>
                  <TableCell className="font-semibold text-foreground">
                    {isBn ? row.divisionBn : row.division}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.isSuppressed ? (
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        &lt; 5
                      </span>
                    ) : (
                      row.patientCount
                    )}
                  </TableCell>
                  <TableCell className="text-right">{row.facilityCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {row.isSuppressed ? (
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        &lt; 5
                      </span>
                    ) : (
                      row.assessmentCount
                    )}
                  </TableCell>
                  <TableCell className="text-right">{row.workerCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {row.isSuppressed ? (
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        &lt; 5
                      </span>
                    ) : (
                      row.referralCount
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.isSuppressed ? (
                      <Badge variant="warning" size="sm">
                        {isBn ? 'সংরক্ষিত' : 'Masked'}
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        {isBn ? 'প্রকাশ্য' : 'Standard'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Clinical Safety Non-Conclusion Reminder */}
        <div className="flex items-start gap-2 p-2.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-800 dark:text-blue-300 text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'গুরুত্বপূর্ণ সতর্কতা: কোনো বিভাগে নিবন্ধনের সংখ্যা কম থাকার অর্থ এই নয় যে সেখানে স্বাস্থ্যসেবার সংকট রয়েছে। এটি শুধুমাত্র প্ল্যাটফর্মের বর্তমান ব্যবহারের চিত্র।'
              : 'Governance Boundary: Fewer registrations in an administrative area must NOT be interpreted as population underservice. It solely reflects current platform adoption.'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

