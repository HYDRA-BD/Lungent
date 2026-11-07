'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  CheckSquare,
  PlusCircle,
  Calendar,
  CheckCircle2,
  User,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import { FacilityContextSwitcher } from '@/modules/healthcare-worker/components/facility-context-switcher'
import { CreateTaskModal } from '@/modules/healthcare-worker/components/create-task-modal'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { updateWorkerTaskStatusAction } from '@/modules/healthcare-worker/actions'
import type { WorkerOperationalTask } from '@/modules/healthcare-worker/types'
import type { PatientOption } from '@/modules/healthcare-worker/components/initiate-assessment-modal'
import type { Facility } from '@/modules/facilities/types'

interface WorkerTasksClientProps {
  initialTasks: WorkerOperationalTask[]
  patients: PatientOption[]
  facilities: Facility[]
  activeFacilityId: string
}

export function WorkerTasksClient({
  initialTasks,
  patients,
  facilities,
  activeFacilityId: defaultFacilityId,
}: WorkerTasksClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [activeFacilityId, setActiveFacilityId] = useState(defaultFacilityId)
  const [tasks, setTasks] = useState(initialTasks)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length
  const navItems = getHealthcareWorkerNav(isBn, { tasks: pendingCount })

  const handleToggleStatus = async (task: WorkerOperationalTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )
    await updateWorkerTaskStatusAction(task.id, newStatus)
  }

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Healthcare Worker Workspace'}
      workspaceBadge={
        <FacilityContextSwitcher
          activeFacilityId={activeFacilityId}
          facilities={facilities}
          onFacilitySwitched={(newId) => setActiveFacilityId(newId)}
        />
      }
      userName="Tania Akhter"
      userRole={isBn ? 'কমিউনিটি স্বাস্থ্য বিশেষজ্ঞ (CHW)' : 'Community Health Specialist (CHW)'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'অপারেশনাল টাস্ক ও ফিল্ড অগ্রাধিকার' : 'Operational Tasks & Field Priorities'}
          description={
            isBn
              ? 'ফিল্ড ভিজিট, রোগী তথ্য সংগ্রহ, স্ক্রিনিং তাগিদ ও রেফারেল যাচাইকরণের কাজ পরিচালনা করুন।'
              : 'Organize and track field visits, intake collections, screening reminders, and follow-ups.'
          }
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusCircle className="size-4" />}
            >
              {isBn ? 'নতুন টাস্ক তৈরি করুন' : 'Create Task'}
            </Button>
          }
        />

        {/* Filter Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s === 'all'
                  ? isBn
                    ? 'সকল টাস্ক'
                    : 'All'
                  : s === 'pending'
                  ? isBn
                    ? 'অমীমাংসিত'
                    : 'Pending'
                  : s === 'in_progress'
                  ? isBn
                    ? 'চলমান'
                    : 'In Progress'
                  : isBn
                  ? 'সম্পন্ন'
                  : 'Completed'}
              </button>
            ))}
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{isBn ? 'অগ্রাধিকার:' : 'Priority:'}</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">{isBn ? 'সকল অগ্রাধিকার' : 'All Priorities'}</option>
              <option value="urgent">{isBn ? 'অতি-জরুরি (Urgent)' : 'Urgent'}</option>
              <option value="high">{isBn ? 'উচ্চ (High)' : 'High'}</option>
              <option value="normal">{isBn ? 'নিয়মিত (Normal)' : 'Normal'}</option>
              <option value="low">{isBn ? 'সাধারণ (Low)' : 'Low'}</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isDone = task.status === 'completed'
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-muted/20 border-border/40 text-muted-foreground'
                      : 'bg-card border-border hover:border-primary/40 shadow-xs text-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      className="mt-0.5 rounded text-muted-foreground hover:text-primary transition-colors"
                      aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="size-5 rounded-md border border-border" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </span>
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
                        <Badge variant="secondary" size="sm" className="capitalize">
                          {task.taskType.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-muted-foreground">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {isBn ? 'মেয়াদ:' : 'Due:'} {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.patientId && (
                          <Link
                            href={`/healthcare-worker/patients/${task.patientId}`}
                            className="text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            <User className="size-3" />
                            {isBn ? 'রোগী প্রোফাইল খুলুন' : 'Open Linked Patient'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-2">
              <CheckSquare className="size-10 text-muted-foreground/60 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">
                {isBn ? 'কোনো টাস্ক পাওয়া যায়নি' : 'No operational tasks match this filter'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'ফিল্টারের শর্ত পরিবর্তন করুন অথবা নতুন টাস্ক যোগ করুন।'
                  : 'Adjust filters or create a new field task to track.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        activeFacilityId={activeFacilityId}
        onSuccess={() => {
          // Revalidated
        }}
      />
    </DashboardLayout>
  )
}
