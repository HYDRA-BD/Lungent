'use client'

/**
 * Phase 2.5: Data Quality Monitoring View
 */

import React from 'react'
import { AlertCircle, Clock, ShieldCheck, Database } from 'lucide-react'
import type { DataQualityReport } from '../types'

export interface DataQualityViewProps {
  reports: DataQualityReport[]
  locale?: 'en' | 'bn'
}

export function DataQualityView({ reports, locale = 'en' }: DataQualityViewProps) {
  const isBn = locale === 'bn'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            {isBn ? 'ডেটা কোয়ালিটি ও মান নিয়ন্ত্রণ ড্যাশবোর্ড' : 'Data Quality & Integrity Dashboard'}
          </h3>
          <p className="text-xs text-slate-400">
            {isBn
              ? 'রোগী রেকর্ড, মূল্যায়ন এবং পরিবেশগত ডেটার পূর্ণতা ও নির্ভুলতা পর্যবেক্ষণ'
              : 'Continuous monitoring of completeness, validity, and staleness across domains'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
            {isBn
              ? 'কোনো ডেটা কোয়ালিটি স্ন্যাপশট নেই।'
              : 'No data quality report snapshots available.'}
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold capitalize text-sky-400">
                  {report.domain}
                </span>
                <span className="text-[10px] text-slate-500">{report.snapshotDate}</span>
              </div>

              {/* Quality Score Meter */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100">
                  {report.qualityScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.qualityScore >= 90
                      ? 'bg-emerald-500'
                      : report.qualityScore >= 75
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${report.qualityScore}%` }}
                />
              </div>

              {/* Breakdown metrics */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Database className="h-3.5 w-3.5" />
                    {isBn ? 'মোট রেকর্ড' : 'Total Records'}
                  </span>
                  <span className="font-medium text-slate-200">{report.totalRecords}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {isBn ? 'অনুপস্থিত (Missing)' : 'Missing'}
                  </span>
                  <span className="font-medium text-rose-300">{report.missingCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    {isBn ? 'মেয়াদোত্তীর্ণ (Stale)' : 'Stale (>30d)'}
                  </span>
                  <span className="font-medium text-amber-300">{report.staleCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {isBn ? 'যাচাইকৃত (Confirmed)' : 'Confirmed'}
                  </span>
                  <span className="font-medium text-emerald-300">{report.confirmedCount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
