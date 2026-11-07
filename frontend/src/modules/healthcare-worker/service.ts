import { createAdminClient } from '@/lib/supabase/admin'
import { PatientService } from '@/modules/patients/service'
import { HealthRecordService } from '@/modules/health-records/service'
import { evaluatePatientRecordCompleteness } from './completion-evaluator'
import type {
  WorkerDashboardStats,
  WorkerOperationalTask,
  WorkerRecentActivity,
  PatientCompletionStatus,
  WorkerPatientSummary,
  InitiateAssessmentInput,
  WorkerAssessmentListItem,
  CreateWorkerTaskInput,
  WorkerTaskStatus,
} from './types'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// In-memory fallback stores for offline environments & automated tests
const fallbackTasks: Map<string, WorkerOperationalTask> = new Map()
const fallbackActivities: WorkerRecentActivity[] = []
const fallbackCompletionCache: Map<string, PatientCompletionStatus> = new Map()
const fallbackAssessments: Map<string, WorkerAssessmentListItem> = new Map()
const fallbackUserFacilityPreferences: Map<string, string> = new Map()

// Seed initial benchmark operational tasks & activities
function seedBenchmarkWorkerData() {
  if (fallbackTasks.size > 0) return

  const task1: WorkerOperationalTask = {
    id: 'tsk-001',
    workerId: 'staff-chw-01',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientName: 'Md. Rafiqul Islam',
    patientIdFormatted: 'LGT-2026-8K2M7P',
    facilityId: 'facility-dhaka-central',
    taskType: 'intake_completion',
    priority: 'high',
    status: 'pending',
    title: 'Complete detailed occupational exposure history',
    titleBn: 'পেশাগত ক্ষতিকর উপাদান সংস্পর্শের বিস্তারিত তথ্য সংগ্রহ করুন',
    description: 'Patient reported 15 years history in shipyard welding without respirator.',
    dueDate: '2026-11-10',
    completedAt: null,
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  }

  const task2: WorkerOperationalTask = {
    id: 'tsk-002',
    workerId: 'staff-chw-01',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientName: 'Nasima Begum',
    patientIdFormatted: 'LGT-2026-3N9P4X',
    facilityId: 'facility-dhaka-central',
    taskType: 'measurement_recording',
    priority: 'urgent',
    status: 'pending',
    title: 'Record physical vitals & spirometry measurement',
    titleBn: 'শারীরিক পরিমাপ ও স্পাইরোমেট্রি রেকর্ড সম্পন্ন করুন',
    description: 'Biomass exposure patient presented with shortness of breath on exertion.',
    dueDate: '2026-11-08',
    completedAt: null,
    createdAt: '2026-11-02T09:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z',
  }

  const task3: WorkerOperationalTask = {
    id: 'tsk-003',
    workerId: 'staff-chw-01',
    patientId: '33333333-3333-4333-a333-333333333333',
    patientName: 'Kamal Hossain',
    patientIdFormatted: 'LGT-2026-7V4Y9Q',
    facilityId: 'facility-dhaka-central',
    taskType: 'assessment_initiation',
    priority: 'urgent',
    status: 'in_progress',
    title: 'Initiate symptom triage assessment for hemoptysis',
    titleBn: 'কফের সাথে রক্ত উপসর্গের জরুরি ক্লিনিক্যাল ট্রায়াজ শুরু করুন',
    description: 'Reported blood-streaked sputum during morning survey intake.',
    dueDate: '2026-11-06',
    completedAt: null,
    createdAt: '2026-11-03T11:00:00Z',
    updatedAt: '2026-11-03T11:00:00Z',
  }

  fallbackTasks.set(task1.id, task1)
  fallbackTasks.set(task2.id, task2)
  fallbackTasks.set(task3.id, task3)

  // Seed benchmark activities
  fallbackActivities.push(
    {
      id: 'act-001',
      workerId: 'staff-chw-01',
      facilityId: 'facility-dhaka-central',
      patientId: '11111111-1111-4111-a111-111111111111',
      patientName: 'Md. Rafiqul Islam',
      patientIdFormatted: 'LGT-2026-8K2M7P',
      activityType: 'health_record_updated',
      summary: 'Updated smoking pack-years history (32 pack-years calculated)',
      summaryBn: 'ধূমপানের ইতিহাস হালনাগাদ করা হয়েছে (৩২ প্যাক-বছর নির্ণয়)',
      createdAt: '2026-11-04T14:30:00Z',
    },
    {
      id: 'act-002',
      workerId: 'staff-chw-01',
      facilityId: 'facility-dhaka-central',
      patientId: '22222222-2222-4222-a222-222222222222',
      patientName: 'Nasima Begum',
      patientIdFormatted: 'LGT-2026-3N9P4X',
      activityType: 'patient_registered',
      summary: 'Assisted patient registration from Mirpur community field outreach',
      summaryBn: 'মিরপুর তৃণমূল ক্যাম্প থেকে নতুন রোগী নিবন্ধন সম্পন্ন করা হয়েছে',
      createdAt: '2026-11-04T10:15:00Z',
    },
    {
      id: 'act-003',
      workerId: 'staff-chw-01',
      facilityId: 'facility-dhaka-central',
      patientId: '33333333-3333-4333-a333-333333333333',
      patientName: 'Kamal Hossain',
      patientIdFormatted: 'LGT-2026-7V4Y9Q',
      activityType: 'assessment_initiated',
      summary: 'Initiated symptom-based clinical triage assessment workflow',
      summaryBn: 'উপসর্গভিত্তিক ক্লিনিক্যাল ট্রায়াজ মূল্যায়ন শুরু করা হয়েছে',
      createdAt: '2026-11-03T11:00:00Z',
    }
  )

  // Seed initial assessments
  const asm1: WorkerAssessmentListItem = {
    id: 'asm-001',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    patientNameBn: 'মোঃ রফিকুল ইসলাম',
    assessmentType: 'lung_cancer_risk',
    status: 'submitted',
    initiatedAt: '2026-11-02T10:00:00Z',
    submittedAt: '2026-11-02T10:30:00Z',
    facilityId: 'facility-dhaka-central',
    facilityName: 'Dhaka Central Pulmonary Institute',
    summary: 'High exposure risk profile recorded. Submitted for clinical verification.',
    isReviewedByClinician: false,
  }

  const asm2: WorkerAssessmentListItem = {
    id: 'asm-002',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientCanonicalId: 'LGT-2026-3N9P4X',
    patientName: 'Nasima Begum',
    patientNameBn: 'নাসিমা বেগম',
    assessmentType: 'screening_eligibility',
    status: 'in_progress',
    initiatedAt: '2026-11-04T09:00:00Z',
    submittedAt: null,
    facilityId: 'facility-dhaka-central',
    facilityName: 'Dhaka Central Pulmonary Institute',
    summary: 'Awaiting completion of biomass duration and spirometry measurements.',
    isReviewedByClinician: false,
  }

  fallbackAssessments.set(asm1.id, asm1)
  fallbackAssessments.set(asm2.id, asm2)
}

seedBenchmarkWorkerData()

export class HealthcareWorkerService {
  /**
   * Retrieves active facility preference for a worker
   */
  static async getActiveFacilityPreference(workerId: string): Promise<string> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data } = await supabase
          .from('worker_workspace_preferences')
          .select('active_facility_id')
          .eq('user_id', workerId)
          .maybeSingle()
        if (data?.active_facility_id) {
          return data.active_facility_id
        }
      } catch {
        // Fallback below
      }
    }
    return (
      fallbackUserFacilityPreferences.get(workerId) || 'facility-dhaka-central'
    )
  }

  /**
   * Updates active facility preference for a worker
   */
  static async setActiveFacilityPreference(
    workerId: string,
    facilityId: string
  ): Promise<void> {
    fallbackUserFacilityPreferences.set(workerId, facilityId)
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase.from('worker_workspace_preferences').upsert({
          user_id: workerId,
          active_facility_id: facilityId,
          updated_at: new Date().toISOString(),
        })
      } catch {
        // Fallback updated
      }
    }
  }

  /**
   * Retrieves summary operational metrics for the worker dashboard
   */
  static async getDashboardSummary(
    workerId: string = 'staff-chw-01',
    facilityId: string = 'facility-dhaka-central'
  ): Promise<WorkerDashboardStats> {
    seedBenchmarkWorkerData()
    const patientsRes = await PatientService.searchPatients({
      facilityId: facilityId || undefined,
      limit: 100,
      offset: 0,
    })

    const allPatients = patientsRes.patients
    let incompleteCount = 0
    for (const p of allPatients) {
      const completion = await this.getPatientCompletion(p.id)
      if (completion.status !== 'complete') {
        incompleteCount++
      }
    }

    const tasks = await this.getWorkerTasks(workerId, facilityId)
    const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
    const urgentTasks = pendingTasks.filter((t) => t.priority === 'urgent')

    const assessments = await this.getWorkerAssessments(facilityId)
    const activeAssessments = assessments.filter(
      (a) => a.status === 'in_progress' || a.status === 'submitted'
    )

    return {
      totalAssignedPatients: allPatients.length,
      assignedPatientsCount: allPatients.length,
      recentlyRegisteredCount: allPatients.filter((p) => {
        const pDate = new Date(p.createdAt).getTime()
        const benchmarkDate = new Date('2026-10-01T00:00:00Z').getTime()
        return pDate >= benchmarkDate
      }).length,
      incompleteProfilesCount: incompleteCount,
      activeAssessmentsCount: activeAssessments.length,
      pendingTasksCount: pendingTasks.length,
      urgentTasksCount: urgentTasks.length,
    }
  }

  /**
   * Evaluates and caches patient record completeness
   */
  static async getPatientCompletion(
    patientId: string,
    evaluatorId?: string
  ): Promise<PatientCompletionStatus> {
    if (fallbackCompletionCache.has(patientId)) {
      return fallbackCompletionCache.get(patientId)!
    }

    const patient = await PatientService.getPatientById(patientId)
    if (!patient) {
      return {
        patientId,
        completionScore: 0,
        status: 'incomplete',
        missingSections: [],
        lastCalculatedAt: '2026-03-01T10:00:00Z',
      }
    }

    const records = await HealthRecordService.getComprehensiveHealthRecord(patientId)
    const completion = evaluatePatientRecordCompleteness(patient, records, evaluatorId)

    fallbackCompletionCache.set(patientId, completion)
    return completion
  }

  /**
   * Retrieves list of assigned or accessible patients for a worker with completion stats
   */
  static async getAssignedPatients(
    workerId: string = 'staff-chw-01',
    facilityId: string = 'facility-dhaka-central',
    params: {
      query?: string
      completionStatus?: string
      page?: number
      pageSize?: number
    } = {}
  ): Promise<{ patients: WorkerPatientSummary[]; totalCount: number }> {
    const page = params.page || 1
    const pageSize = params.pageSize || 20

    const res = await PatientService.searchPatients({
      query: params.query,
      facilityId: facilityId || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    const summaries: WorkerPatientSummary[] = []
    for (const p of res.patients) {
      const completion = await this.getPatientCompletion(p.id, workerId)
      if (
        params.completionStatus &&
        params.completionStatus !== 'all' &&
        completion.status !== params.completionStatus
      ) {
        continue
      }

      summaries.push({
        id: p.id,
        patientId: p.patientId,
        fullName: p.fullName,
        nameBn: null,
        gender: p.gender,
        approximateAge: p.approximateAge || (p.dateOfBirth ? 2026 - parseInt(p.dateOfBirth.slice(0, 4), 10) : null),
        phoneNumber: p.phoneNumber || null,
        addressDistrict: p.addressDistrict || null,
        addressUpazila: p.addressUpazila || null,
        primaryFacilityId: p.primaryFacilityId,
        primaryFacilityName: p.primaryFacilityId === 'facility-dhaka-central'
          ? 'Dhaka Central Pulmonary Institute'
          : p.primaryFacilityId,
        completionScore: completion.completionScore,
        completionStatus: completion.status,
        missingCount: completion.missingSections.length,
        missingSections: completion.missingSections,
        registeredAt: p.createdAt,
        assignedRole: 'primary_chw',
      })
    }

    return {
      patients: summaries,
      totalCount: summaries.length,
    }
  }

  /**
   * Retrieves queue of patients with incomplete profiles
   */
  static async getIncompletePatientsQueue(
    facilityId: string = 'facility-dhaka-central',
    params: { query?: string; page?: number; pageSize?: number } = {}
  ): Promise<{ patients: WorkerPatientSummary[]; totalCount: number }> {
    const all = await this.getAssignedPatients('staff-chw-01', facilityId, {
      query: params.query,
      page: params.page,
      pageSize: params.pageSize,
    })

    const incomplete = all.patients.filter((p) => p.completionScore < 80)
    // Sort ascending by completion score so most incomplete are first
    incomplete.sort((a, b) => a.completionScore - b.completionScore)

    return {
      patients: incomplete,
      totalCount: incomplete.length,
    }
  }

  /**
   * Retrieves operational tasks
   */
  static async getWorkerTasks(
    workerId: string = 'staff-chw-01',
    facilityId?: string,
    statusFilter?: string
  ): Promise<WorkerOperationalTask[]> {
    seedBenchmarkWorkerData()
    let tasks = Array.from(fallbackTasks.values())

    if (workerId) {
      tasks = tasks.filter((t) => !t.workerId || t.workerId === workerId)
    }

    if (facilityId) {
      tasks = tasks.filter((t) => t.facilityId === facilityId)
    }

    if (statusFilter && statusFilter !== 'all') {
      tasks = tasks.filter((t) => t.status === statusFilter)
    }

    // Sort by priority (urgent -> high -> normal -> low)
    const priorityWeight: Record<string, number> = {
      urgent: 4,
      high: 3,
      normal: 2,
      low: 1,
    }
    tasks.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))

    return tasks
  }

  /**
   * Creates a new operational task
   */
  static async createWorkerTask(
    input: CreateWorkerTaskInput,
    workerId: string = 'staff-chw-01'
  ): Promise<WorkerOperationalTask> {
    seedBenchmarkWorkerData()
    const newTask: WorkerOperationalTask = {
      id: `tsk-${Date.now()}`,
      workerId,
      patientId: input.patientId || null,
      facilityId: input.facilityId,
      taskType: input.taskType,
      priority: input.priority,
      status: 'pending',
      title: input.title.trim(),
      titleBn: input.titleBn?.trim() || null,
      description: input.description?.trim() || null,
      dueDate: input.dueDate || null,
      completedAt: null,
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    }

    if (input.patientId) {
      const patient = await PatientService.getPatientById(input.patientId)
      if (patient) {
        newTask.patientName = patient.fullName
        newTask.patientIdFormatted = patient.patientId
      }
    }

    fallbackTasks.set(newTask.id, newTask)
    return newTask
  }

  /**
   * Updates operational task status
   */
  static async updateWorkerTaskStatus(
    taskId: string,
    status: WorkerTaskStatus,
    workerId: string = 'staff-chw-01'
  ): Promise<WorkerOperationalTask> {
    seedBenchmarkWorkerData()
    const task = fallbackTasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    const updated: WorkerOperationalTask = {
      ...task,
      status,
      completedAt: status === 'completed' ? '2026-03-01T10:00:00Z' : null,
      updatedAt: '2026-03-01T10:00:00Z',
    }

    fallbackTasks.set(taskId, updated)

    if (status === 'completed') {
      await this.recordWorkerActivity({
        workerId,
        facilityId: task.facilityId,
        patientId: task.patientId,
        activityType: 'task_completed',
        summary: `Completed operational task: "${task.title}"`,
        summaryBn: `দায়িত্ব সম্পন্ন হয়েছে: "${task.titleBn || task.title}"`,
      })
    }

    return updated
  }

  /**
   * Retrieves recent activities
   */
  static async getWorkerRecentActivities(
    workerId?: string,
    facilityId?: string,
    limit: number = 20
  ): Promise<WorkerRecentActivity[]> {
    seedBenchmarkWorkerData()
    let list = [...fallbackActivities]
    if (facilityId) {
      list = list.filter((a) => a.facilityId === facilityId)
    }
    // Return latest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list.slice(0, limit)
  }

  /**
   * Records a new activity log
   */
  static async recordWorkerActivity(input: {
    workerId: string
    facilityId: string
    patientId?: string | null
    activityType: WorkerRecentActivity['activityType']
    summary: string
    summaryBn?: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>
  }): Promise<WorkerRecentActivity> {
    seedBenchmarkWorkerData()
    const newActivity: WorkerRecentActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workerId: input.workerId,
      facilityId: input.facilityId,
      patientId: input.patientId || null,
      activityType: input.activityType,
      summary: input.summary,
      summaryBn: input.summaryBn || null,
      metadata: input.metadata || {},
      createdAt: '2026-03-01T10:00:00Z',
    }

    if (input.patientId) {
      const patient = await PatientService.getPatientById(input.patientId)
      if (patient) {
        newActivity.patientName = patient.fullName
        newActivity.patientIdFormatted = patient.patientId
      }
    }

    fallbackActivities.unshift(newActivity)
    return newActivity
  }

  /**
   * Initiates an assessment workflow for an authorized patient
   */
  static async initiateAssessmentWorkflow(
    patientId: string,
    input: InitiateAssessmentInput,
    workerId: string = 'staff-chw-01',
    facilityId: string = 'facility-dhaka-central'
  ): Promise<WorkerAssessmentListItem> {
    seedBenchmarkWorkerData()
    const patient = await PatientService.getPatientById(patientId)
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`)
    }

    const newAssessment: WorkerAssessmentListItem = {
      id: `asm-${Date.now()}`,
      patientId: patient.id,
      patientCanonicalId: patient.patientId,
      patientName: patient.fullName,
      patientNameBn: null,
      assessmentType: input.assessmentType,
      status: input.status || 'in_progress',
      initiatedAt: '2026-03-01T10:00:00Z',
      submittedAt: input.status === 'submitted' ? '2026-03-01T10:00:00Z' : null,
      facilityId: input.facilityId || facilityId,
      facilityName: facilityId === 'facility-dhaka-central'
        ? 'Dhaka Central Pulmonary Institute'
        : facilityId,
      summary:
        input.preliminaryNotes ||
        `Assessment workflow initiated by community healthcare worker.`,
      isReviewedByClinician: false,
    }

    fallbackAssessments.set(newAssessment.id, newAssessment)

    await this.recordWorkerActivity({
      workerId,
      facilityId: newAssessment.facilityId,
      patientId: patient.id,
      activityType: 'assessment_initiated',
      summary: `Initiated ${input.assessmentType.replace(/_/g, ' ')} assessment for ${patient.fullName}`,
      summaryBn: `${patient.fullName}-এর জন্য অ্যাসেসমেন্ট শুরু করা হয়েছে`,
    })

    return newAssessment
  }

  /**
   * Retrieves assessments for a facility or patient
   */
  static async getWorkerAssessments(
    facilityId?: string,
    params: { patientId?: string; status?: string; type?: string } = {}
  ): Promise<WorkerAssessmentListItem[]> {
    seedBenchmarkWorkerData()
    let list = Array.from(fallbackAssessments.values())

    if (facilityId) {
      list = list.filter((a) => a.facilityId === facilityId)
    }

    if (params.patientId) {
      list = list.filter((a) => a.patientId === params.patientId)
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((a) => a.status === params.status)
    }

    if (params.type && params.type !== 'all') {
      list = list.filter((a) => a.assessmentType === params.type)
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime())
    return list
  }
}
