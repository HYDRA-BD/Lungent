import React from 'react'
import {
  HeartPulse,
  User,
  Activity,
  ClipboardList,
  History,
  ShieldCheck,
  Calendar,
  FileDown,
  Bell,
  Shield,
  Settings,
} from 'lucide-react'
import type { TranslationKeys } from '@/i18n'
import type { NavItem } from './dashboard-layout'

export function getPatientNav(
  dict: TranslationKeys,
  currentPath: string,
  unreadNotificationsCount: number = 0
): NavItem[] {
  const t = dict.patientPortal.nav

  return [
    {
      label: t.dashboard,
      href: '/patient',
      icon: <HeartPulse className="size-4" />,
    },
    {
      label: t.profile,
      href: '/patient/profile',
      icon: <User className="size-4" />,
    },
    {
      label: t.healthRecord,
      href: '/patient/health-record',
      icon: <Activity className="size-4" />,
    },
    {
      label: t.assessments,
      href: '/patient/assessments',
      icon: <ClipboardList className="size-4" />,
    },
    {
      label: t.assessmentHistory,
      href: '/patient/assessments/history',
      icon: <History className="size-4" />,
    },
    {
      label: t.screening,
      href: '/patient/screening',
      icon: <ShieldCheck className="size-4" />,
    },
    {
      label: t.referrals,
      href: '/patient/referrals',
      icon: <Calendar className="size-4" />,
    },
    {
      label: t.documents,
      href: '/patient/documents',
      icon: <FileDown className="size-4" />,
    },
    {
      label: t.notifications,
      href: '/patient/notifications',
      icon: <Bell className="size-4" />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeVariant: 'destructive',
    },
    {
      label: t.privacy,
      href: '/patient/privacy',
      icon: <Shield className="size-4" />,
    },
    {
      label: t.settings,
      href: '/patient/settings',
      icon: <Settings className="size-4" />,
    },
  ]
}
