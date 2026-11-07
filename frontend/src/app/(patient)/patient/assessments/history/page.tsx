import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { getPatientNav } from '@/components/layouts/patient-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { en } from '@/i18n/translations/en'

export const instant = false

export const metadata: Metadata = {
  title: 'Assessment History | Lungent Patient Portal',
  description: 'Chronological archive of all historical lung health assessment sessions and reports.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientAssessmentHistoryPage() {
  const patientId = DEFAULT_PATIENT_ID

  const [patient, assessments] = await Promise.all([
    PatientPortalService.getPatientProfile(patientId),
    PatientPortalService.getAssessments(patientId),
  ])

  const patientNav = getPatientNav(en, '/patient/assessments/history')

  return (
    <DashboardLayout
      workspaceName="Patient Health Portal"
      workspaceBadge={<Badge variant="outline" className="text-primary border-primary/30 text-xs">{patient.patientId}</Badge>}
      userName={patient.fullName}
      userRole="Registered Patient"
      navItems={patientNav}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title="Chronological Assessment History"
          description="Complete historical record of all lung cancer risk assessments, screening checks, and clinical intakes."
          actions={
            <Link
              href="/patient/assessments"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-xs' })}
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              <span>Back to Assessments</span>
            </Link>
          }
        />

        {assessments.length > 0 ? (
          <div className="space-y-3">
            {assessments.map((item) => (
              <Card key={item.id} className="border-border/80 shadow-xs">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground capitalize">
                        {item.assessmentType.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant={item.status === 'reviewed' ? 'default' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {item.status.replace(/_/g, ' ')}
                      </Badge>
                      {item.isReviewedByClinician && (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 text-[10px]">
                          <ShieldCheck className="size-2.5 mr-1" />
                          Clinician Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{item.summary}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>Initiated: {new Date(item.initiatedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Methodology: {item.methodologyVersion || 'v1.0'}</span>
                      {item.reviewingClinicianName && (
                        <>
                          <span>•</span>
                          <span>Reviewed by: {item.reviewingClinicianName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/patient/assessments/${item.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm', className: 'shrink-0 text-xs' })}
                  >
                    <span>View Result</span>
                    <ArrowRight className="size-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/80 text-center py-8 text-xs text-muted-foreground italic">
            No assessment history recorded.
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
