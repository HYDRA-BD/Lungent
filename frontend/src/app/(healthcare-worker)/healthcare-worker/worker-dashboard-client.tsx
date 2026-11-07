'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  UserPlus,
  Activity,
  FileCheck2,
  CheckSquare,
  Clock,
  ArrowRight,
  PlusCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useLanguage } from '@/i18n'
import { FacilityContextSwitcher } from '@/modules/healthcare-worker/components/facility-context-switcher'
import { CompletionStatusPill } from '@/modules/healthcare-worker/components/completion-status-pill'
import { InitiateAssessmentModal } from '@/modules/healthcare-worker/components/initiate-assessment-modal'
import { CreateTaskModal } from '@/modules/healthcare-worker/components/create-task-modal'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { updateWorkerTaskStatusAction } from '@/modules/healthcare-worker/actions'
import type {
  WorkerDashboardStats,
  WorkerOperationalTask,
  WorkerRecentActivity,
  PatientAssessmentWorkflowItem,
  WorkerPatientSummary,
} from '@/modules/healthcare-worker/types'
import type { Facility } from '@/modules/facilities/types'

interface WorkerDashboardClientProps {
  initialData: {
    activeFacility: string
    availableFacilities: Facility[]
    stats: WorkerDashboardStats
    recentPatients: WorkerPatientSummary[]
    tasks: WorkerOperationalTask[]
    activities: WorkerRecentActivity[]
    assessments: PatientAssessmentWorkflowItem[]
  }
}

export function WorkerDashboardClient({ initialData }: WorkerDashboardClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [activeFacilityId, setActiveFacilityId] = useState(initialData.activeFacility)
  const [stats] = useState(initialData.stats)
  const [tasks, setTasks] = useState(initialData.tasks)
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedPatientForAssessment, setSelectedPatientForAssessment] = useState<string | undefined>()

  const activeFacilityObj = initialData.availableFacilities.find(
    (f) => f.id === activeFacilityId
  ) || {
    id: activeFacilityId,
    name: 'Dhaka Central Community Clinic',
    nameBn: 'ঢাকা সেন্ট্রাল কমিউনিটি ক্লিনিক',
    facilityId: 'DH-001',
    division: 'Dhaka',
  }

  const handleToggleTask = async (task: WorkerOperationalTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )
    await updateWorkerTaskStatusAction(task.id, newStatus)
  }

  const navItems = getHealthcareWorkerNav(isBn, {
    incomplete: stats.incompleteProfilesCount,
    tasks: stats.pendingTasksCount,
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Healthcare Worker Workspace'}
      workspaceBadge={
        <FacilityContextSwitcher
          activeFacilityId={activeFacilityId}
          facilities={initialData.availableFacilities}
          onFacilitySwitched={(newId) => setActiveFacilityId(newId)}
        />
      }
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ (CHW)' : 'Community Health Specialist (CHW)'}
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title={isBn ? 'ফিল্ড অপারেশনাল ড্যাশবোর্ড' : 'Field Operational Dashboard'}
          description={
            isBn
              ? `বর্তমান কেন্দ্র: ${activeFacilityObj.nameBn || activeFacilityObj.name} (${activeFacilityObj.facilityId}) — রোগী নিবন্ধন, তথ্য সম্পূর্ণকরণ ও ক্লিনিকাল মূল্যায়ন তদারকি।`
              : `Current Facility: ${activeFacilityObj.name} (${activeFacilityObj.facilityId}) — Manage patient intake, completion queues, and clinical assessments.`
          }
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/healthcare-worker/patients/register">
                <Button variant="default" size="sm" leftIcon={<UserPlus className="size-4" />}>
                  {isBn ? 'নতুন রোগী নিবন্ধন' : 'Register Patient'}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPatientForAssessment(undefined)
                  setIsAssessmentModalOpen(true)
                }}
                leftIcon={<Activity className="size-4" />}
              >
                {isBn ? 'মূল্যায়ন শুরু করুন' : 'Start Assessment'}
              </Button>
            </div>
          }
        />

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title={isBn ? 'নির্ধারিত রোগী' : 'Assigned Patients'}
            value={stats.assignedPatientsCount.toString()}
            description={isBn ? 'আপনার দায়িত্বাধীন রোগী' : 'Under active care'}
          />
          <StatCard
            title={isBn ? 'সাম্প্রতিক নিবন্ধিত' : 'Recently Registered'}
            value={stats.recentlyRegisteredCount.toString()}
            trend={{ value: 'Active', direction: 'up', label: isBn ? 'এই সপ্তাহে' : 'this week' }}
          />
          <StatCard
            title={isBn ? 'অসম্পূর্ণ প্রোফাইল' : 'Incomplete Profiles'}
            value={stats.incompleteProfilesCount.toString()}
            badge={
              stats.incompleteProfilesCount > 0 ? (
                <Badge variant="warning" size="sm">
                  {isBn ? 'তথ্য প্রয়োজন' : 'Requires Info'}
                </Badge>
              ) : undefined
            }
          />
          <StatCard
            title={isBn ? 'চলমান মূল্যায়ন' : 'Active Assessments'}
            value={stats.activeAssessmentsCount.toString()}
            description={isBn ? 'ক্লিনিকাল পর্যালোচনার অপেক্ষায়' : 'In progress / triage'}
          />
          <StatCard
            title={isBn ? 'অমীমাংসিত কাজ' : 'Pending Tasks'}
            value={stats.pendingTasksCount.toString()}
            badge={
              stats.urgentTasksCount > 0 ? (
                <Badge variant="destructive" size="sm" dot>
                  {stats.urgentTasksCount} {isBn ? 'জরুরি' : 'Urgent'}
                </Badge>
              ) : undefined
            }
          />
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/healthcare-worker/patients/register"
            className="group flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <UserPlus className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {isBn ? 'নতুন রোগী নিবন্ধন' : 'Register Patient'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isBn ? 'আইডি ও তথ্য যাচাইকরণ' : 'Search-before-register'}
                </div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setSelectedPatientForAssessment(undefined)
              setIsAssessmentModalOpen(true)
            }}
            className="group flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all shadow-xs text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Activity className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {isBn ? 'ক্লিনিকাল মূল্যায়ন' : 'Start Assessment'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isBn ? 'ঝুঁকি ও স্ক্রিনিং ওয়ার্কফ্লো' : 'Risk & eligibility triage'}
                </div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <Link
            href="/healthcare-worker/completion-queue"
            className="group flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:border-amber-500/50 hover:bg-muted/50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <FileCheck2 className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {isBn ? 'তথ্য সম্পূর্ণকরণ সারি' : 'Completion Queue'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.incompleteProfilesCount} {isBn ? 'রোগীর তথ্য অপূর্ণ' : 'profiles pending'}
                </div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
          </Link>

          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="group flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:border-blue-500/50 hover:bg-muted/50 transition-all shadow-xs text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <CheckSquare className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {isBn ? 'নতুন টাস্ক যোগ করুন' : 'Add Field Task'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.pendingTasksCount} {isBn ? 'কাজ বাকি আছে' : 'pending tasks'}
                </div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </button>
        </div>

        {/* Main Workspace Split: Patients & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Recently Assigned / Registered Patients */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'সম্প্রতি নির্ধারিত ও নিবন্ধিত রোগী' : 'Recently Assigned & Registered Patients'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'রোগীর প্রোফাইল, স্বাস্থ্য তথ্য সম্পূর্ণতা এবং দ্রুত মূল্যায়ন অ্যাকশন'
                      : 'Patient identity, completeness score, and direct workflow shortcuts'}
                  </CardDescription>
                </div>
                <Link
                  href="/healthcare-worker/patients"
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {isBn ? 'সকল রোগী দেখুন' : 'View all'}
                  <ArrowRight className="size-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'রোগী আইডি ও নাম' : 'Patient'}</TableHead>
                      <TableHead>{isBn ? 'বয়স / লিঙ্গ' : 'Demographics'}</TableHead>
                      <TableHead>{isBn ? 'রেকর্ড সম্পূর্ণতা' : 'Completeness'}</TableHead>
                      <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialData.recentPatients.length > 0 ? (
                      initialData.recentPatients.map((patient) => {
                        const score = patient.completionScore
                        const level = patient.completionStatus

                        return (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="font-medium text-foreground">{patient.fullName}</div>
                              <div className="font-mono text-xs text-primary font-semibold">
                                {patient.patientId}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {patient.approximateAge ? `${patient.approximateAge} yrs` : 'Age N/A'} •{' '}
                              <span className="capitalize">{patient.gender || 'Unspecified'}</span>
                            </TableCell>
                            <TableCell>
                              <CompletionStatusPill
                                score={score}
                                status={level}
                                patientId={patient.id}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <Link href={`/healthcare-worker/patients/${patient.id}`}>
                                  <Button variant="ghost" size="xs">
                                    {isBn ? 'প্রোফাইল' : 'Profile'}
                                  </Button>
                                </Link>
                                <Link href={`/healthcare-worker/patients/${patient.id}/health-record`}>
                                  <Button variant="outline" size="xs">
                                    {isBn ? 'তথ্য' : 'Record'}
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    setSelectedPatientForAssessment(patient.id)
                                    setIsAssessmentModalOpen(true)
                                  }}
                                >
                                  {isBn ? 'মূল্যায়ন' : 'Assess'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                          {isBn ? 'এই স্বাস্থ্যকেন্দ্রে কোনো রোগী পাওয়া যায়নি।' : 'No patients registered under this facility.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Assessment Workflows in Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'সাম্প্রতিক মূল্যায়ন ওয়ার্কফ্লো' : 'Recent Assessment Workflows'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'ক্লিনিকাল সিদ্ধান্তের জন্য প্রেরিত চলমান ও পর্যালোচিত কেস'
                      : 'Initiated intakes submitted for clinical review and triage'}
                  </CardDescription>
                </div>
                <Link
                  href="/healthcare-worker/assessments"
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {isBn ? 'সকল মূল্যায়ন' : 'View all'}
                  <ArrowRight className="size-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'রোগী ও আইডি' : 'Patient'}</TableHead>
                      <TableHead>{isBn ? 'ক্যাটাগরি' : 'Type'}</TableHead>
                      <TableHead>{isBn ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      <TableHead className="text-right">{isBn ? 'তারিখ' : 'Date'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialData.assessments.length > 0 ? (
                      initialData.assessments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{a.patientName}</div>
                            <div className="font-mono text-xs text-muted-foreground">{a.patientCanonicalId}</div>
                          </TableCell>
                          <TableCell className="text-xs font-medium capitalize">
                            {a.assessmentType.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                a.status === 'reviewed'
                                  ? 'success'
                                  : a.status === 'awaiting_clinical_review'
                                  ? 'warning'
                                  : 'secondary'
                              }
                              size="sm"
                            >
                              {a.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(a.initiatedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                          {isBn ? 'কোনো মূল্যায়ন পাওয়া যায়নি।' : 'No assessments initiated yet.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1 Col): Operational Task Queue & Recent Activities */}
          <div className="space-y-6">
            {/* Operational Tasks Queue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'অপারেশনাল টাস্ক' : 'Operational Tasks'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsTaskModalOpen(true)}
                  leftIcon={<PlusCircle className="size-3.5" />}
                >
                  {isBn ? 'নতুন' : 'Add'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const isDone = task.status === 'completed'
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors ${
                          isDone
                            ? 'bg-muted/30 border-border/50 text-muted-foreground'
                            : 'bg-card border-border hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className="mt-0.5 rounded text-muted-foreground hover:text-primary transition-colors"
                          aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <div className="size-4 rounded-xs border border-border" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-semibold ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-muted-foreground truncate">
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge
                              variant={
                                task.priority === 'urgent'
                                  ? 'destructive'
                                  : task.priority === 'high'
                                  ? 'warning'
                                  : 'secondary'
                              }
                              size="sm"
                            >
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="size-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {isBn ? 'কোনো অমীমাংসিত টাস্ক নেই।' : 'No operational tasks pending.'}
                  </div>
                )}

                <div className="pt-2 text-center">
                  <Link
                    href="/healthcare-worker/tasks"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {isBn ? 'সকল টাস্ক পরিচালনা করুন →' : 'Manage all operational tasks →'}
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Field Activity Stream */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    {isBn ? 'ফিল্ড অ্যাক্টিভিটি স্ট্রিম' : 'Field Activity Stream'}
                  </CardTitle>
                </div>
                <Link
                  href="/healthcare-worker/activity"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {isBn ? 'সকল' : 'View all'}
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {initialData.activities.length > 0 ? (
                  initialData.activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs">
                      <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground font-medium">{act.summary}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(act.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {act.metadata?.actorName || 'CHW Tania'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {isBn ? 'কোনো সাম্প্রতিক কার্যক্রম নেই।' : 'No recent activities recorded.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Initiate Assessment Modal */}
      <InitiateAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        initialPatientId={selectedPatientForAssessment}
        patients={initialData.recentPatients}
        activeFacilityId={activeFacilityId}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        patients={initialData.recentPatients}
        activeFacilityId={activeFacilityId}
        onSuccess={() => {
          // Task created
        }}
      />
    </DashboardLayout>
  )
}
