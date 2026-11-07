'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { profileUpdateSchema, type ProfileUpdateInput } from '@/modules/authentication/validation'
import { updateProfile, logout } from '@/modules/authentication/service'
import type { UserWithRoles } from '@/types'
import {
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  Building2,
  Calendar,
  LogOut,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface ProfileClientProps {
  initialUser: UserWithRoles
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserWithRoles>(initialUser)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: initialUser.full_name,
      phoneNumber: initialUser.phone_number || '',
      preferredLanguage: initialUser.preferred_language,
    },
  })

  const preferredLanguageValue = useWatch({ control, name: 'preferredLanguage' })

  const onUpdateProfile = async (data: ProfileUpdateInput) => {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const result = await updateProfile(data)
      if (result.success) {
        setSuccessMessage(result.message || 'Profile successfully updated.')
        setUser((prev) => ({
          ...prev,
          full_name: data.fullName,
          phone_number: data.phoneNumber || null,
          preferred_language: data.preferredLanguage,
        }))
        router.refresh()
      } else {
        setErrorMessage(result.error)
      }
    } catch {
      setErrorMessage('An unexpected error occurred while updating your profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/login')
      router.refresh()
    } catch {
      setIsLoggingOut(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active Account</Badge>
      case 'pending_verification':
        return <Badge variant="warning">Verification Pending</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'deactivated':
        return <Badge variant="outline">Deactivated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Badge variant="destructive">Administrator</Badge>
      case 'clinician':
        return <Badge variant="info">Clinician</Badge>
      case 'healthcare_worker':
        return <Badge variant="secondary">Healthcare Worker</Badge>
      case 'patient':
        return <Badge variant="outline">Patient</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  // Determine portal route for current role
  const getPrimaryWorkspaceRoute = () => {
    if (user.roles.includes('administrator')) return '/admin'
    if (user.roles.includes('clinician')) return '/clinical'
    if (user.roles.includes('healthcare_worker')) return '/healthcare-worker'
    return '/patient'
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              User Profile & Settings
            </h1>
            {getStatusBadge(user.status)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account details, language preference, and clinical workspace access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={getPrimaryWorkspaceRoute()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3.5 py-2 rounded-lg transition-colors"
          >
            Access Primary Portal
            <ArrowRight className="size-3.5" />
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            loading={isLoggingOut}
            leftIcon={<LogOut className="size-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Summary & Roles */}
        <div className="space-y-6 lg:col-span-1">
          {/* Account Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base">{user.full_name}</CardTitle>
                  <CardDescription className="text-xs break-all">{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 text-xs border-t border-border/60">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Member Since
                </span>
                <span className="font-medium text-foreground">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="size-3.5" /> Language
                </span>
                <span className="font-medium text-foreground">
                  English
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Roles & RBAC Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Assigned Roles & Access
              </CardTitle>
              <CardDescription className="text-xs">
                Your role boundaries govern which workspaces and clinical endpoints you can access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <div key={role}>{getRoleBadge(role)}</div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground mb-1">Privilege Management Notice:</p>
                Role elevation (e.g. Community Health Worker, Clinician, System Administrator) requires credential verification by a platform administrator.
              </div>
            </CardContent>
          </Card>

          {/* Facility Affiliations Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Facility Memberships
              </CardTitle>
              <CardDescription className="text-xs">
                Associated healthcare facilities and community clinic stations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              {user.facilities.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No institutional facility affiliations assigned. Standard individual patient access enabled.
                </p>
              ) : (
                <div className="space-y-2">
                  {user.facilities.map((f) => (
                    <div
                      key={f.facility_id}
                      className="p-2.5 rounded-lg border border-border/60 bg-card text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-foreground">{f.facility_id}</div>
                        <div className="text-[11px] text-muted-foreground">{f.facility_role}</div>
                      </div>
                      {f.is_primary && (
                        <Badge variant="secondary" className="text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Profile Information Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal & Contact Information</CardTitle>
              <CardDescription className="text-xs">
                Update your display name, contact phone number, and interface language. Changes are audited for clinical governance.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onUpdateProfile)}>
              <CardContent className="space-y-5">
                {successMessage && (
                  <Alert variant="success">
                    <CheckCircle2 className="size-4" />
                    <AlertTitle>Profile Updated</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertTitle>Update Failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Full Name */}
                <FormField
                  id="fullName"
                  label="Full Name"
                  required
                  error={errors.fullName?.message}
                  helperText="Enter your official full name as registered in clinical health documents."
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fullName"
                      {...register('fullName')}
                      className="pl-9"
                      placeholder="e.g. Dr. Ayesha Rahman"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                {/* Primary Email Address (Read-only) */}
                <FormField
                  id="email"
                  label="Email Address"
                  helperText="Primary authentication identifier. Contact governance administration to update login email."
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      value={user.email}
                      readOnly
                      disabled
                      className="pl-9 bg-muted/50 cursor-not-allowed opacity-80"
                    />
                  </div>
                </FormField>

                {/* Phone Number */}
                <FormField
                  id="phoneNumber"
                  label="Contact Phone Number"
                  error={errors.phoneNumber?.message}
                  helperText="Standard Bangladeshi mobile (+8801XXXXXXXXX) or international E.164 phone number."
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      className="pl-9"
                      placeholder="+88017XXXXXXXX"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                {/* Preferred Language */}
                <FormField
                  id="preferredLanguage"
                  label="Preferred Interface Language"
                  error={errors.preferredLanguage?.message}
                  helperText="Select your default interface language for risk reports and clinical intake."
                >
                  <Select
                    id="preferredLanguage"
                    value={preferredLanguageValue}
                    onChange={(e) => setValue('preferredLanguage', e.target.value as 'en' | 'bn', { shouldDirty: true })}
                    options={[
                      { value: 'en', label: 'English (Default)' },
                    ]}
                    disabled={isSubmitting}
                  />
                </FormField>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/60 pt-5">
                <span className="text-xs text-muted-foreground">
                  {isDirty ? 'Unsaved changes pending' : 'Information is up to date'}
                </span>

                <Button
                  type="submit"
                  variant="default"
                  loading={isSubmitting}
                  disabled={!isDirty || isSubmitting}
                >
                  Save Profile Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Security & Password Card */}
          <Card className="mt-6 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Security & Credentials</CardTitle>
              <CardDescription className="text-xs">
                To update your account password, initiate a verified password reset workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Change or Reset Account Password
                <ExternalLink className="size-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
