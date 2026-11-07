'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Bell,
} from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar } from "@/components/ui/avatar"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  badgeVariant?: 'default' | 'destructive' | 'warning' | 'success'
}

export interface DashboardLayoutProps {
  workspaceName: string
  workspaceBadge?: React.ReactNode
  navItems: NavItem[]
  userName?: string
  userRole?: string
  children: React.ReactNode
}

export function DashboardLayout({
  workspaceName,
  workspaceBadge,
  navItems,
  userName = "Dr. Farhana Ahmed",
  userRole = "Clinical Lead",
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-16 sm:h-18 items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Logo size="sm" variant="compact" href="/" />

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/80">
            <span className="text-sm font-semibold text-foreground">{workspaceName}</span>
            {workspaceBadge}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Notifications Placeholder */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="View notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          </button>

          {/* User Menu */}
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-ring"
                aria-label="User profile menu"
              >
                <Avatar fallback={userName} size="sm" status="online" />
                <div className="hidden lg:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-semibold text-foreground">{userName}</span>
                  <span className="text-[10px] text-muted-foreground">{userRole}</span>
                </div>
              </button>
            }
            items={[
              {
                id: 'profile',
                label: 'Profile & Credentials',
                icon: <User className="size-3.5" />,
              },
              {
                id: 'settings',
                label: 'Workspace Settings',
                icon: <Settings className="size-3.5" />,
              },
              'separator',
              {
                id: 'logout',
                label: 'Sign Out',
                icon: <LogOut className="size-3.5" />,
                destructive: true,
              },
            ]}
          />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          aria-label="Sidebar Navigation"
          className={cn(
            "hidden md:flex flex-col border-r border-gray-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-all duration-200",
            isSidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="flex items-center justify-between p-3 border-b border-border/60">
            {isSidebarOpen ? (
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-2">
                Navigation
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground mx-auto"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary hover:translate-x-0.5",
                    !isSidebarOpen && "justify-center px-2 hover:translate-x-0"
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <span className="size-4 shrink-0 flex items-center justify-center">
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                  {isSidebarOpen && item.badge && (
                    <Badge
                      variant={item.badgeVariant || (isActive ? "outline" : "secondary")}
                      size="sm"
                      className="rounded-full px-2"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-64 max-w-xs bg-sidebar p-4 shadow-xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-sm font-semibold">{workspaceName}</span>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-md text-muted-foreground"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <span className="size-4 shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <Badge size="sm">{item.badge}</Badge>}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
