import React from 'react'
import {
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  CalendarCheck,
  History,
  Share2,
  Bell,
  FileText,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'
import type { NavItem } from '@/components/layouts/dashboard-layout'

export function getClinicalNav(
  isBn: boolean,
  counts?: { alerts?: number; pendingReviews?: number; followUps?: number; referrals?: number; notifications?: number }
): NavItem[] {
  return [
    {
      label: isBn ? 'ক্লিনিক্যাল ড্যাশবোর্ড' : 'Clinical Dashboard',
      href: '/clinical',
      icon: React.createElement(LayoutDashboard, { className: 'size-4' }),
    },
    {
      label: isBn ? 'রোগী ডিরেক্টরি' : 'Patient Directory',
      href: '/clinical/patients',
      icon: React.createElement(Users, { className: 'size-4' }),
    },
    {
      label: isBn ? 'স্পেশালিস্ট রেফারেল' : 'Specialist Referrals',
      href: '/clinical/referrals',
      icon: React.createElement(Share2, { className: 'size-4' }),
      badge: counts?.referrals && counts.referrals > 0 ? counts.referrals : undefined,
    },
    {
      label: isBn ? 'নোটিফিকেশন ও বার্তা' : 'Notifications',
      href: '/clinical/notifications',
      icon: React.createElement(Bell, { className: 'size-4' }),
      badge: counts?.notifications && counts.notifications > 0 ? counts.notifications : undefined,
    },
    {
      label: isBn ? 'অ্যাসেসমেন্ট পর্যালোচনা' : 'Assessment Reviews',
      href: '/clinical/assessments',
      icon: React.createElement(Activity, { className: 'size-4' }),
      badge: counts?.pendingReviews && counts.pendingReviews > 0 ? counts.pendingReviews : undefined,
      badgeVariant: 'warning',
    },
    {
      label: isBn ? 'ক্লিনিক্যাল সতর্কতা' : 'Clinical Alerts',
      href: '/clinical/alerts',
      icon: React.createElement(AlertTriangle, { className: 'size-4' }),
      badge: counts?.alerts && counts.alerts > 0 ? counts.alerts : undefined,
      badgeVariant: 'destructive',
    },
    {
      label: isBn ? 'ফলো-আপ পরিকল্পনা' : 'Follow-up Plans',
      href: '/clinical/follow-ups',
      icon: React.createElement(CalendarCheck, { className: 'size-4' }),
      badge: counts?.followUps && counts.followUps > 0 ? counts.followUps : undefined,
    },
    {
      label: isBn ? 'ক্লিনিক্যাল রিপোর্টস' : 'Clinical Reports',
      href: '/clinical/reports',
      icon: React.createElement(FileText, { className: 'size-4' }),
    },
    {
      label: isBn ? 'ক্লিনিক্যাল গভর্ন্যান্স' : 'Clinical Governance',
      href: '/clinical/governance',
      icon: React.createElement(ShieldCheck, { className: 'size-4' }),
    },
    {
      label: isBn ? 'ওয়ার্কফ্লো অ্যানালিটিক্স' : 'Workflow Analytics',
      href: '/clinical/analytics',
      icon: React.createElement(BarChart3, { className: 'size-4' }),
    },
    {
      label: isBn ? 'অডিট হিস্ট্রি' : 'Audit Activity',
      href: '/clinical/activity',
      icon: React.createElement(History, { className: 'size-4' }),
    },
  ]
}

