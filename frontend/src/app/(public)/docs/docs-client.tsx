'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  Brain,
  Code2,
  Database,
  ExternalLink,
  Layers,
  Network,
  Scale,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

type TabKey = 'overview' | 'ai-architecture' | 'guidelines' | 'mcp' | 'governance' | 'api'

export function DocsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <SectionContainer size="lg">
          {/* Top Breadcrumb & Title */}
          <div className="space-y-4 mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" /> Back to Platform Overview
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold">
                    System Architecture & Clinical Scope
                  </Badge>
                  <span className="text-xs text-muted-foreground">Version 2.0</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Lungent Platform Overview & Documentation
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Accessible clinical risk assessment, explainable AI pre-screening, evidence-based guideline retrieval, and secure health integrations.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/ai-assessment"
                  className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs' })}
                >
                  <Activity className="size-3.5 mr-1.5" />
                  Try Live Assessment
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
                >
                  <Terminal className="size-3.5 mr-1.5" />
                  API Documentation
                  <ExternalLink className="size-3 ml-1 opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/80 mb-8 scrollbar-none">
            {[
              { id: 'overview', label: 'Platform Overview', icon: Brain },
              { id: 'ai-architecture', label: 'AI Pre-Screening Engine', icon: Layers },
              { id: 'guidelines', label: 'Clinical Guidelines', icon: Database },
              { id: 'mcp', label: 'Model Context Protocol (MCP)', icon: Network },
              { id: 'governance', label: 'Safety & Governance', icon: Scale },
              { id: 'api', label: 'API Reference', icon: Code2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabKey)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Activity className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">The Access Challenge</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Over 70% of high-risk rural individuals never receive Low-Dose CT (LDCT) scans due to geographic, financial, or specialist shortages. Pre-screening helps prioritize who needs immediate referral.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                  <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-3">
                    <Brain className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Non-Invasive Triage</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluates non-invasive clinical profiles, ambient environmental data, and demographic risk factors to stratify patients into actionable clinical pathways (Refer, Review, Rule-Out).
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Privacy-First Design</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Transient processing where patient inputs are held only in memory during the session. Designed with strict zero-disk persistence for patient biometrics and support for local offline execution.
                  </p>
                </div>
              </div>

              {/* High-level system flow without exposing internal research algorithms */}
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" /> End-to-End Clinical Flow
                </h3>

                <div className="p-4 rounded-xl bg-muted/40 font-mono text-xs text-muted-foreground overflow-x-auto border border-border/60">
                  <pre className="leading-relaxed">
{`[Patient Intake / Questionnaire]
        │ (Age, Tobacco History, Comorbidities, Region)
        ▼
[Ambient Environmental Inhalation Context]
        │ (Longitudinal PM2.5 / Air Quality Data)
        ▼
[Machine Learning Risk Stratification Engine]
        │ (Ensemble Gradient-Boosted Classifiers + Probability Calibration)
        ▼
[Clinical Safety & Access Triage Gate]
        ├── Rule-Out (Low Risk, Routine Annual Monitoring)
        ├── Review   (Moderate / Borderline Risk, Shared Decision-Making)
        └── Refer    (High Risk, Fast-Track for Low-Dose CT Diagnostic Workup)
        │
   ┌────┴─────────────────────────────┐
   ▼                                   ▼
[Explainability (XAI Attribution)] [Evidence-Based Guideline Matching]
   │                                   │
   └─────────────┬─────────────────────┘
                 ▼
[Clinical Referral Summary & Signed PDF Report]`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AI Pre-Screening Engine */}
          {activeTab === 'ai-architecture' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Machine Learning Risk Stratification</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lungent employs a multi-model ensemble of calibrated gradient-boosted decision models trained on comprehensive public health surveillance datasets. The system addresses the extreme class rarity typical in preventive population screening.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Multi-Algorithm Ensemble</p>
                    <p className="text-[11px] text-muted-foreground">Combines multiple tree-based model architectures to capture complex non-linear interactions across smoking history and pulmonary conditions.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Probability Calibration</p>
                    <p className="text-[11px] text-muted-foreground">Uses post-hoc calibration to ensure predicted probabilities correspond accurately to real-world epidemiological risk tiers.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Feature Attribution (XAI)</p>
                    <p className="text-[11px] text-muted-foreground">Provides clinician-interpretable factor weights showing which risk components contributed most to the overall assessment.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <h4 className="text-sm font-bold text-foreground">Clinical Validation Strategy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Models undergo rigorous cross-validation and evaluation across diverse geographic cohorts to maintain robust generalization across different demographic, age, and exposure groups.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Guidelines */}
          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Evidence-Based Clinical Guidelines</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The application grounds automated triage recommendations in recognized preventive care recommendations, specifically the U.S. Preventive Services Task Force (USPSTF) lung cancer screening recommendations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1.5">
                    <p className="text-xs font-bold text-primary">Contextual Retrieval</p>
                    <p className="text-xs font-semibold text-foreground">Semantic Guideline Search</p>
                    <p className="text-[11px] text-muted-foreground">Enables rapid retrieval of relevant screening guidelines matched to the patient&apos;s specific age and smoking background.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1.5">
                    <p className="text-xs font-bold text-primary">Clinical Decision Support</p>
                    <p className="text-xs font-semibold text-foreground">Non-Diagnostic Guidance</p>
                    <p className="text-[11px] text-muted-foreground">Provides reference context for primary care doctors deciding whether to order diagnostic low-dose CT imaging.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: MCP Protocol */}
          {activeTab === 'mcp' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Model Context Protocol (MCP) Integration</h3>
                  <Badge variant="outline" className="text-xs">Standardized Agent Interface</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lungent implements a read-only Model Context Protocol (MCP) server, allowing authorized AI assistants and clinical decision support workflows to securely query the risk assessment engine.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      name: 'predict_lung_cancer_risk',
                      desc: 'Evaluates standardized patient parameters and returns risk tier, calibrated score, and interpretable contributing factors.',
                    },
                    {
                      name: 'search_uspstf_guidelines',
                      desc: 'Searches clinical preventive screening recommendations for relevant guidelines matching the patient profile.',
                    },
                    {
                      name: 'get_clinical_summary',
                      desc: 'Synthesizes an objective clinical summary statement grounded in the assessment results and guideline evidence.',
                    },
                  ].map((tool) => (
                    <div key={tool.name} className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center gap-2">
                        <Terminal className="size-3.5 text-primary" />
                        <code className="text-xs font-bold text-foreground">{tool.name}</code>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="size-4" /> Security Architecture
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    The MCP interface operates strictly in read-only mode with input validation and zero data persistence, ensuring clinical decision support tools cannot alter backend state or persist sensitive data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Governance & Safety */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Safety & Governance Principles</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Preventive AI systems must operate within clear clinical boundaries and guard against disparities in care delivery:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-xl border border-border bg-muted/30 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Equitable Sensitivity Safeguards</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ensures high screening sensitivity across all demographic subgroups. Cases with elevated uncertainty are prioritized for clinical review rather than prematurely cleared.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-muted/30 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Access-Aware Prioritization</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Accounts for follow-up barriers among individuals in underserved areas where delayed evaluation carries higher clinical risk.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Deterministic Clinical Guardrails</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI generation layers are constrained to reporting calibrated model scores. Language models cannot fabricate risk numbers or alter the computed triage tier.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: API Reference */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">REST API Endpoints</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The backend service exposes standard REST endpoints for clinical integration:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-border rounded-lg overflow-hidden">
                    <thead className="bg-muted font-semibold text-foreground">
                      <tr>
                        <th className="p-3">Method</th>
                        <th className="p-3">Endpoint</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground font-mono">
                      <tr>
                        <td className="p-3 text-emerald-600 font-bold">GET</td>
                        <td className="p-3">/health</td>
                        <td className="p-3 font-sans">Service health and readiness check</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-blue-600 font-bold">POST</td>
                        <td className="p-3">/api/predict</td>
                        <td className="p-3 font-sans">Patient risk stratification and factor attribution</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-blue-600 font-bold">POST</td>
                        <td className="p-3">/api/analyze</td>
                        <td className="p-3 font-sans">End-to-end evaluation including clinical summary</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-blue-600 font-bold">POST</td>
                        <td className="p-3">/api/report</td>
                        <td className="p-3 font-sans">Generates in-memory clinical report PDF</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-600 font-bold">GET</td>
                        <td className="p-3">/api/states</td>
                        <td className="p-3 font-sans">Regional air quality reference data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    Open Interactive API Documentation
                  </a>
                </div>
              </div>
            </div>
          )}
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
