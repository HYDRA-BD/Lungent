'use client'

/**
 * Phase 2.5: Central Anomaly Detection Dashboard View
 */

import React, { useState } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Activity,
  FileText,
  Wind,
  Server,
  Layers,
} from 'lucide-react'
import type {
  AnomalyCategory,
  AnomalyRecord,
  AnomalySeverity,
  AnomalyStatus,
  AnomalySummary,
  ResolutionOutcome,
} from '../types'
import { AnomalyDetailModal } from './anomaly-detail-modal'

export interface AnomalyDashboardViewProps {
  initialAnomalies: AnomalyRecord[]
  summary: AnomalySummary
  locale?: 'en' | 'bn'
  onUpdateStatus?: (id: string, newStatus: AnomalyStatus, notes?: string) => Promise<void>
  onResolve?: (id: string, outcome: ResolutionOutcome, notes: string) => Promise<void>
  onDismiss?: (id: string, reason: string) => Promise<void>
  onEscalate?: (id: string, reason: string) => Promise<void>
}

export function AnomalyDashboardView({
  initialAnomalies,
  summary,
  locale = 'en',
  onUpdateStatus,
  onResolve,
  onDismiss,
  onEscalate,
}: AnomalyDashboardViewProps) {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(initialAnomalies)
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<AnomalyCategory | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isBn = locale === 'bn'

  const filteredAnomalies = anomalies.filter((a) => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchNum = a.anomalyNumber.toLowerCase().includes(q)
      const matchTitle = (isBn ? a.titleBn : a.titleEn).toLowerCase().includes(q)
      const matchDesc = (isBn ? a.descriptionBn : a.descriptionEn).toLowerCase().includes(q)
      if (!matchNum && !matchTitle && !matchDesc) return false
    }
    return true
  })

  const handleUpdateStatus = async (newStatus: AnomalyStatus, notes?: string) => {
    if (!selectedAnomaly || !onUpdateStatus) return
    await onUpdateStatus(selectedAnomaly.id, newStatus, notes)
    setAnomalies((prev) =>
      prev.map((a) => (a.id === selectedAnomaly.id ? { ...a, status: newStatus } : a))
    )
  }

  const handleResolve = async (outcome: ResolutionOutcome, notes: string) => {
    if (!selectedAnomaly || !onResolve) return
    await onResolve(selectedAnomaly.id, outcome, notes)
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === selectedAnomaly.id
          ? {
              ...a,
              status: 'resolved',
              resolutionOutcome: outcome,
              resolutionNotes: notes,
              resolvedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }

  const handleDismiss = async (reason: string) => {
    if (!selectedAnomaly || !onDismiss) return
    await onDismiss(selectedAnomaly.id, reason)
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === selectedAnomaly.id
          ? {
              ...a,
              status: 'dismissed',
              resolutionNotes: reason,
              resolvedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }

  const handleEscalate = async (reason: string) => {
    if (!selectedAnomaly || !onEscalate) return
    await onEscalate(selectedAnomaly.id, reason)
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === selectedAnomaly.id ? { ...a, status: 'escalated', severity: 'critical' } : a
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Clinical Safety Guardrail */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-amber-300">
              {isBn
                ? 'ক্লিনিকাল গভর্নেন্স ও নিরাপত্তা বিজ্ঞপ্তি'
                : 'Clinical Governance & Safety Invariant Notice'}
            </h4>
            <p className="text-xs text-slate-300">
              {isBn
                ? 'অসঙ্গতি শনাক্তকরণ তথ্যগত মানের পর্যবেক্ষক হিসেবে কাজ করে। কোনো অসঙ্গতিকে ফুসফুসের ক্যান্সার বা অন্য কোনো রোগের নিশ্চিত প্রমাণ হিসেবে বিবেচনা করা যাবে না। অসঙ্গতি ক্লিনিকাল ঝুঁকি গণনা, স্ক্রিনিং যোগ্যতা বা জরুরি উপসর্গ ট্রায়াজকে প্রভাবিত করবে না।'
                : 'Anomaly detection monitors data quality and telemetry consistency. An anomaly is NEVER a medical diagnosis and will never alter patient clinical risk scores, screening eligibility, or emergency symptom triage.'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isBn ? 'মোট শনাক্তকরণ' : 'Total Anomalies'}</span>
            <Layers className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{summary.total}</div>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>{isBn ? 'চরম জরুরি (Critical)' : 'Critical Priority'}</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-300">{summary.criticalCount}</div>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>{isBn ? 'উচ্চ অগ্রাধিকার (High)' : 'High Priority'}</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300">{summary.highCount}</div>
        </div>

        <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-sky-400">
            <span>{isBn ? 'অমীমাংসিত (Unresolved)' : 'Unresolved'}</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-300">{summary.unresolved}</div>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>{isBn ? 'সমাধানকৃত (Resolved)' : 'Resolved'}</span>
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-300">
            {summary.byStatus.resolved}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBn ? 'আইডি, শিরোনাম বা বিবরণ দিয়ে খুঁজুন...' : 'Search by ID, title, or description...'
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>{isBn ? 'ফিল্টার:' : 'Filter:'}</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as AnomalyCategory | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-sky-500"
          >
            <option value="all">{isBn ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
            <option value="patient_data">{isBn ? 'রোগী তথ্য' : 'Patient Data'}</option>
            <option value="assessment_inconsistency">{isBn ? 'মূল্যায়ন অসঙ্গতি' : 'Assessment Pattern'}</option>
            <option value="data_quality">{isBn ? 'ডেটা কোয়ালিটি' : 'Data Quality'}</option>
            <option value="environmental">{isBn ? 'পরিবেশগত' : 'Environmental'}</option>
            <option value="operational">{isBn ? 'অপারেশনাল' : 'Operational'}</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AnomalySeverity | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-sky-500"
          >
            <option value="all">{isBn ? 'সব তীব্রতা' : 'All Severities'}</option>
            <option value="critical">{isBn ? 'চরম (Critical)' : 'Critical'}</option>
            <option value="high">{isBn ? 'উচ্চ (High)' : 'High'}</option>
            <option value="medium">{isBn ? 'মাঝারি (Medium)' : 'Medium'}</option>
            <option value="low">{isBn ? 'নিম্ন (Low)' : 'Low'}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AnomalyStatus | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-sky-500"
          >
            <option value="all">{isBn ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="detected">{isBn ? 'শনাক্তকৃত (Detected)' : 'Detected'}</option>
            <option value="under_review">{isBn ? 'পর্যালোচনাধীন' : 'Under Review'}</option>
            <option value="resolved">{isBn ? 'সমাধানকৃত' : 'Resolved'}</option>
            <option value="dismissed">{isBn ? 'বাতিলকৃত' : 'Dismissed'}</option>
            <option value="escalated">{isBn ? 'উর্ধ্বতনে প্রেরিত' : 'Escalated'}</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-4 py-3">{isBn ? 'আইডি' : 'Anomaly ID'}</th>
                <th className="px-4 py-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="px-4 py-3">{isBn ? 'শিরোনাম' : 'Title'}</th>
                <th className="px-4 py-3">{isBn ? 'পদ্ধতি' : 'Method'}</th>
                <th className="px-4 py-3">{isBn ? 'তীব্রতা' : 'Severity'}</th>
                <th className="px-4 py-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="px-4 py-3">{isBn ? 'সময়' : 'Detected'}</th>
                <th className="px-4 py-3 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {isBn ? 'কোনো অসঙ্গতি পাওয়া যায়নি।' : 'No anomalies match the current filters.'}
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((a) => (
                  <tr
                    key={a.id}
                    className="transition-colors hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-sky-400">
                      {a.anomalyNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        {a.category === 'patient_data' && <FileText className="h-3.5 w-3.5 text-blue-400" />}
                        {a.category === 'assessment_inconsistency' && <Activity className="h-3.5 w-3.5 text-indigo-400" />}
                        {a.category === 'data_quality' && <Layers className="h-3.5 w-3.5 text-emerald-400" />}
                        {a.category === 'environmental' && <Wind className="h-3.5 w-3.5 text-teal-400" />}
                        {a.category === 'operational' && <Server className="h-3.5 w-3.5 text-violet-400" />}
                        <span className="capitalize">{a.category.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="max-w-[280px] truncate px-4 py-3 font-medium text-slate-200">
                      {isBn ? a.titleBn : a.titleEn}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {a.detectionMethodology}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          a.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400'
                            : a.severity === 'high'
                            ? 'bg-amber-500/20 text-amber-400'
                            : a.severity === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-sm bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(a.detectedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedAnomaly(a)}
                        className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-sky-400 hover:bg-slate-700 hover:text-sky-300"
                      >
                        {isBn ? 'পর্যালোচনা' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Resolution Modal */}
      {selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          locale={locale}
          onClose={() => setSelectedAnomaly(null)}
          onUpdateStatus={handleUpdateStatus}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  )
}

