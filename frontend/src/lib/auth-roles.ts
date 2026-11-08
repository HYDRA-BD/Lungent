/**
 * Lungent Strict Role-Based Access Control (RBAC) System
 * Defines the 6 canonical application roles, route guards, and portal visibility matrix.
 */

export const APP_ROLES = [
  'General User',
  'Clinician',
  'AI Builders Congress',
  'Health Worker',
  'Admin',
  'Governance',
] as const

export type AppRole = (typeof APP_ROLES)[number]

export interface RoleDescriptor {
  role: AppRole
  title: string
  description: string
  badgeColor: string
}

export const ROLE_DESCRIPTIONS: Record<AppRole, RoleDescriptor> = {
  'General User': {
    role: 'General User',
    title: 'General User / Patient',
    description: 'Patient and community member accessing AI Risk Assessment and personal health tools.',
    badgeColor: 'border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
  },
  'Clinician': {
    role: 'Clinician',
    title: 'Clinician / Pulmonologist',
    description: 'Licensed medical practitioner, pulmonologist, or oncologist reviewing triage and CT pathways.',
    badgeColor: 'border-sky-500/40 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40',
  },
  'AI Builders Congress': {
    role: 'AI Builders Congress',
    title: 'AI Builders Congress',
    description: 'Hackathon committee, model evaluator, and technical jury with unrestricted system access.',
    badgeColor: 'border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40',
  },
  'Health Worker': {
    role: 'Health Worker',
    title: 'Health Worker / CHW',
    description: 'Community health worker performing remote screening intake and rural population triage.',
    badgeColor: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40',
  },
  'Admin': {
    role: 'Admin',
    title: 'System Administrator',
    description: 'Platform infrastructure administrator overseeing facilities, security audits, and accounts.',
    badgeColor: 'border-indigo-500/40 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40',
  },
  'Governance': {
    role: 'Governance',
    title: 'Clinical Governance & Safety',
    description: 'Clinical advisory board overseeing algorithmic equity, model performance, and safety audit logs.',
    badgeColor: 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40',
  },
}

/**
 * Normalizes any legacy or arbitrary string into a validated AppRole,
 * falling back to 'General User' if unmatched.
 */
export function normalizeAppRole(raw?: string | null): AppRole {
  if (!raw) return 'General User'
  const trimmed = raw.trim()
  if (APP_ROLES.includes(trimmed as AppRole)) {
    return trimmed as AppRole
  }
  // Case-insensitive / legacy aliases
  const lower = trimmed.toLowerCase()
  if (lower.includes('clinician') || lower.includes('doctor') || lower.includes('physician')) {
    return 'Clinician'
  }
  if (lower.includes('congress') || lower.includes('builder') || lower.includes('judge')) {
    return 'AI Builders Congress'
  }
  if (lower.includes('worker') || lower.includes('chw') || lower.includes('health')) {
    return 'Health Worker'
  }
  if (lower.includes('admin') || lower.includes('administrator')) {
    return 'Admin'
  }
  if (lower.includes('governance') || lower.includes('board') || lower.includes('safety')) {
    return 'Governance'
  }
  return 'General User'
}

/**
 * Checks if the user is authorized to view the /docs page.
 * Allowed ONLY for 'Admin' and 'AI Builders Congress'.
 */
export function canAccessDocs(role: AppRole | null | undefined): boolean {
  if (!role) return false
  return role === 'Admin' || role === 'AI Builders Congress'
}

/**
 * Checks if the user should see the Portals navigation item.
 * General Users and unauthenticated visitors cannot see the Portals menu.
 */
export function canSeePortalsDropdown(role: AppRole | null | undefined): boolean {
  if (!role) return false
  return role !== 'General User'
}

export interface PortalLinkItem {
  href: string
  label: string
  desc: string
  iconType: 'patient' | 'chw' | 'clinician' | 'admin' | 'governance'
  iconBg: string
  badge: string
}

/**
 * Strict Access Matrix: Returns which portals are visible to the user's role.
 * - General User: HIDDEN (empty array)
 * - Clinician: ONLY Clinician Portal
 * - Health Worker: ONLY Health Worker Portal
 * - Governance: ONLY Governance Portal
 * - Admin & AI Builders Congress: ALL portals
 */
export function getAllowedPortalLinks(role: AppRole | null | undefined): PortalLinkItem[] {
  if (!role || role === 'General User') {
    return []
  }

  const clinicianPortal: PortalLinkItem = {
    href: '/portal/clinician',
    label: 'Clinician Portal',
    desc: 'Interpretable ML & 3-tier policy',
    iconType: 'clinician',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    badge: 'Demo',
  }

  const healthWorkerPortal: PortalLinkItem = {
    href: '/portal/community',
    label: 'Health Worker Portal',
    desc: 'Field screening intake demo',
    iconType: 'chw',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    badge: 'Demo',
  }

  const governancePortal: PortalLinkItem = {
    href: '/portal/admin',
    label: 'Governance Portal',
    desc: 'Clinical governance & equity audit',
    iconType: 'governance',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    badge: 'Demo',
  }

  const adminPortal: PortalLinkItem = {
    href: '/portal/admin',
    label: 'Admin Portal',
    desc: 'Multi-facility oversight & audit',
    iconType: 'admin',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    badge: 'Demo',
  }

  const patientPortal: PortalLinkItem = {
    href: '/portal/patient',
    label: 'Patient Portal',
    desc: 'Personal risk & health record',
    iconType: 'patient',
    iconBg: 'bg-primary/10 text-primary',
    badge: 'Demo',
  }

  switch (role) {
    case 'Clinician':
      return [clinicianPortal]

    case 'Health Worker':
      return [healthWorkerPortal]

    case 'Governance':
      return [governancePortal]

    case 'Admin':
      return [patientPortal, healthWorkerPortal, clinicianPortal, adminPortal]

    case 'AI Builders Congress':
      return [patientPortal, healthWorkerPortal, clinicianPortal, adminPortal, governancePortal]

    default:
      return []
  }
}

/**
 * Route protection validator for Middleware / Proxy.
 * Enforces strict site lock: unauthenticated users cannot access any route except
 * auth entrypoints and '/' (which serves the locked Cinematic Presentation).
 */
export function evaluateRouteAccess(
  pathname: string,
  isAuthenticated: boolean,
  role: AppRole | null | undefined
): { allowed: boolean; redirectPath?: string } {
  const isAuthOrSystemPath =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api')

  // Unauthenticated users are strictly guarded:
  // - '/' is allowed to render the locked Cinematic Presentation (which routes to /login upon completion or skip)
  // - Auth pages and system routes are allowed
  // - All other routes are locked and redirect immediately to /login
  if (!isAuthenticated) {
    if (pathname === '/' || isAuthOrSystemPath) {
      return { allowed: true }
    }
    return { allowed: false, redirectPath: '/login' }
  }

  // 1. Documentation route: Protected, strictly restricted to Admin & AI Builders Congress
  if (pathname.startsWith('/docs')) {
    if (!canAccessDocs(role)) {
      return { allowed: false, redirectPath: '/unauthorized' }
    }
    return { allowed: true }
  }

  // 2. AI Assessment & prediction endpoints: Must be signed in (any valid role allowed)
  if (pathname.startsWith('/ai-assessment') || pathname.startsWith('/predict') || pathname.startsWith('/assessment')) {
    return { allowed: true }
  }

  // 3. Portals and Internal Workspaces
  const isPortalRoute =
    pathname.startsWith('/portal') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/healthcare-worker') ||
    pathname.startsWith('/clinical') ||
    pathname.startsWith('/admin')

  if (isPortalRoute) {
    if (!isAuthenticated) {
      return { allowed: false, redirectPath: '/login' }
    }

    // General Users have no access to portal workspaces
    if (role === 'General User') {
      return { allowed: false, redirectPath: '/unauthorized' }
    }

    // Admins and AI Builders Congress have universal portal access
    if (role === 'Admin' || role === 'AI Builders Congress') {
      return { allowed: true }
    }

    // Clinician restricted to clinician workspaces
    if (role === 'Clinician') {
      if (pathname.startsWith('/portal/clinician') || pathname.startsWith('/clinical')) {
        return { allowed: true }
      }
      return { allowed: false, redirectPath: '/unauthorized' }
    }

    // Health Worker restricted to community/worker workspaces
    if (role === 'Health Worker') {
      if (pathname.startsWith('/portal/community') || pathname.startsWith('/healthcare-worker')) {
        return { allowed: true }
      }
      return { allowed: false, redirectPath: '/unauthorized' }
    }

    // Governance restricted to admin/governance workspaces
    if (role === 'Governance') {
      if (
        pathname.startsWith('/portal/admin') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/clinical/governance')
      ) {
        return { allowed: true }
      }
      return { allowed: false, redirectPath: '/unauthorized' }
    }
  }

  return { allowed: true }
}

