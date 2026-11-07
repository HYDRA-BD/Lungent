import type {
  FacilityStatus,
  FacilityVerificationStatus,
  FacilityRole,
  StaffMembershipStatus,
  ServiceAvailabilityStatus,
  FacilityGroupType,
} from '@/types/database'

export interface FacilityType {
  id: string
  name: string
  nameBn: string
  description?: string | null
  isActive: boolean
  createdAt: string
}

export interface FacilityOwnershipCategory {
  id: string
  name: string
  nameBn: string
  description?: string | null
  isActive: boolean
  createdAt: string
}

export interface FacilityServiceItem {
  id: string
  name: string
  nameBn: string
  category: 'respiratory_specialty' | 'radiology_imaging' | 'laboratory_pathology' | 'screening_prevention' | 'general_care' | 'community_outreach'
  description?: string | null
  isActive: boolean
  createdAt: string
}

export interface FacilityGroupItem {
  id: string
  code: string
  name: string
  nameBn: string
  groupType: FacilityGroupType
  parentGroupId?: string | null
  description?: string | null
  createdAt: string
}

export interface FacilityServiceMapping {
  id: string
  facilityId: string
  serviceId: string
  serviceName: string
  serviceNameBn: string
  serviceCategory: string
  availabilityStatus: ServiceAvailabilityStatus
  isVerified: boolean
  notes?: string | null
  updatedAt: string
}

export interface FacilityStaffMember {
  id: string
  userId: string
  facilityId: string
  facilityRole: FacilityRole
  status: StaffMembershipStatus
  isPrimary: boolean
  department?: string | null
  joinedAt: string
  leftAt?: string | null
  approvedBy?: string | null
  approvalNotes?: string | null
  createdAt: string
  updatedAt: string
  // Hydrated user profile details
  user?: {
    id: string
    fullName: string
    email: string
    phoneNumber?: string | null
    role?: string
  }
}

export interface FacilityStatusHistoryItem {
  id: string
  facilityId: string
  fromStatus: FacilityStatus
  toStatus: FacilityStatus
  reason?: string | null
  changedBy?: string | null
  changedByName?: string | null
  createdAt: string
}

export interface FacilityAuditEventItem {
  id: string
  facilityId: string
  eventType: string
  actorId?: string | null
  actorName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>
  ipAddress?: string | null
  createdAt: string
}

export interface HealthcareFacility {
  id: string
  facilityId: string // canonical FAC-YYYY-XXXXXX
  name: string
  nameBn: string
  facilityTypeId: string
  facilityTypeName?: string
  ownershipCategoryId: string
  ownershipCategoryName?: string
  status: FacilityStatus
  statusReason?: string | null
  groupId?: string | null
  groupName?: string | null
  countryCode: string
  division: string
  district: string
  upazila: string
  unionMunicipality?: string | null
  ward?: string | null
  addressLine: string
  latitude?: number | null
  longitude?: number | null
  contactPhone?: string | null
  contactEmail?: string | null
  contactPersonName?: string | null
  contactPersonRole?: string | null
  websiteUrl?: string | null
  verificationStatus: FacilityVerificationStatus
  verificationSource?: string | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verifiedByName?: string | null
  verificationNotes?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operationalCapacity: Record<string, any>
  registeredBy?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
  services?: FacilityServiceMapping[]
  staffMembers?: FacilityStaffMember[]
}

export type Facility = HealthcareFacility

export interface RegisterFacilityInput {
  name: string
  nameBn?: string
  facilityTypeId: string
  ownershipCategoryId: string
  groupId?: string | null
  countryCode?: string
  division: string
  district: string
  upazila: string
  unionMunicipality?: string | null
  ward?: string | null
  addressLine: string
  latitude?: number | null
  longitude?: number | null
  contactPhone?: string | null
  contactEmail?: string | null
  contactPersonName?: string | null
  contactPersonRole?: string | null
  websiteUrl?: string | null
  selectedServices?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operationalCapacity?: Record<string, any>
}

export interface UpdateFacilityInput {
  name?: string
  nameBn?: string
  facilityTypeId?: string
  ownershipCategoryId?: string
  groupId?: string | null
  division?: string
  district?: string
  upazila?: string
  unionMunicipality?: string | null
  ward?: string | null
  addressLine?: string
  latitude?: number | null
  longitude?: number | null
  contactPhone?: string | null
  contactEmail?: string | null
  contactPersonName?: string | null
  contactPersonRole?: string | null
  websiteUrl?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operationalCapacity?: Record<string, any>
}

export interface SearchFacilitiesInput {
  query?: string
  facilityTypeId?: string
  ownershipCategoryId?: string
  division?: string
  district?: string
  upazila?: string
  status?: FacilityStatus
  verificationStatus?: FacilityVerificationStatus
  serviceId?: string
  page?: number
  pageSize?: number
}

export interface ChangeFacilityStatusInput {
  status: FacilityStatus
  reason?: string
}

export interface VerifyFacilityInput {
  verificationStatus: FacilityVerificationStatus
  verificationSource: string
  verificationNotes?: string
}

export interface AssignStaffInput {
  userId: string
  fullName?: string
  facilityRole: FacilityRole
  isPrimary?: boolean
  department?: string | null
  approvalNotes?: string | null
}

export interface UpdateStaffMembershipInput {
  status: StaffMembershipStatus
  facilityRole?: FacilityRole
  department?: string | null
  approvalNotes?: string | null
}

export interface ConfigureServicesInput {
  services: {
    serviceId: string
    availabilityStatus: ServiceAvailabilityStatus
    isVerified?: boolean
    notes?: string | null
  }[]
}
