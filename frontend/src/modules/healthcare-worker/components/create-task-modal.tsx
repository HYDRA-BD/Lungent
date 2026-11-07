'use client'

import React, { useState, useTransition } from 'react'
import { CheckSquare, AlertCircle, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/i18n'
import { createWorkerTaskAction } from '@/modules/healthcare-worker/actions'
import type { WorkerTaskType, WorkerTaskPriority } from '../types'
import type { PatientOption } from './initiate-assessment-modal'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  patients?: PatientOption[]
  activeFacilityId?: string
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  patients = [],
  activeFacilityId,
}: CreateTaskModalProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState<WorkerTaskType>('intake_completion')
  const [priority, setPriority] = useState<WorkerTaskPriority>('normal')
  const [patientId, setPatientId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg(isBn ? 'কাজের শিরোনাম লিখুন' : 'Task title is required')
      return
    }

    setErrorMsg(null)
    startTransition(async () => {
      const res = await createWorkerTaskAction({
        title: title.trim(),
        taskType,
        priority,
        patientId: patientId || undefined,
        facilityId: activeFacilityId || 'facility-dhaka-central',
        dueDate: dueDate || undefined,
        description: description.trim() || undefined,
      })

      if (res.success) {
        setTitle('')
        setDescription('')
        setDueDate('')
        setPatientId('')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        setErrorMsg(res.error || 'Failed to create task')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CheckSquare className="size-5" />
            </div>
            <div>
              <h3 id="create-task-title" className="text-base font-semibold text-foreground">
                {isBn ? 'নতুন অপারেশনাল টাস্ক তৈরি করুন' : 'Create Operational Task'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'ফিল্ড ভিজিট, তথ্য সংগ্রহ বা রোগী ফলো-আপ নির্ধারিত করুন' : 'Schedule field follow-ups, intakes, or referral checks'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isBn ? 'টাস্ক শিরোনাম *' : 'Task Title *'}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isBn ? 'যেমন: মোহাম্মদ রফিকের ধূমপানের ইতিহাস সম্পূর্ণ করুন' : 'e.g., Complete smoking history for Md. Rafiqul'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isBn ? 'কাজের ধরন' : 'Task Type'}
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as WorkerTaskType)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="intake_completion">{isBn ? 'তথ্য সম্পূর্ণকরণ' : 'Intake Completion'}</option>
                <option value="assessment_initiation">{isBn ? 'মূল্যায়ন শুরু' : 'Assessment Initiation'}</option>
                <option value="measurement_recording">{isBn ? 'শারীরিক পরিমাপ' : 'Measurement Recording'}</option>
                <option value="contact_verification">{isBn ? 'যোগাযোগ যাচাই' : 'Contact Verification'}</option>
                <option value="followup_call">{isBn ? 'ফলো-আপ কল' : 'Follow-up Call'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isBn ? 'অগ্রাধিকার' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkerTaskPriority)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="low">{isBn ? 'সাধারণ (Low)' : 'Low'}</option>
                <option value="normal">{isBn ? 'নিয়মিত (Normal)' : 'Normal'}</option>
                <option value="high">{isBn ? 'উচ্চ (High)' : 'High'}</option>
                <option value="urgent">{isBn ? 'অতি-জরুরি (Urgent)' : 'Urgent'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isBn ? 'সম্পৃক্ত রোগী (ঐচ্ছিক)' : 'Associated Patient (Optional)'}
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{isBn ? 'কোনো রোগী নির্দিষ্ট নেই' : 'None / General Facility Task'}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isBn ? 'শেষ সময়সীমা' : 'Due Date'}
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isBn ? 'বিবরণ ও ফিল্ড নোট' : 'Description & Field Notes'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isBn ? 'অতিরিক্ত দিকনির্দেশনা...' : 'Specific instructions or address context...'}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isPending}
              leftIcon={isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            >
              {isPending ? (isBn ? 'তৈরি হচ্ছে...' : 'Creating...') : (isBn ? 'টাস্ক যোগ করুন' : 'Create Task')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
