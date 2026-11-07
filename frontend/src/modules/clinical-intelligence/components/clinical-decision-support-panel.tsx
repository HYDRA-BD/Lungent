'use client'

/**
 * Phase 2.6: Clinical Decision Support (CDS) Contextual Panel
 */

import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react'
import type {
  ClinicalDecisionSupportInsight,
  ClinicalRecommendationAssistance,
  ClinicianActionStatus,
} from '../types'

export interface ClinicalDecisionSupportPanelProps {
  insights: ClinicalDecisionSupportInsight[]
  recommendations: ClinicalRecommendationAssistance[]
  locale?: 'en' | 'bn'
  onClinicianActionInsight?: (
    insightId: string,
    action: ClinicianActionStatus,
    notes?: string
  ) => Promise<void>
  onClinicianActionRecommendation?: (
    recId: string,
    action: ClinicianActionStatus,
    rationale?: string
  ) => Promise<void>
}

export function ClinicalDecisionSupportPanel({
  insights: initialInsights,
  recommendations: initialRecs,
  locale = 'en',
  onClinicianActionInsight,
  onClinicianActionRecommendation,
}: ClinicalDecisionSupportPanelProps) {
  const [insights, setInsights] = useState<ClinicalDecisionSupportInsight[]>(initialInsights)
  const [recommendations, setRecommendations] = useState<ClinicalRecommendationAssistance[]>(initialRecs)
  const [actionNotes] = useState<Record<string, string>>({})

  const isBn = locale === 'bn'

  const handleInsightAction = async (insightId: string, action: ClinicianActionStatus) => {
    if (onClinicianActionInsight) {
      await onClinicianActionInsight(insightId, action, actionNotes[insightId])
    }
    setInsights((prev) =>
      prev.map((i) =>
        i.id === insightId
          ? { ...i, clinicianActionStatus: action, clinicianActionNotes: actionNotes[insightId] ?? null }
          : i
      )
    )
  }

  const handleRecAction = async (recId: string, action: ClinicianActionStatus) => {
    if (onClinicianActionRecommendation) {
      await onClinicianActionRecommendation(recId, action, actionNotes[recId])
    }
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId
          ? { ...r, actionStatus: action, clinicianRationale: actionNotes[recId] ?? null }
          : r
      )
    )
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
      {/* Top Clinical Safety Notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="space-y-0.5">
          <span className="font-semibold">
            {isBn ? 'ক্লিনিকাল সিদ্ধান্ত সহায়তা নীতি:' : 'Clinical Decision Support Governance:'}
          </span>
          <p className="text-slate-300">
            {isBn
              ? 'লুঙ্গেন্ট স্বয়ংক্রিয় চিকিৎসা সিদ্ধান্ত গ্রহণ করে না। সকল তথ্য অনুমোদিত ক্লিনিকাল প্রমাণের উপর ভিত্তি করে উপস্থাপিত সিদ্ধান্ত সহায়তা মাত্র। অনুমোদিত চিকিৎসক রোগীর চূড়ান্ত চিকিৎসার দায়িত্ব বহন করেন।'
              : 'Lungent provides clinical decision support, NOT autonomous medical decision-making. Qualified healthcare professionals remain solely responsible for patient diagnosis, referral, and care.'}
          </p>
        </div>
      </div>

      {/* Decision-Support Insights Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100">
          {isBn ? 'ক্লিনিকাল অন্তর্দৃষ্টি ও ঝুঁকি সংকেত' : 'Contextual Clinical Insights & Evidence'}
        </h3>

        {insights.length === 0 ? (
          <p className="text-xs text-slate-500">
            {isBn ? 'এই মূল্যায়নের জন্য কোনো বিশেষ অন্তর্দৃষ্টি নেই।' : 'No contextual clinical insights generated.'}
          </p>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg border p-4 text-xs transition-colors ${
                insight.insightCategory === 'symptom_warning'
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : insight.insightCategory === 'screening_consideration'
                  ? 'border-sky-500/40 bg-sky-950/20'
                  : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      insight.insightCategory === 'symptom_warning'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-sky-500/20 text-sky-300'
                    }`}
                  >
                    {insight.insightCategory.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Provenance: {insight.provenanceType.replace('_', ' ')}
                  </span>
                </div>
                <span className="rounded-sm bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                  Status: {insight.clinicianActionStatus}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-slate-100">
                {isBn ? insight.titleBn : insight.titleEn}
              </h4>
              <p className="mt-1 text-slate-300">
                {isBn ? insight.explanationBn : insight.explanationEn}
              </p>

              <div className="mt-2 text-[11px] text-slate-400">
                <span className="font-medium text-slate-300">Justification: </span>
                {insight.clinicalJustification}
              </div>

              {/* Action Buttons */}
              {insight.clinicianActionStatus === 'pending' && (
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleInsightAction(insight.id, 'accepted')}
                    className="flex items-center gap-1 rounded-sm bg-emerald-600/80 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-500"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{isBn ? 'গৃহীত (Accept)' : 'Accept'}</span>
                  </button>
                  <button
                    onClick={() => handleInsightAction(insight.id, 'dismissed')}
                    className="flex items-center gap-1 rounded-sm bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>{isBn ? 'খারিজ (Dismiss)' : 'Dismiss'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Evidence-Based Recommendations Section */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <h3 className="text-sm font-bold text-slate-100">
          {isBn ? 'প্রমাণ-ভিত্তিক ক্লিনিকাল সুপারিশ সহায়তা' : 'Evidence-Based Recommendation Assistance'}
        </h3>

        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-500">
            {isBn ? 'কোনো সক্রিয় সুপারিশ নেই।' : 'No active recommendations generated.'}
          </p>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-4 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sky-400 font-semibold">{rec.recommendationCode}</span>
                <span className="rounded-sm bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-400">
                  {rec.evidenceStrength}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-100">
                {isBn ? rec.statementBn : rec.statementEn}
              </p>

              {rec.applicabilityConditions.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Conditions: </span>
                  {rec.applicabilityConditions.join('; ')}
                </div>
              )}

              {/* Clinician Action Review */}
              {rec.actionStatus === 'pending' ? (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleRecAction(rec.id, 'accepted')}
                    className="flex items-center gap-1 rounded-sm bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-500"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{isBn ? 'সম্মতি প্রদান' : 'Accept Recommendation'}</span>
                  </button>
                  <button
                    onClick={() => handleRecAction(rec.id, 'overridden')}
                    className="flex items-center gap-1 rounded-sm bg-amber-600/80 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-amber-500"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>{isBn ? 'ক্লিনিকাল ওভাররাইড' : 'Override with Note'}</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-sm bg-slate-800/50 p-2 text-[11px] text-slate-300">
                  <span className="font-semibold capitalize text-sky-400">{rec.actionStatus}: </span>
                  <span>{rec.clinicianRationale || 'Clinician documented action.'}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
