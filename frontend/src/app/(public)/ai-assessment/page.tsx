import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AIAssessmentClient } from './ai-assessment-client'

export const metadata: Metadata = {
  title: 'AI Risk Assessment | Lungent',
  description: 'Clinical AI-powered lung cancer risk stratification using our research-grade 9-model ensemble.',
}

export default function AIAssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading AI Assessment Engine...</div>}>
      <AIAssessmentClient />
    </Suspense>
  )
}
