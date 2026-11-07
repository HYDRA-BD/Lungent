import React from 'react'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Activity,
  History,
  FileCheck2,
  Share2,
  Bell,
  FileText,
  BarChart3,
} from 'lucide-react'
import type { NavItem } from '@/components/layouts/dashboard-layout'

export function getHealthcareWorkerNav(
  isBn: boolean,
  counts?: { incomplete?: number; tasks?: number; referrals?: number; notifications?: number }
): NavItem[] {
  return [
    {
      label: isBn ? 'অপারেশনাল ড্যাশবোর্ড' : 'Operational Dashboard',
      href: '/healthcare-worker',
      icon: React.createElement(LayoutDashboard, { className: 'size-4' }),
    },
    {
      label: isBn ? 'রোগী ডিরেক্টরি' : 'Patient Directory',
      href: '/healthcare-worker/patients',
      icon: React.createElement(Users, { className: 'size-4' }),
    },
    {
      label: isBn ? 'রেফারেল ও ফলো-আপ' : 'Referrals & Follow-ups',
      href: '/healthcare-worker/referrals',
      icon: React.createElement(Share2, { className: 'size-4' }),
      badge: counts?.referrals && counts.referrals > 0 ? counts.referrals : undefined,
    },
    {
      label: isBn ? 'নোটিফিকেশন' : 'Notifications',
      href: '/healthcare-worker/notifications',
      icon: React.createElement(Bell, { className: 'size-4' }),
      badge: counts?.notifications && counts.notifications > 0 ? counts.notifications : undefined,
    },
    {
      label: isBn ? 'তথ্য সম্পূর্ণকরণ সারি' : 'Completion Queue',
      href: '/healthcare-worker/completion-queue',
      icon: React.createElement(FileCheck2, { className: 'size-4' }),
      badge: counts?.incomplete && counts.incomplete > 0 ? counts.incomplete : undefined,
      badgeVariant: 'warning',
    },
    {
      label: isBn ? 'মূল্যায়ন ওয়ার্কফ্লো' : 'Assessment Workflows',
      href: '/healthcare-worker/assessments',
      icon: React.createElement(Activity, { className: 'size-4' }),
    },
    {
      label: isBn ? 'অপারেশনাল টাস্ক' : 'Operational Tasks',
      href: '/healthcare-worker/tasks',
      icon: React.createElement(CheckSquare, { className: 'size-4' }),
      badge: counts?.tasks && counts.tasks > 0 ? counts.tasks : undefined,
    },
    {
      label: isBn ? 'ফিল্ড রিপোর্টস' : 'Field Reports',
      href: '/healthcare-worker/reports',
      icon: React.createElement(FileText, { className: 'size-4' }),
    },
    {
      label: isBn ? 'ফিল্ড অ্যানালিটিক্স' : 'Outreach Analytics',
      href: '/healthcare-worker/analytics',
      icon: React.createElement(BarChart3, { className: 'size-4' }),
    },
    {
      label: isBn ? 'ফিল্ড অ্যাক্টিভিটি' : 'Field Activity Stream',
      href: '/healthcare-worker/activity',
      icon: React.createElement(History, { className: 'size-4' }),
    },
  ]
}
